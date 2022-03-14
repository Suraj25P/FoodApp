const { requireAuth } = require('@srpfoodapp/comman');
const express = require('express');
const Order = require('../models/order');
const router = express.Router()
router.get('/api/orders/user',requireAuth, async (req, res) => {
    try{
        const orders = await Order.find({ "owner": req.currentUser }).sort('-createdAt');
        console.log(orders)
        res.send({orders})
    }catch( error ){
        console.log(error)
        return res.send({ errors: [{ message: "Sorry.Unable to fetch your Orders...plz try again later.."}]})
    }
})
module.exports = router