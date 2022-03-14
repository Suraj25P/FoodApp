const express = require('express');
const Menu = require('../models/menu');
const router = express.Router()

router.get('/api/menu/', async(req, res) => {
    try{
        // finding something inside a model is time taking, so we need to add await
        const menuItems = await Menu.find();
        res.send({menuItems})
    }catch( error ){
        console.log(error)
        return res.send({ errors: [{ message: "Sorry.Unable to fetch menu...plz try again later.."}]})
    }
})
router.get('/api/menu/:itemId', async(req, res) => {
    try{
        // finding something inside a model is time taking, so we need to add await
        const menuItems = await Menu.findById(req.params.itemId);
        res.send({menuItems})
    }catch( error ){
        console.log(error)
        return res.send({ errors: [{ message: "Sorry.Unable to fetch menu...plz try again later.."}]})
    }
})
module.exports = router