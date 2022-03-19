const express = require('express')
const path = require('path')
const app = express()
const port = process.env.PORT || 3000

const pathname=path.join(__dirname + "/public")

app.use(express.static(pathname))
app.use(express.urlencoded({extended:false}))

app.get('/', (req, res) => {
    res.sendFile(path.join(pathname + "/index.html"));
})

app.listen(port, () => {
    console.log(`Your app listening at http://localhost:${port}`)
})