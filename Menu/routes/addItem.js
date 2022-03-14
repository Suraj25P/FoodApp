const express = require('express');
const Menu = require('../models/menu');
const router = express.Router()
const { body, validationResult } = require('express-validator');
const { Subject, Publisher ,isAdmin} = require('@srpfoodapp/comman');
const natsWrapper = require('../events/nats-wrapper')

router.post('/api/menu/add',isAdmin,[
    body('name')
        .trim()
        .notEmpty()
        .withMessage('item name is required'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('item description is required'),
    body('price')
        .trim()
        .notEmpty()
        .isNumeric()
        .withMessage('item price is required'),
    body('photo')
        .trim()
        .notEmpty()
        .withMessage('item photo is required'),
    body('todaysSpecial')
        .trim()
        .notEmpty()
        .withMessage('Special Item field is required'),
    body('Avaliable')
        .trim()
        .notEmpty()
        .withMessage("Item Availablility is required"),
    
], async (req, res) => {
    const valErr = validationResult(req)
    if (!valErr.isEmpty()) {
            errors = valErr.array()
            errorList = errors.map(err => {
                     return {message : err.msg , field:err.param}
            })
        
        return res.send({errors:errorList})
        }
    const {name,category,description,photo,price,todaysSpecial,Avaliable } = req.body;
    console.log("inside")
    const Item = {
        name,category,description,photo,price,todaysSpecial,Avaliable
    }
    const newItem = new Menu(Item);
    try{
        await newItem.save();
        console.log(newItem)
        const data = JSON.stringify({
            newItem
        })
        console.log("DATA", data)
        let itemAddedPublisher = new Publisher(natsWrapper.client, Subject.ItemCreated);
        await itemAddedPublisher.publish(data)
        res.send({newItem})
    } catch (error){
        console.log(error)
        return res.send({ errors: [{ message: "Sorry.Unable to add item ...plz try again later.."}]})   
    }
})
module.exports = router