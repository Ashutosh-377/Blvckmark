const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  amount: Number,
  status: String,
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'item' },
      productName: {type: String },
      quantity: { type: Number },
      price: { type: Number }
    }
  ],
  shippingAddress: {
    name: String,
    address: String,
    city: String,
    postalCode: String,
    phone: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
