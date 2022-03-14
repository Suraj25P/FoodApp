const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const User = require('../models/user');

router.post('/api/auth/login', [
    body('password')
        .trim()
        .notEmpty()
        .withMessage('Please enter your password'),
    body('phoneNo')
        .trim()
        .notEmpty()
        .withMessage('Please enter your phone numeber')
],
    async (req, res) => {
        //validationResult has results of validation
        const valErr = validationResult(req)
        if (!valErr.isEmpty()) {
            errors = valErr.array()
            errorList = errors.map(err => {
                     return {message : err.msg , field:err.param}
            })
        //console.log(errorList)
        return res.send({errors:errorList})
        }
        //console.log(req.body)
        const { phoneNo, password } = req.body;

        //check if userID exists
        const existingUser = await User.findOne({ phoneNo })
        if (!existingUser) {
            return res.send({ errors: [{ message: "This User Doesnt exist..Please register to continue.."}]})
        }
        //check if passwords match ...compare 
        const passwordsMatch = await bcrypt.compare(password, existingUser.password);
        if (!passwordsMatch)
            return res.send({ errors: [{ message: "Invalid Credentials"}]})

        existingUser.password = undefined;
        const userJwt = jwt.sign({
            ...existingUser
        }, process.env.JWT_KEY)

        return res.send({user:existingUser,token:userJwt})
    }
)

module.exports = router