const { campgroundSchema, reviewSchema } = require('./schemas.js') //must acquire the JOI schema
const expressError = require('./utils/ExpressError');
const Campground = require('./models/campground')

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        //store the url they are requesting so put it in the session
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in')
        return res.redirect('/login')
    }
    next(); // ure good to go
}

//Define a MIDDLEWARE function - rmember to put the req, res and NEXT
module.exports.validateCampground = (req, res, next) => {
    // Define the schema then validate with req.body then we make sure that req.boy and the info are there and required
    // if there is an error then we map then we make into a single string then we pass tht to new express error
    
    // passing the data through the schema
    const { error } = campgroundSchema.validate(req.body)
    if(error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 404)
    } else {
        //if we make it through there
        next()
    }
}

module.exports.isAuthor = async(req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if(!campground.author.equals(req.user._id)) {
        req.flash("error", "You do not have the permission to do that");
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error) {
        //if everything went well, then error will give undefined
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 404)
    } else {
        //if we make it through there
        next()
    }
}