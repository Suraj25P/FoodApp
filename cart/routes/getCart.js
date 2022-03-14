const express = require('express');
const Cart = require('../models/cart');
const router = express.Router()
router.get('/api/cart/', async (req, res) => {
    try{
        const cart = await Cart.findOne({ "user": req.currentUser }).populate('items.itemId').exec()
        console.log(cart)
        let totalPrice = 0
        cart.items.forEach(element => {
            totalPrice = totalPrice + element.quantity*element.itemId.price
        });
        res.send({items:cart.items , totalPrice})
    }catch( error ){
        console.log(error)
        return res.send({ errors: [{ message: "Sorry.Unable to fetch your cart...plz try again later.."}]})
    }
})
module.exports = router