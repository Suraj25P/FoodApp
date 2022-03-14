const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')


require('dotenv').config()
const app = express()

app.use(express.json())
app.use(cors({
  origin: "http://localhost:3000",
  credentials:true
}))


const currentuser = require('./routes/currentuser')
const register = require('./routes/register')
const login= require('./routes/login')
const logout = require('./routes/logout')
const natsWrapper = require('./events/nats-wrapper')



app.use(currentuser)
app.use(register)
app.use(login)
app.use(logout)


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
      await natsWrapper.connect(process.env.CLUSTED_ID,'authclientID',process.env.NATS_URL)
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
    console.log(`Auth service Listening on port ${process.env.PORT}`)
    })
    

}
start()