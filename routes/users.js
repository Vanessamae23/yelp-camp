const express = require('express');
const catchAsync = require('../utils/catchAsync') // error can happen so we need to handle using the catchAsync
const passport = require('passport')
const router = express.Router();
const User = require('../models/user')
const users = require('../controllers/users')
// acquire user from the models directory

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register))

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), users.login)
//passport gives us a middleware to use called passport.authenticate

router.get('/logout', users.logout)

module.exports = router;