const express = require('express');
const Payments = require('../models/payments');
const router = express.Router()
const { body, validationResult } = require('express-validator');
const { Subject, Publisher ,isAdmin, requireAuth} = require('@srpfoodapp/comman');
const natsWrapper = require('../events/nats-wrapper')
const crypto = require("crypto");
const mongoose = require("mongoose")

router.post('/api/payment/checkout',requireAuth, [
        body('total')
        .trim()
        .notEmpty()
        .withMessage('total  is required'),
        body('cartItems')
        .trim()
        .notEmpty()
        .withMessage('cartItems are required'),
],async (req, res) => {
    const valErr = validationResult(req)
    if (!valErr.isEmpty()) {
            errors = valErr.array()
            errorList = errors.map(err => {
                     return {message : err.msg , field:err.param}
            })
        
        return res.send({errors:errorList})
        }

    const { total, cartItems } = req.body
    console.log(cartItems,total)
    //generate a random payment ID...in reality this comes from stripe
    var paymentId = crypto.randomBytes(10).toString('hex');
    //generate a mongo Object ID ... this will be the order ID
    //console.log(req.currentUser)
    const orderId =  mongoose.Types.ObjectId();
    
    try {
        const newPayment = new Payments({
            orderId,
            paymentId
        })
        await newPayment.save()
        const data = JSON.stringify({
            owner:req.currentUser._id,
            orderId,
            cartItems:JSON.parse(cartItems),
            total
        })
        let PaymentCompletedPublisher = new Publisher(natsWrapper.client, Subject.PaymentComplete);
        console.log(data)
        await PaymentCompletedPublisher.publish(data)
        let sendMessagePublisher = new Publisher(natsWrapper.client, Subject.SendMessage);
        const data_ = JSON.stringify({
            message: "We have recieved your payment and your order is placed",
            to:req.currentUser.phoneNo
        })       
        await sendMessagePublisher.publish(data_)       
        let clearCartPublisher = new Publisher(natsWrapper.client, Subject.clearCart);
        const data__ = JSON.stringify({
            owner:req.currentUser._id
        })       
        await clearCartPublisher.publish(data__)       
        return res.send({paymentStatus:"OK"}) 
        
    } catch (err){
        console.log(err)
        return res.send({ errors: [{ message: "Payment failed....plz try again.."}]})
    }

})
module.exports = router