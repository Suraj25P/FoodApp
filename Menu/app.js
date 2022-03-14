const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

require('dotenv').config()
const app = express()


const getItem = require('./routes/getItem')
const editItem = require('./routes/editItem')
const deleteItem= require('./routes/deleteItem')
const addItem = require('./routes/addItem')
const { requireAuth } = require('@srpfoodapp/comman/index')
const natsWrapper = require('./events/nats-wrapper')

app.use(express.json())
app.use(cors({
  origin: "http://localhost:3000",
  credentials:true
}))

app.use(requireAuth)
//app.use(isAdmin)

app.use(getItem)
app.use(editItem)
app.use(deleteItem)
app.use(addItem)


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
      await natsWrapper.connect(process.env.CLUSTED_ID,'menuclientID',process.env.NATS_URL)
      console.log('connected to Nats client')
      natsWrapper.client.on('close', () => {
          console.log("nats connection closed")
          process.exit()
      })
      process.on('SIGINT',()=> natsWrapper.client.close())
      process.on('SIGTERM', () => natsWrapper.client.close())
    }
    catch (err) {
      console.error(err)
    }
  
    app.listen(process.env.PORT, () => {
    console.log(`Menu service Listening on port ${process.env.PORT}`)
    })
    

}
start()