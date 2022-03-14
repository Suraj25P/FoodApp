const express = require('express')
const router = express.Router()
const { requireAuth }  = require('@srpfoodapp/comman')

router.get('/api/auth/currentuser',requireAuth,(req, res) => {
      res.send({ currentUser: req.currentUser || null })
})

module.exports = router