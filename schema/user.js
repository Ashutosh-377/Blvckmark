const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true},
    email:{type:String, required: true, unique: true},
    password: {type:String, required: true},
    cart: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item'
        },
        quantity: { type:Number, default:1 },
        addedAt: {type: Date, default: Date.now}
    }],
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isVerfied: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('User', userSchema)