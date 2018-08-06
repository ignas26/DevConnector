const express  = require('express');
const app = express();
require('dotenv').config();
require('./database/connectTo')();

app.get('/', (req, res)=>res.send('hello'));

const port = process.env.PORT || 5005;

app.listen(port, ()=>console.log(`server is running on ${port}`));