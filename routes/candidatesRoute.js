const mongoose = require("mongoose");
const express = require('express');
const candidatesModel = require("../models/candidates.js");
const bcrypt = require("bcrypt");
const route = express.Router();
const jwt= require('jsonwebtoken');
const { isAdmin,isLoggedin } = require('./verifyToken.js');

 
route.post("/", isAdmin, async (req,res)=>{
    try{
        const data =req.body
        
    const newcandi=new candidates(data);
    const response= await newcandi.save();

    res.status(201).json({message:"candidate created successfully",response});
    

    }catch(err){
        
        res.status(500).json(err);
    }
    
 })

 route.put("/candidate/:id",isAdmin,async(req,res)=>{
    try{
     
        const candidateID =req.params.id;
        const updatedcandidateData= req.body;
        const response = await candidatesModel.findByIdAndUpdate(candidateID,updatedcandidateData,{
            new:true,
            runValidators:true ///mongo validation 
        });
        if(!response)
            return res.status(404).json({error:'candidate not found'});
        res.status(200).json({message:"candidate has updated successfully",response});
    
    }catch(err){
        res.status(500).json(err)
    }
 })

 route.delete("/delete/:candidateID",isAdmin,async(req,res)=>{
    try{
        const candidateID = req.params.candidateID;
   const response = await candidatesModel.findByIdAndDelete(candidateID);
    if(!response){
        return res.status(404).json("candidate not found");

    }
    res.status(200).json({message:"Candidate has been deleted",response})

    }catch(err){
        res.status(500).json(err);
    }
 })
 

 /// Lets start Voting 

 route.post("/vote/:id", isLoggedin, async(req,res)=>{
    // admin cant vote 
    // user can only vote once 
    // we need two things to vote ... 1 user id who the person vote ..will extract the id from isLoogedin token... 2 candidatesID to whome user will vote ....candidateid getting from parameter
 

    try{
        const extractCandidateID =req.params.id;
        const userID = req.user.id;
            // Validate the candidate ID

        if (!mongoose.Types.ObjectId.isValid(extractCandidateID)) {
            return res.status(400).json({ message: "Invalid Candidate ID" });
          }

        // find the candidates document with specific candidateID
        const candidate = await candidatesModel.findById(extractCandidateID);
        if (!candidate) {
            return res.status(404).json({ message: "Candidate not found" });
        }
        
        const user = await userModel.findById(userID);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.isVoted) {
            return res.status(400).json({ message: "User has already voted" });
        }
        
        if (user.role === 'admin') {
            return res.status(403).json({ message: "Admins are not allowed to vote" });
        }
        

        /// next step ..if user voted then we have to make isvoted deafult false to true in userSchema ....
        // and 2 task is to we have to save the vote and userid in candidated Schema 


        /// updating Candidate Schema to record the vote 
        candidate.votes.push({ user: userID }); // passing userId in user .. Record user's vote
         candidate.votecount  += 1; // Increment vote count
         console.log("Candidate after updating votes:", candidate); // Debugging log
         await candidate.save();



         /// update the user document  

         user.isVoted = true; // Mark user as having voted
         console.log("User after updating isVoted:", user); // Debugging log
         await user.save();

         

        res.status(200).json({message:"Vote recorded Successfully"});



    }catch(err){
        res.status(500).json({error:"internal server error",details:err.message});

    }

 })


  //// vote count in sorted order ..how many vote each party gain //

  route.get("/vote/count",async(req,res)=>{
    try{
        /// find all candidates and sort them by votecount in descending order 
        const candidate =await candidatesModel.find().sort({votecount:'desc'})

        /// map the candidates to only return thier name and votecount

        const voterecord = candidate.map((data)=>{
            return{
                name:data.name,
                party:data.party,
                count:data.votecount

            }

        })
        
        return res.status(200).json(voterecord)


    }catch(err){
        res.status(500).json({error:"internal server error"});

    }
     

 })
  



 
module.exports=route