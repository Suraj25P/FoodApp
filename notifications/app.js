const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { Subject,Listener ,requireAuth} = require('@srpfoodapp/comman');
const natsWrapper = require('./events/nats-wrapper')
const sid = process.env.SID
const auth_token = process.env.AUTH_TOKEN
const twilio = require('twilio')(sid,auth_token)



const app = express()
app.use(express.json())
app.use(cors({
  origin: "http://localhost:3000",
  credentials:true
}))


const send = (to,msg) => {
twilio.messages.create({
    from: process.env.TWILLIO_NO,
    to: `+91${to}`,
    body:msg
})
  
}






const start = async () => {
  try {
          console.log('connecting to Nats client')
    await natsWrapper.connect(process.env.CLUSTED_ID,'notificationClientID',process.env.NATS_URL)
    console.log('connected to Nats client')
    natsWrapper.client.on('close', () => {
        console.log("nats connection closed")
        process.exit()
    })
    process.on('SIGINT',()=> natsWrapper.client.close())
    process.on('SIGTERM', () => natsWrapper.client.close())

      const sendMessageListenerOnMessage = async(data,msg) => {
        const { message, to } = JSON.parse(data)
        console.log(`MESSAGE SENT ${to} ... ${message}`)
        //send(message,to)

      }
      let sendMessageListener = new Listener(natsWrapper.client, "notification-service", Subject.SendMessage, sendMessageListenerOnMessage)
      sendMessageListener.listen()
  }
  catch (err) {
    console.log(err)
  }
    app.listen(process.env.PORT, () => {
    console.log(`Notifications service Listening on port ${process.env.PORT}`)
    })
    

}
start()