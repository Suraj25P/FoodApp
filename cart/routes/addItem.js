const express = require('express');
const router = express.Router()
const { body, validationResult } = require('express-validator');
const Menu = require('../models/menu');
const Cart = require('../models/cart');
router.post('/api/cart/add',[
    body('itemId')
        .trim()
        .notEmpty()
        .withMessage('item  is required'),  
], async (req, res) => {
    const valErr = validationResult(req)
    if (!valErr.isEmpty()) {
            errors = valErr.array()
            errorList = errors.map(err => {
                     return {message : err.msg , field:err.param}
            })
        
        return res.send({errors:errorList})
    }
    const { itemId ,quantity} = req.body
    const item = await Menu.findById(itemId)
    if (!item)
        return res.send({ errors: [{ message: "Sorry.Unable to find this item ...plz try again later.." }] }) 
    const count = await Cart.find({ "owner": req.currentUser }, { items: { $in: itemId } }).count()
    console.log(count)
    //if (count == 0) {
        console.log("in count = 0 ")
        Cart.findOneAndUpdate({ "owner": req.currentUser }, {
            $push: { items: { quantity: quantity, itemId: itemId } }
        }, { new: true }).exec((err, result) => {
            if (err) {
                console.log(err)
                return res.send({ errors: [{ message: "Sorry.Unable to add this item to cart...plz try again later.." }] })
            }
            else {
                console.log("add to cart result", result)
                return res.send({ result })
            }
        })
    // }
    // else {
    //     //item has been added before
    //     console.log("in count = 1 ")
    //     Cart.findOneAndUpdate({ "owner": req.currentUser, "items.itemId":itemId }, {
    //         quantity:quantity
    //     }, { new: true }).exec((err, result) => {
    //         if (err) {
    //             console.log(err)
    //             return res.send({ errors: [{ message: "Sorry.Unable to add this item to cart...plz try again later.." }] })
    //         }
    //         else {
    //             console.log("add to cart result", result)
    //             return res.send({ result })
    //         }
    //     })
    // }

})
module.exports = router