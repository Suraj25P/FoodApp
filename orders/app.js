const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()
const { Subject,Listener ,requireAuth} = require('@srpfoodapp/comman');
const natsWrapper = require('./events/nats-wrapper')
const Order = require('./models/order')
const User = require('./models/user')


const app = express()
app.use(express.json())
app.use(cors({
  origin: "http://localhost:3000",
  credentials:true
}))

app.use(requireAuth)


const getuserOrders = require('./routes/getuserOrders');
const getAllOrders = require('./routes/getAllOrders')
const updateStatus = require('./routes/updateStatus')
app.use(getuserOrders)
app.use(getAllOrders)
app.use(updateStatus)




const start = async () => {
    try {
    console.log('connecting to DB')
      await mongoose.connect(process.env.MONGO_URI)
      console.log('connected to DB')
    }
    catch (err) {
      console.error(err)
  }
  try {
    console.log('connecting to Nats client')
    await natsWrapper.connect(process.env.CLUSTED_ID,'orderClientID',process.env.NATS_URL)
    console.log('connected to Nats client')
    natsWrapper.client.on('close', () => {
        console.log("nats connection closed")
        process.exit()
    })
    process.on('SIGINT',()=> natsWrapper.client.close())
    process.on('SIGTERM', () => natsWrapper.client.close())

        const UserCreatedListeneronMessage = async(data,msg) => {
        const { userId,phoneNo,name } = JSON.parse(data)
          const user = new User({
            _id: userId,
            phoneNo,
            name
            
          })
          await user.save()
          msg.ack()
      }
    let UserCreatedListener = new Listener(natsWrapper.client, "order-service", Subject.UserCreated, UserCreatedListeneronMessage)
    UserCreatedListener.listen()
    
    const PaymentComepletedListeneronMessage = async(data,msg) => {
      const { orderId, cartItems, total, owner } = JSON.parse(data)
      console.log("NEW ORDER" , orderId, cartItems, total, owner )
        const itemList = cartItems.map(item => {
          return {
              itemName: item.itemId.name,
              quantity: item.quantity
              }
        })
        const order = new Order({
              owner,
              _id: orderId,
             total,
              items:itemList,
            status:'created'
          })
        await order.save()
        msg.ack()
      }
    
      let PaymentComepletedListener = new Listener(natsWrapper.client, "order-service", Subject.PaymentComplete, PaymentComepletedListeneronMessage)
      PaymentComepletedListener.listen()
    
  }
  catch (err) {
    console.log(err)
  }
    app.listen(process.env.PORT, () => {
    console.log(`Order service Listening on port ${process.env.PORT}`)
    })
    

}
start()