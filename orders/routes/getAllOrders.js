const { requireAuth, isAdmin } = require('@srpfoodapp/comman');
const express = require('express');
const Order = require('../models/order');
const router = express.Router()

router.get('/api/orders/active',requireAuth,isAdmin, async (req, res) => {
    try{
        const orders = await Order.find().sort('-createdAt').populate("owner");
        console.log(orders)
        res.send({orders})
    }catch( error ){
        console.log(error)
        return res.send({ errors: [{ message: "Sorry.Unable to fetch your Orders...plz try again later.."}]})
    }
})

// router.get('/api/orders/all',requireAuth,isAdmin, async (req, res) => {
//     try{
//         const orders = await Order.find().sort('-createdAt');
//         console.log(orders)
//         res.send({orders})
//     }catch( error ){
//         console.log(error)
//         return res.send({ errors: [{ message: "Sorry.Unable to fetch your Orders...plz try again later.."}]})
//     }
// })
module.exports = router