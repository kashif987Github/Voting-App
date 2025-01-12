const mongoose=require('mongoose');

const candidatesSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    party:{
        type:String,
        required:true

    },
    votes:[
        {
            user:{
                type:mongoose.Schema.Types.ObjectId,
                ref: 'user',
                required:true
            },
            votedAt:{
                type: Date,
                default:Date.now()

            },
        }
    ],

    votecount:{
        type:Number,
        default:0
    },
    


})

module.exports = mongoose.model("candidates",candidatesSchema)