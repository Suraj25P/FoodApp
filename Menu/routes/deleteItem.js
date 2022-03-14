const express = require('express');
const Menu = require('../models/menu');
const router = express.Router()
const { Subject, Publisher ,isAdmin} = require('@srpfoodapp/comman');
const natsWrapper = require('../events/nats-wrapper')

router.delete('/api/menu/delete/:itemId',isAdmin, async (req, res) => {
    console.log("in DEL")
    try {
        Menu.findByIdAndDelete({ _id: req.params.itemId }, async(err, result) => {
            if (err) {
                console.log("err", err)
                return res.send(err);
            } else { 
                console.log("res", result)
                const data = JSON.stringify({
                    id: result._id
                })
                console.log(data)
                let itemDeletedPublisher = new Publisher(natsWrapper.client, Subject.ItemDeleted);
                await itemDeletedPublisher.publish(data)
                return res.send(result);
            }
        })
        // const deletedItem = await Menu.deleteOne({ _id: req.params.itemId });
        // const data = JSON.stringify({
        //     ...deletedItem
        // })
        // let itemDeletedPublisher = new Publisher(natsWrapper.client, Subject.ItemDeleted);
        // await itemDeletedPublisher.publish(data)
        // res.send({deletedItem})
    } catch( error ){
        console.log(error)
        return res.send({ errors: [{ message: "Sorry.Unable to delete item...plz try again later.."}]})
    }
})
module.exports = router