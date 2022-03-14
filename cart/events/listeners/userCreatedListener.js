const { Subject,Listener } = require('@srpfoodapp/comman');
const natsWrapper = require('../nats-wrapper')
const Cart = require('../../models/cart')

const UserCreatedListeneronMessage = async(data,msg) => {
    const { userId } = data
    const cart = new Cart({
        owner : userId
    })
    await cart.save()
    msg.ack()
}
let UserCreatedListener = new Listener(natsWrapper.client, "cart-service", Subject.UserCreated, UserCreatedListeneronMessage)
UserCreatedListener.listen()


const ItemAddedListeneronMessage = async(data,msg) => {
    const {name,category,description,photo,price,todaysSpecial,Avaliable,_id} = data;
    const Item = {
        name,category,description,photo,price,todaysSpecial,Avaliable,_id
    }
    const newItem = new Menu(Item);
    await newItem.save()
    msg.ack()
}

let ItemAddedListener = new Listener(natsWrapper.client, "cart-service", Subject.ItemCreated, ItemAddedListeneronMessage)
ItemAddedListener.listen()


const ItemEiditedListeneronMessage = async(data,msg) => {
    const {name,category,description,photo,price,todaysSpecial,Avaliable,_id} = data;
    const editItem = {
        name,category,description,photo,price,todaysSpecial,Avaliable,_id
    }
    const newItem = await Menu.updateOne({ _id: editItem._id }, editItem);
    console.log(newItem)
    msg.ack()
}

let ItemEiditedListeneronMessage = new Listener(natsWrapper.client, "cart-service", Subject.ItemEdited, ItemEiditedListeneronMessage)
ItemAddedListener.listen()