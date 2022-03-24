const express = require('express')
const router =express.Router()
const userModel = require('../Backend/models/verifiedUsers')
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken')
require("dotenv").config();
const NodeRSA = require('node-rsa');
const key = new NodeRSA({b: 512});

const jwt_token = process.env.jwt_secret_key

router.post('/signup',async(req,res)=>{
    try {
        let users = await userModel.findOne({email:req.body.email});
        if (users) {
            return res.status(404).json({
              status: false,
              error: "User with given email already exists!!"
            })
          }
          const salt = bcrypt.genSaltSync(10);
          const hashedPassword = bcrypt.hashSync(req.body.password, salt);
          const encrypted = jwt.sign(req.body.aadharNumber, jwt_token)

          const newUser = await userModel.create({name:req.body.name,email:req.body.email,password:hashedPassword,aadharNumber:encrypted,isVerified:false})
          const userToken = jwt.sign({ id: newUser.id }, jwt_token)
          res.redirect("/dashboard")

          res.status(200).send({status:true,userToken,newUser})
      
    } catch (error) {
        res.status(500).send({status:false,error})
        console.log(error)
    }
})

router.get('/users',async(req,res)=>{
  try {
    const users = await userModel.find();
    res.status(200).send({status:true,users})
  } catch (error) {
    res.status(500).send({status:false,error})
  }
})
router.get('/user/:id',async(req,res)=>{
  try {
    let users = await userModel.findById(req.params.id);
        if (!users) {
            return res.status(404).json({
              status: false,
              error: "Incorrect Id or Password"
            })
          }
          console.log(users.aadharNumber)
          const decrypted = jwt.verify(users.aadharNumber, jwt_token);
    res.status(200).send({status:true,users,aadharNumber:decrypted})
  } catch (error) {
    res.status(500).send({status:false,error})
    console.log(error)
  }
})
router.put('/user/:id',async(req,res)=>{
  try {
    let users = await userModel.findById(req.params.id);;
        if (!users) {
            return res.status(404).json({
              status: false,
              error: "Incorrect Id or Password"
            })
          }
          await userModel.findByIdAndUpdate(users.id,req.body)
    res.status(200).send({status:true,users})
  } catch (error) {
    res.status(500).send({status:false,error})
  }
})
router.delete('/user/:id',async(req,res)=>{
  try {
    let users = await userModel.findById(req.params.id);;
        if (!users) {
            return res.status(404).json({
              status: false,
              error: "Incorrect Id or Password"
            })
          }
          await userModel.findByIdAndDelete(users.id)
    res.status(200).send({status:true,users})
  } catch (error) {
    res.status(500).send({status:false,error})
  }
})
router.post('/login',async(req,res)=>{
  try {
    let users = await userModel.findOne({email:req.body.email});
        if (!users) {
            return res.status(404).json({
              status: false,
              error: "Incorrect Id or Password"
            })
          }
          if (bcrypt.compareSync(req.body.password, users.password)) {
            const userToken = jwt.sign({ id: users.id }, jwt_token)
          res.redirect("/dashboard")

            res.status(200).cookie("userToken",userToken).send({
              status: true,
              userToken,
            })
          }
          else {
            res.status(404).send({
              status: false,
              error: "Incorrect Id or Password"
            })
          }
  } catch (error) {
    res.status(500).send({status:false,error})
  }
})

router.get('/logout',async(req,res)=>{
    res.cookie("name","").redirect('/login')
  })


module.exports=router;