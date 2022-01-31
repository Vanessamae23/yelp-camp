const Campground = require('../models/campground')
const { cloudinary } = require("../cloudinary")
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken = process.env.MAPBOX_TOKEN;
// instantiate  a new mapbox geocoding instance
const geocoder = mbxGeocoding({accessToken: mapBoxToken});

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds})  
  }

module.exports.renderNewForm = (req, res) => {
    // coming from passport
      res.render('campgrounds/new')
  }

module.exports.createCampground = async (req, res, next) => {
    // if(!req.body.campground) throw new ExpressError('Invalid campground data', 400)
    // Joi schema - define the basic schema (not a mongoose schema so valdate the data before sent to mongoose)
    //files is going to include info
    const geoData = await geocoder.forwardGeocode({
            query: req.body.campground.location,
            // send this query aft calling the func
            limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename}))
    campground.author = req.user._id
    await campground.save();
    console.log(campground)
    req.flash('success', 'successfully made a new campground')
    res.redirect(`/campgrounds/${campground._id}`)
    
}

module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    console.log(campground);
    if(!campground) {
        req.flash('error', 'Cannot find campground')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground })
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if(!campground) {
        req.flash('error', 'Cannot find campground')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground })
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));
    campground.images.push(...imgs);
    await campground.save()
    if(req.body.deleteImages) {
        for(let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        // $pull - pull from the images array wherer the filename is IN the req body deleteImages
        await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages }}}});
    }
    req.flash('success', 'Successfully updated campground')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if(!campground.author.equals(req.user._id)) {
        req.flash("error", "You do not have the permission to do that");
        return res.redirect(`/campground/${id}`)
    }
    await Campground.findByIdAndDelete(id);
    req.flash("success", 'Sucsessfully deleted a campground')
    res.redirect('/campgrounds')
}