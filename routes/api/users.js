const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');

//@route GET api/users/test
//Public
router.get('/test', (req, res)=> res.json({msg: 'Users works'}));

//@route GET api/users/register
//Public
router.post('/register', (req, res)=> {
  User.findOne({email: req.body.email})
      .then(user => {
        if (user) {
          res.status(400).json({email: 'Email already taken'})
        } else {
          //avatar is gravatar dokumentacijos
          const avatar = gravatar.url(req.body.email, {
          s: '200',
          r: 'pg',
          d: 'mm'
          });
          const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            avatar,
            password: req.body.password
          });

          bcrypt.genSalt(10, (err, salt)=>{
          bcrypt.hash(newUser.password, salt, (err, hash)=>{
            if (err) throw err;
            newUser.password = hash;
            newUser.save()
                .then(user=>res.json(user))
                .catch(err=>console.log(err))
          })
          })
        }
      })
});


module.exports = router;