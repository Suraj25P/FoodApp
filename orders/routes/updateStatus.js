const { requireAuth, isAdmin ,Publisher} = require('@srpfoodapp/comman');
const express = require('express');
const { populate } = require('../models/order');
const Order = require('../models/order');
const router = express.Router()

router.post('/api/orders/update',requireAuth,isAdmin, async (req, res) => {
    const { id, status,phoneNo } = req.body
    console.log(id,status)
    try{
        //const newItem = await Menu.updateOne({ _id: req.params.itemId }, editItem);
        Order.findByIdAndUpdate({ _id: id },{"status":status} , {new: true}, async(err, result) => {
            if (err) {
                console.log("err",err)
                return res.send(err);
            } else {
                console.log(result)
                let sendMessagePublisher = new Publisher(natsWrapper.client, Subject.SendMessage);
                const data_ = JSON.stringify({
                    message: `Your ORDER is ${status}....Thanks for choosing foodAPP`,
                    to:phoneNo
                })       
                await sendMessagePublisher.publish(data_)  
                return res.send(result);
            }
        })

    } catch (error) {
        console.log(error)
        return res.send({ errors: [{ message: "Sorry.Unable to change Status ...plz try again later.."}]})     
    }
})


module.exports = router