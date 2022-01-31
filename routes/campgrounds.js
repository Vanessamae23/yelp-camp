const express = require('express');
const router = express.Router();
//remember to get the catchAsync
const catchAsync = require('../utils/catchAsync');
const Review = require('../models/review')
const Campground = require('../models/campground');
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware")
//from the controllers
const campgrounds = require('../controllers/campgrounds')

// need to require the storage that is just set up under the cloudinary folder
const { storage } = require('../cloudinary') // node auto finds for index.js so don have to specify
const multer = require('multer');
const upload = multer({ storage })

//chaining things cannot put semicolon

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground)) //validateCampground first
  
router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground)) 
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))



//must remember to export 
module.exports = router;