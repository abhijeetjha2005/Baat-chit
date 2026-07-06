const express = require('express')
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

const app=express()
app.use(express.json())


module.exports=app;