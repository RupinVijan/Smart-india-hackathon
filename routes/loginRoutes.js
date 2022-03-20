const express = require('express')
const bcrypt = require("bcryptjs");
const router =express.Router()
const userModel = require('../Backend/models/verifiedUsers')
require("dotenv").config();

const jwt_token = process.env.jwt_secret_key

router.post('/signup',async(req,res)=>{
    try {
        let users = await userModel.findOne({email:req.body.email});
        if (users) {
            return res.status(400).json({
              status: false,
              error: "User with given email already exists!!"
            })
          }
          const salt = bcrypt.genSaltSync(10);
          const hashedPassword = bcrypt.hashSync(users.password, salt);
          const newUser = await userModel.create({name:req.body.name,email:req.body.email,password:hashedPassword,isVerified:false})
          const userToken = jwt.sign({ id: newUser.id }, jwt_token)
          res.status(200).send({status:true,userToken,newUser})
      
    } catch (error) {
        res.status(500).send({status:false,error})
    }
})

