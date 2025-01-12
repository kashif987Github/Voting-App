const express = require("express");
const userModel = require("../models/user.js");
const bcrypt = require("bcrypt");
const route = express.Router();
const jwt = require("jsonwebtoken");
const {isLoggedin} = require("../routes/verifyToken.js")

route.post("/signup", async (req, res) => {
  try {
    // check if the user already exist
    const existinguser = await userModel.findOne({
      adharcard: req.body.adharcard ,
    });
    if (existinguser) return res.status(404).json("user has already account");

    // Validate input fields

    const { username, adharcard, email, password ,role} = req.body;
    if (!username || !adharcard || !email || !password) {
      return res.status(400).json("all fileds are required");
    }
    // Hash the password
    const salt = await bcrypt.genSalt(10); // Generate a salt
    const hashedpassword = await bcrypt.hash(password, salt); // Hash the password with the salt

    const newuser = userModel({
      username,
      email,
      adharcard,
      password: hashedpassword,
      role:role ||"voter",
    });

    // Save the user to the database

    const saveuser = await newuser.save();
    res.status(201).json(saveuser);
  } catch (err) {
    res.status(500).json(err);
  }
});




route.post("/login", async (req, res) => {
  try {
    // Validate input fields

    const { adharcard, password } = req.body;
    if (!adharcard || !password)
      return res.status(400).json("email and password required");

    // Check if the user exists

    const existinguser = await userModel.findOne({ adharcard: adharcard });
    if (!existinguser) return res.status(404).json("user does not exist ");

    // Verify the password

    const validpassword = await bcrypt.compare(password, existinguser.password);
    if (!validpassword)
      return res.status(401).json("invalied user and password");

    // Generate a JWT token

    const genToken = jwt.sign(
      {
        id: existinguser.id,
        adharcard: existinguser.adharcard,
        role:existinguser.role,
      },
      process.env.JWT_SEC,
      { expiresIn: "2h" }
    );

    res.status(201).json({existinguser, genToken });
  } catch (err) {
    console.error(err);  // Logs the error

    res.status(500).json(err);
  }
});





route.get("/profile", isLoggedin, async (req, res) => { 
  try {
    const newuserId = req.existinguser;
    const userprofile = await userModel.findById(newuserId);
    if (!userprofile) return res.status(404).json("user not found");
    res.status(200).json(userprofile);
  } catch (err) {
    res.status(500).json(err);
  }
});


route.put("/profile/password", async (req, res) => {
  try {
    const newuserId = req.user.id; /// extract the id from token
    const { currentpassword, newpassword } = req.body;

    // check or find the user by id
    userModel.findById(newuserId);

    /// check if the password is matching with login password if not return error

    const validpassword = await bcrypt.compare(currentpassword, user.password);
    if (!validpassword) return res.status(401).json("invalied password");

    const newsalt = await bcrypt.gensalt(10);
    const newhashpassword = await bcrypt.hash(newpassword, newsalt);

    user.password = newhashpassword;

    await user.save();
    // Send success response
    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = route;
