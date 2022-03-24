const express = require('express')
const router = express.Router()
const userModel = require('../Backend/models/verifiedUsers')
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken')
require("dotenv").config();
const NodeRSA = require('node-rsa');
const key = new NodeRSA({ b: 512 });
var nodemailer = require('nodemailer');

const jwt_token = process.env.jwt_secret_key

router.post('/signup', async (req, res) => {
  try {
    let users = await userModel.findOne({ email: req.body.email });
    if (users) {
      return res.status(404).json({
        status: false,
        error: "User with given email already exists!!"
      })
    }
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);
    const encrypted = jwt.sign(req.body.aadharNumber, jwt_token)

    const newUser = await userModel.create({ name: req.body.name, email: req.body.email, password: hashedPassword, aadharNumber: encrypted, isVerified: false })
    const userToken = jwt.sign({ id: newUser.id }, jwt_token)
    res.status(200).send({ status: true, userToken, newUser })

  } catch (error) {
    res.status(500).send({ status: false, error })
    console.log(error)
  }
})

router.get('/users', async (req, res) => {
  try {
    const users = await userModel.find();
    res.status(200).send({ status: true, users })
  } catch (error) {
    res.status(500).send({ status: false, error })
  }
})
router.get('/user/:id', async (req, res) => {
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
    res.status(200).send({ status: true, users, aadharNumber: decrypted })
  } catch (error) {
    res.status(500).send({ status: false, error })
    console.log(error)
  }
})
router.put('/user/:id', async (req, res) => {
  try {
    let users = await userModel.findById(req.params.id);;
    if (!users) {
      return res.status(404).json({
        status: false,
        error: "Incorrect Id or Password"
      })
    }
    await userModel.findByIdAndUpdate(users.id, req.body)
    res.status(200).send({ status: true, users })
  } catch (error) {
    res.status(500).send({ status: false, error })
  }
})
router.delete('/user/:id', async (req, res) => {
  try {
    let users = await userModel.findById(req.params.id);;
    if (!users) {
      return res.status(404).json({
        status: false,
        error: "Incorrect Id or Password"
      })
    }
    await userModel.findByIdAndDelete(users.id)
    res.status(200).send({ status: true, users })
  } catch (error) {
    res.status(500).send({ status: false, error })
  }
})
router.post('/login', async (req, res) => {
  try {
    let users = await userModel.findOne({ email: req.body.email });
    if (!users) {
      return res.status(404).json({
        status: false,
        error: "Incorrect Id or Password"
      })
    }
    if (bcrypt.compareSync(req.body.password, users.password)) {
      const userToken = jwt.sign({ id: users.id }, jwt_token)
      res.status(200).cookie("userToken", userToken).send({
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
    res.status(500).send({ status: false, error })
  }
})

router.get('/logout', async (req, res) => {
  res.cookie("name", "").redirect('/login')
})

router.post('/forgot', async (req, res) => {
  try {
    let otp = Math.floor(100000 + Math.random() * 900000);
    let user = await userModel.findOne({ 'email': req.body.email });
    if (!user) res.status(400).json({ message: "user does not exist", status: false })
    user.OTP = otp;
    await user.save();

    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.email_id,
        pass: process.env.email_password
      }
    });

    var mailOptions = {
      from: process.env.email_id,
      to: req.body.email,
      subject: 'password reset',
      text: `the otp for your password reset is ${otp}`
    };

    let info = await transporter.sendMail(mailOptions)
    console.log(info)
    res.status(200).json({ status: true })
  } catch (error) {
    res.status(500).send({ status: false, error })
  }
})

router.post('/forgot/:id', async (req, res) => {
  try {
    let user = await userModel.findOne({ 'email': req.body.email });
    console.log(user.OTP)
    if (!req.body.newPassword || req.body.newPassword == '') return res.status(400).json({ message: "enter new password", status: false })
    if (!user) res.status(400).json({ message: "user does not exist", status: false })
    if (user.OTP == req.params.id) {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(req.body.newPassword, salt);
      user.password = hashedPassword
      await user.save();
    } else {
      return res.status(400).json({ message: "OTP incorrect", status: false })
    }
    res.status(200).json({ message: "password Changed", status: true })
  } catch (error) {
    res.status(500).send({ status: false, error })
  }
})

module.exports = router;