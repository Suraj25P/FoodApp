const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const { Subject,Listener ,requireAuth} = require('@srpfoodapp/comman');
const natsWrapper = require('./events/nats-wrapper')
const Cart = require('./models/cart')
const Menu = require('./models/menu')


const app = express()
app.use(express.json())

app.use(cors({
  origin: "http://localhost:3000",
  credentials:true
}))



const getCart = require('./routes/getCart')
const addToCart = require('./routes/addItem')
const deleteFromCart = require('./routes/deleteItem')
app.use(requireAuth)
app.use(getCart)
app.use(addToCart)
app.use(deleteFromCart)

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
      await natsWrapper.connect(process.env.CLUSTED_ID,'cartclientID',process.env.NATS_URL)
      console.log('connected to Nats client')
      natsWrapper.client.on('close', () => {
          console.log("nats connection closed")
          process.exit()
      })
      process.on('SIGINT',()=> natsWrapper.client.close())
      process.on('SIGTERM', () => natsWrapper.client.close())
      const UserCreatedListeneronMessage = async(data,msg) => {
        const { userId } = JSON.parse(data)
          const cart = new Cart({
              owner : userId
          })
          await cart.save()
          msg.ack()
      }
      let UserCreatedListener = new Listener(natsWrapper.client, "cart-service", Subject.UserCreated, UserCreatedListeneronMessage)
      UserCreatedListener.listen()
      
    const ItemAddedListeneronMessage = async (data, msg) => {
          const {name,category,description,photo,price,todaysSpecial,Avaliable,_id} = JSON.parse(data).newItem;
          const Item = {
              name,category,description,photo,price,todaysSpecial,Avaliable,_id
          }
          const newItem = new Menu(Item);
          await newItem.save()
          msg.ack()
      }
      let ItemAddedListener = new Listener(natsWrapper.client, "cart-service", Subject.ItemCreated, ItemAddedListeneronMessage)
      ItemAddedListener.listen()


     const ItemEiditedListeneronMessage = async(data,msg) => {
          const {name,category,description,photo,price,todaysSpecial,Avaliable,_id} = JSON.parse(data).result;
          const editItem = {
              name,category,description,photo,price,todaysSpecial,Avaliable,_id
          }
          const newItem = await Menu.updateOne({ _id: editItem._id }, editItem);
          console.log(newItem)
          msg.ack()
      }

      let ItemEiditedListener = new Listener(natsWrapper.client, "cart-service", Subject.ItemEdited, ItemEiditedListeneronMessage)
    ItemEiditedListener.listen()
    

    const ItemDeletedListeneronMessage = async (data, msg) => {
          const {id} = JSON.parse(data);
          const deletedItem = await Menu.deleteOne({ _id: id });
          msg.ack()
      }
      let ItemDeletedListener = new Listener(natsWrapper.client, "cart-service", Subject.ItemDeleted, ItemDeletedListeneronMessage)
    ItemDeletedListener.listen()

    const clearCartListeneronMessage = async (data, msg) => {
        const {owner} = JSON.parse(data);
        await Cart.updateOne({owner},{$set:{'items':[]}})
        msg.ack()
      }
      let ClearCartListener = new Listener(natsWrapper.client, "cart-service", Subject.clearCart, clearCartListeneronMessage)
    ClearCartListener.listen()
    

    }

    
    catch (err) {
      console.error(err)
    }
    app.listen(process.env.PORT, () => {
    console.log(`cart service Listening on port ${process.env.PORT}`)
    })
    

}
start()


//app.use(isAdmin)





// LISTENRS .....




