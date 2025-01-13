const express = require ("express")
const app = express();
const dotenv = require ("dotenv")
dotenv.config();
const bodyparser = require("body-parser")
const userRoute= require('./routes/userRoute.js')
const candidatesRoute = require('./routes/candidatesRoute.js')
const mongoose = require ('mongoose');
 
const PORT = process.env.PORT || 3000;
app.use(express.json());


app.use(bodyparser.json()) //req.body


mongoose.connect(
    process.env.MONGO_URL_LOCAL , { useNewUrlParser: true, useUnifiedTopology: true }
).then(()=>{
    console.log("db connection successful ");
}).catch((err)=>{
    console.log("Db connection failed",err)
});

app.use("/user",userRoute);
app.use("/candidates", candidatesRoute);




app.listen(process.env.PORT ||3000 ,(req,res)=>{
    console.log(`your voting app is runing on port number ${PORT}`)
})