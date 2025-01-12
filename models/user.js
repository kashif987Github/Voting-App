const mongoose = require ('mongoose');
const { StringDecoder } = require('node:string_decoder');

const userSchema = mongoose.Schema({
     
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,

    },
    
    adharcard:{
        type:Number,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        default:30
    },
    role:{
        type: String,
        enum:['voter','admin'],
        default:'voter'

    },
    isVoted:{
        type:Boolean,
        default: false
    }

    

})

module.exports = mongoose.model("user",userSchema);