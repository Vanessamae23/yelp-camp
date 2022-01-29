const express = require('express');
const router = express.Router( {mergeParams: true});
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Review = require('../models/review')
const Campground = require('../models/campground');
const reviews = require('../controllers/reviews')
const { validateReview, isLoggedIn } = require('../middleware')
const { campgroundSchema, reviewSchema } = require('../schemas.js') //must acquire the JOI schema


router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

router.delete('/:reviewId', catchAsync(reviews.deleteReview))

module.exports = router;