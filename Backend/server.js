const dns = require("node:dns/promises");
dns.setServers(["8.8.8.8","1.1.1.1"])
const connectDb=require("./src/config/db")
require('dotenv').config()

const app=require('./src/app')

connectDb();
app.listen(3000,()=>{
console.log("running");

})
