const express = require('express');
const router = express.Router()
const { body, validationResult } = require('express-validator');
const Cart = require('../models/cart');
router.post('/api/cart/delete',[
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
    const { itemId } = req.body
    console.log(itemId)
    Cart.findOneAndUpdate({"owner" :req.currentUser }, {
        $pull: { items: {itemId:itemId}}
        }, { new: true }).exec((err, result) => {
            if (err) {
                console.log(err)
                return res.send({ errors: [{ message: "Sorry.Unable to delete this item to cart...plz try again later.." }] })
            }
            else {
                console.log("delete from cart result", result)
                return res.send({result})
            }
        })

})
module.exports = router