const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const passport = require('passport');

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

//@route GET api/users/login
//returnina JWT tokena
//Public
router.post('/login', (req, res)=>{
const email = req.body.email;
const password = req.body.password;

User.findOne({email})
    .then(user=>{
      if (!user) {
        return res.status(404).json({email: 'User not found'})
      }
      bcrypt.compare(password, user.password)
          .then(isMatch =>{
        if (isMatch){

          //creating JWT payload
          const payload = {id: user.id, name: user.name, avatar: user.avatar};

          //signing token
jwt.sign(
    payload,
    process.env.JWT_KEY,
    {expiresIn: 3600},
    (err, token) =>{
      res.json({
        success:true,
        token: 'Bearer ' + token
      })
    }
)
        } else{
          return res.status(400).json({password: 'Password incorrect'})
        }
      })
    })
});

//@route GET api/users/current
//returnina current user
//Private
router.get(
    '/current',
    passport.authenticate('jwt', {session: false}),
    (req, res) => {
    res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email
  })
  }
);


module.exports = router;