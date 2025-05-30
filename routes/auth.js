const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../schema/user');
const { isLoggedIn, isLoggedOut } = require('../middleware/auth');
const router = express.Router();

// Middleware to expose session userId to views
router.use((req, res, next) => {
  res.locals.userId = req.session.userId || null;
  next();
});

// Show registration form (only if logged out)
router.get('/register', isLoggedOut, (req, res) => {
  res.render('auth/register');
});

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPwd = await bcrypt.hash(password, 12);
  const user = new User({
    username,
    email,
    password: hashedPwd,
    // no isVerified or verificationCode here
  });
  await user.save();
  req.session.userId = user._id;  // Store user id in session
  res.redirect('/');  // Redirect to home or dashboard
});


// Show login form (only if logged out)
router.get('/login', isLoggedOut, async (req, res) => {
  console.log('Session userId:', req.session.userId);
  if (req.session.userId) {
    return res.redirect('/');
  }
  req.session.userId = User._id
  res.render('auth/login');
});

// Handle login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).render('auth/login', { error: 'Invalid credentials' });
  }
  req.session.userId = user._id;
  res.redirect('/');
});

// Handle logout (only if logged in)
router.post('/logout', isLoggedIn, async (req, res) => {
  if (req.session.userId) {
    await User.findByIdAndUpdate(req.session.userId, { $set: { cart: [] } })
  }

  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Could not log out due to unknown error');
    }
    res.clearCookie('connect.sid'); // Clear cookie explicitly
    res.redirect('/login');
  });
});



module.exports = router;
