const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { Subject, Publisher } = require('@srpfoodapp/comman');
const natsWrapper = require('../events/nats-wrapper')
//const UserCreatedPublisher = require('../events/publishers/userCreated-pub');

router.post('/api/auth/register', [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Please enter you name'),
    body('password')
        .trim()
        .isLength({ min: 4, max: 20 })
        .withMessage('Please enter a valid Password(4-20 charecters)'),
    body('phoneNo')
        .trim()
        .isLength({ min: 10, max: 10 })
        .withMessage('Please enter a valid phone number')
], async (req, res) => {
    //validationResult has results of validation
    const valErr = validationResult(req)
    if (!valErr.isEmpty()) {
            errors = valErr.array()
            errorList = errors.map(err => {
                     return {message : err.msg , field:err.param}
            })
        
        return res.send({errors:errorList})
        }
    const { name, password ,phoneNo} = req.body
    //Check if the user already exists
    const existing = await User.findOne({ phoneNo })
    if (existing) {
        return res.send({ errors: [{ message: "This phone number is already in reqistered...please login to continue"}]})
    }
    
    //create a new user and store in database
    const hashedPassword = await bcrypt.hash(password, 12);
    try {
        const newUser = new User({
            name,
            password: hashedPassword,
            phoneNo
        })
        await newUser.save()
        //publishing event
        const data = JSON.stringify({
            userId: newUser._id,
            phoneNo: newUser.phoneNo,
            name
        })
        let UserCreatedPublisher = new Publisher(natsWrapper.client, Subject.UserCreated);
        await UserCreatedPublisher.publish(data)
        let sendMessagePublisher = new Publisher(natsWrapper.client, Subject.SendMessage);
        const data_ = JSON.stringify({
            message: "Thanks for registering with us....we hope you will love our food and service",
            to:req.currentuser.phoneNo
        })       
        await sendMessagePublisher.publish(data_)  
        // generate json token
        newUser.password = undefined;
        const userToken = jwt.sign({
            ...newUser
        }, process.env.JWT_KEY)
        //req.session.jwt = userToken
        // req.session = {
        //     jwt:userToken
        // }
        return res.send({user:newUser,token:userToken})   
 
    }
    catch (e) {
        console.log(e)
        return res.send({ errors: [{ message: "Unable to create this user....plz try again.."}]})
    }   
})

module.exports = router