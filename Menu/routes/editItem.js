const express = require('express');
const Menu = require('../models/menu');
const router = express.Router()
const { Subject, Publisher ,isAdmin} = require('@srpfoodapp/comman');
const natsWrapper = require('../events/nats-wrapper')

router.put('/api/menu/edit/:itemId',isAdmin, async(req, res) => {
    // let existingItem = await Menu.findById(request.params.itemId);
    console.log("here")
    const {name,category,description,photo,price,todaysSpecial,Avaliable } = req.body;
    const editItem = {name,category,description,photo,price,todaysSpecial,Avaliable }
    console.log("ei",editItem)
    try{
        //const newItem = await Menu.updateOne({ _id: req.params.itemId }, editItem);
        Menu.findByIdAndUpdate({ _id: req.params.itemId },editItem , {new: true}, async(err, result) => {
            if (err) {
                console.log("err",err)
                return res.send(err);
            } else {
                console.log(result)
                const data = JSON.stringify({
                    result
                })
                console.log(data)
                let itemEditedPublisher = new Publisher(natsWrapper.client, Subject.ItemEdited);
                await itemEditedPublisher.publish(data)
                return res.send(result);
            }
        })

        // const data = JSON.stringify({
        //     editItem
        // })
        // console.log(data)
        // let itemEditedPublisher = new Publisher(natsWrapper.client, Subject.ItemEdited);
        // await itemEditedPublisher.publish(data)
        // res.send({newItem})
    } catch (error) {
        console.log(error)
        return res.send({ errors: [{ message: "Sorry.Unable to edit item ...plz try again later.."}]})     
    }
})
module.exports = router