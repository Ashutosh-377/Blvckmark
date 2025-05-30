const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../schema/order');
const User = require('../schema/user')

require('dotenv').config();
const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});



router.post('/create-order', async (req, res) => {
  const { amount } = req.body;

  const options = {
    amount: amount * 100, // Convert to paise
    currency: "INR",
    receipt: `receipt_order_${Date.now()}`
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(500).send("Error creating Razorpay order");
  }
});

router.post('/verify', async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    shippingInfo,
  } = req.body;

  // Verify payment signature as before
  const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
  hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
  const generatedSignature = hmac.digest("hex");

  if (generatedSignature === razorpay_signature) {
    try {
      // Get user id from session or JWT (example: req.user.id)
      const userId = req.session.userId;  // adapt to your auth setup

      // Fetch user with cart populated
      const user = await User.findById(userId).populate('cart.productId');

      if (!user) {
        return res.status(404).send("User not found");
      }

      // Format cart items for order schema
      const items = user.cart.map(item => ({
        productId: item.productId.userId,
        productName: item.productId.name,
        quantity: item.quantity,
        price: item.productId.price,
      }));

      await Order.create({
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        amount: shippingInfo?.amount || 0,
        status: "Paid",
        items: items,
        shippingAddress: {
          name: shippingInfo.name,
          address: shippingInfo.address,
          city: shippingInfo.city,
          postalCode: shippingInfo.postalCode,
          phone: shippingInfo.phone
        }
      });


      // Optional: clear user's cart after order creation
      user.cart = [];
      await user.save();

      res.send("Payment verified and order created successfully!");
    } catch (error) {
      console.error(error);
      res.status(500).send("Server error during order creation");
    }
  } else {
    res.status(400).send("Invalid payment signature");
  }
});



module.exports = router;
