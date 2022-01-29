const express = require('express');
const router = express.Router();
//remember to get the catchAsync
const catchAsync = require('../utils/catchAsync');
const Review = require('../models/review')
const Campground = require('../models/campground');
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware")
//from the controllers
const campgrounds = require('../controllers/campgrounds')
const multer = require('multer');
const upload = multer({dest: 'uploads/'})

//chaining things cannot put semicolon

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(upload.single('image'), isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground)) //validateCampground first
  
router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground)) 
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))



//must remember to export 
module.exports = router;