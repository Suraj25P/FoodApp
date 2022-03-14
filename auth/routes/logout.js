const express = require('express')
const router = express.Router()


router.get('/api/auth/currentuser',(req, res) => {
      res.send("HELLLO")
})


module.exports = router