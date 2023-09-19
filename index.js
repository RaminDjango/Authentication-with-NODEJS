const express = require("express")
require('dotenv').config()
const session = require('express-session')
const Users = require('./db/mongoose')
const MongoDbSession = require('connect-mongodb-session')(session)
const bodyParser = require("body-parser")
const bcrypt = require('bcrypt')
const app = express()
const flash = require('connect-flash')
const mongoUri = process.env.LOCAL_DB;

const store = new MongoDbSession({
    uri:mongoUri,
    collection: 'mySession'
})

app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({extended: true}))

app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: store
}))

const isAuth = (req, res, next) => {
    if(req.session.isAuth){
        next()
    }else{
        res.redirect('/login')
    }

} 
app.use(flash())

app.get('/register', (req, res) =>{
    res.status(200).render('register')
})
app.post('/register', async (req, res) =>{
    const {username, email, password} = req.body;
    
    let user = await Users.findOne({ email })
    if(user){
        return res.redirect('/register')
    }

    const hashPassword = await bcrypt.hash(password, 10)
    user = new Users({
        username,
        email,
        password: hashPassword

    }) 
    await user.save()
   
    res.redirect('/login')
})

app.get('/login', (req, res) => {
    const erorrEmptyUser =  req.flash('Empty')
    res.status(200).render('login', {EmptyUser: erorrEmptyUser})
})
app.post('/login', async (req,res) => {
    const {username,email ,password} = req.body;
    if(!username){
        req.flash('Empty', 'Gol username')
        
    }
    let user = await Users.findOne({email, username})
    if(!user){
        return res.redirect('/login')
    }
    
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
        return res.redirect('/login')
    }
    
    req.session.isAuth = true
    req.session.user = username;
    res.redirect('/dashboard')
})

app.get('/dashboard', isAuth, async (req, res) =>{
  
    res.render('dashboard', {Username: req.session.user})
})


app.post('/logout', isAuth, (req, res) =>{
    req.session.destroy((err) =>{
        if(err) throw err;
        res.redirect('/login')
    })
})

// servar listeing
const port = process.env.PORT || 5000;
const host = process.env.HOST || 'localhost';
app.listen(port, host,(err) =>{
    if(err) throw err;
    console.log(`servar running http://${host}:${port}`)
})
