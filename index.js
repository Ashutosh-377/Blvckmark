const express = require('express')
const app = express()
const mongoose = require('mongoose')
const Item = require('./schema/item')
const multer = require('multer')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const authRoutes = require('./routes/auth')
const User = require('./schema/user')
const bodyParser = require('body-parser')
const { isLoggedIn } = require('./middleware/auth')
const Order = require('./schema/order')
require('dotenv').config()


app.use(express.json())
app.use(express.static('public'))
app.use(bodyParser.json())
app.use(express.urlencoded({extended: true}))
app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: 'mongodb://127.0.0.1:27017/dashboard'
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}))
const { isAdmin } = require('./middleware/admin')
app.use((req, res, next) => {
    res.locals.userId = req.session.userId || null
    next()
})
app.use(async (req, res, next) => {
    res.locals.currentUser = null
    if (req.session.userId) {
        const user = await User.findById(req.session.userId)
        res.locals.currentUser = user
    }
    next()
})
// 404 Not Found Handler

app.use('/payment', require('./routes/payment'))
app.use(authRoutes)

app.set('view engine', 'ejs')

mongoose.connect('mongodb://127.0.0.1:27017/dashboard')

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/images/')
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

const upload = multer({ storage: storage })


app.get('/admin', isAdmin, async(req, res) => {
    const item = await Item.find()
    res.render('dashboard', {title: 'Dashboard', item})
})

app.get('/create', isAdmin, (req, res) => {
    res.render('add-item', {title: "Add-item"})
})

app.get('/product/:id',  async (req, res) => {
    const product = await Item.findById(req.params.id)
    if(!product){
        return res.status(404).send('Product not found')
    }
    res.render('product', {title: product.name, product})
})

app.get('/edit/:id', isAdmin, async (req, res) => {
    const product = await Item.findById(req.params.id)
    if(!product){
        return res.status(404).send("product not found")
    }
    res.render('edit-item', {title: product.nams + ' - Edit', product})
})

app.get('/products', async (req, res) => {
    const products = await Item.find()
    res.render('product-display', {title: 'Products', products})
})

app.post('/create', isAdmin, upload.single('image'), async (req, res) => {
    const newItem = await Item.create({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        image: `/images/${req.file.filename}`
    })
    await newItem.save()
    res.redirect('/admin')
})

app.get('/profile', isLoggedIn, async (req, res) => {
    const user = await User.findById(req.session.userId).lean()
    if (!user){
        return res.redirect('/login')
    }
    res.render('profile', {user})
})

app.post('/edit/:id', isAdmin, upload.single('image'), async (req, res) => {
    const updatedData = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
    }

    if (req.file) {
        updatedData.image = `/images/${req.file.filename}`
    }

    await Item.findByIdAndUpdate(req.params.id, updatedData)
    res.redirect('/admin')
})

app.post('/delete/:id', isAdmin, async (req, res) => {
    const deleteItem = await Item.findByIdAndDelete(req.params.id)
    if (!deleteItem){
        return res.status(404).send("product not found")
    }

    res.redirect('/admin')
})

app.post('/add-to-cart/:productId', async (req, res) => {
    if (!req.session.userId) return res.redirect('/login')

    const user = await User.findById(req.session.userId)
    const productId = req.params.productId

    const cartItem = user.cart.find(item => item.productId.equals(productId))

    if (cartItem) {
        cartItem.quantity++
    } else{
        user.cart.push({ productId, quantity: 1 })
    }

    await user.save()
    res.redirect('/cart')
})

app.get('/cart', async (req, res) => {
    if (!req.session.userId) return res.redirect('/login')
    const user = await User.findById(req.session.userId).populate('cart.productId')
    res.render('cart', { cart: user.cart })
})

app.post('/cart/remove/:productId', async (req, res) => {
    const userId = req.session.userId
    const productId = req.params.productId

    try{
        await User.findByIdAndUpdate(userId, {
            $pull: {
                cart: { productId: productId}
            }
        })
        res.redirect('/cart')
    } catch (err) {
        console.log(err)
        res.status(500).send('Internal Server Error')
    }
})

app.get('/all-orders', isAdmin, async (req, res) => {
    const orders = await Order.find()
    res.render('all-order', {orders})
})

app.get('/order/:id', isAdmin, async (req, res) => {
    const order = await Order.findById(req.params.id)
    if(!order){
        return res.status(404)
    }
    res.render('order-detail', {order})
})

app.use((req, res, next) => {
    res.status(404).render('404');
});

app.listen(3000)