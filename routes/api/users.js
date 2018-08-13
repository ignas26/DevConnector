const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const passport = require('passport');

//Load Input Validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

//@route GET api/users/test
//Public
router.get('/test', (req, res)=> res.json({msg: 'Users works'}));

//@route GET api/users/register
//Public
router.post('/register', (req, res)=> {
  const {errors, isValid} = validateRegisterInput(req.body);

  //Validation check
  if (!isValid){
    return res.status(400).json(errors);
  }

  User.findOne({email: req.body.email})
      .then(user => {
        if (user) {
          errors.email = 'Email already exists';
          return res.status(400).json(errors)
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

  const {errors, isValid} = validateLoginInput(req.body);

  //Validation check
  if (!isValid){
    return res.status(400).json(errors);
  }

const email = req.body.email;
const password = req.body.password;

User.findOne({email})
    .then(user=>{
      if (!user) {
        errors.email = 'User not found';
        return res.status(404).json(errors)
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
          errors.password = 'Password is incorrect';
          return res.status(400).json(errors)
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