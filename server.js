const express = require('express')
const path = require('path')
const app = express()
const port = process.env.PORT || 3000
require("dotenv").config();

const pathname=path.join(__dirname + "/public")

const mongoose = require("mongoose");
MongoDbURL = process.env.MONGODB_URL;
mongoose.connect(MongoDbURL);
var db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection error : "));
db.once("open", function () {
  console.log("Database is Ready.... ");
});


app.use(express.static(pathname))
app.use(express.urlencoded({extended:false}))
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(pathname + "/index.html"));
})



//api
// app.use("/api", require("./routes/loginRoutes"));
app.use('/api', require('./routes/loginRoutes'))

app.listen(port, () => {
    console.log(`Your app listening at http://localhost:${port}`)
})