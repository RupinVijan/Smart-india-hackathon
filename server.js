const express = require('express')
const path = require('path')
var cookieParser = require('cookie-parser')
const userModel = require('./Backend/models/verifiedUsers')
const app = express()
const port = process.env.PORT || 3000
require("dotenv").config();
const jwt = require('jsonwebtoken')
const jwt_token = process.env.jwt_secret_key
const pathname=path.join(__dirname + "/public")

const mongoose = require("mongoose");
MongoDbURL = process.env.MONGODB_URL;
mongoose.connect(MongoDbURL);
var db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection error : "));
db.once("open", function () {
  console.log("Database is Ready.... ");
});

app.use(cookieParser())
app.use(express.static(pathname))
app.use(express.urlencoded({extended:false}))
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(pathname + "/index.html"));
})
app.get('/login', async(req, res) => {
  if(!req.cookies.userToken || req.cookies.userToken===""){
    res.sendFile(path.join(pathname + "/login/index1.html"));
  }
  else{
    let userToken = req.cookies.userToken;
    const tokenVerify = jwt.verify(userToken, jwt_token);
    let users = await userModel.findById(tokenVerify.id);
        if (!users) {
          res.sendFile(path.join(pathname + "/login/index1.html"));
          }
        res.redirect('/dashboard')
  }

})
app.get('/signin', async(req, res) => {
  if(!req.cookies.userToken || req.cookies.userToken===""){
    res.sendFile(path.join(pathname + "/signin.html"));
  }
  else{
    let userToken = req.cookies.userToken;
    const tokenVerify = jwt.verify(userToken, jwt_token);
    let users = await userModel.findById(tokenVerify.id);
        if (!users) {
          res.sendFile(path.join(pathname + "/signin.html"));
          }
        res.redirect('/dashboard')
  }

})
app.get('/dashboard', async(req, res) => {
  if(!req.cookies.userToken || req.cookies.userToken===""){
    res.redirect('/login');
  }
  else{
    let userToken = req.cookies.userToken;
    const tokenVerify = jwt.verify(userToken, jwt_token);
    let users = await userModel.findById(tokenVerify.id);
        if (!users) {
          res.redirect('/login');
          }
          res.sendFile(path.join(pathname + "/dashboard.html"));
  }

})
app.get('/profile', async(req, res) => {
  if(!req.cookies.userToken || req.cookies.userToken===""){
    res.redirect('/login');
  }
  else{
    let userToken = req.cookies.userToken;
    const tokenVerify = jwt.verify(userToken, jwt_token);
    let users = await userModel.findById(tokenVerify.id);
        if (!users) {
          res.redirect('/login');
          }
          res.cookie("id", tokenVerify.id).sendFile(path.join(pathname + "/profile.html"));
  }

})



//api
// app.use("/api", require("./routes/loginRoutes"));
app.use('/api', require('./routes/loginRoutes'))
app.use('/api', require('./routes/schemeRoutes'))

app.listen(port, () => {
    console.log(`Your app listening at http://localhost:${port}`)
})