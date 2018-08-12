const express  = require('express');
const app = express();
require('dotenv').config();
require('./database/connectTo')();
const bodyParser = require('body-parser');
const passport = require('passport');
const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//passport midleware
app.use(passport.initialize());

//passport config
require('./config/passport')(passport);


//Using Routes
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);


const port = process.env.PORT || 5005;

app.listen(port, ()=>console.log(`server is running on ${port}`));