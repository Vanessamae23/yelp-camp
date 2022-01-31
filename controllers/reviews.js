const Review = require('../models/review');
const Campground = require('../models/campground')

module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    //create a new review.. dont forget to require the review -- instantiate a new review
    const review = new Review(req.body.review) // the review is the key to the review[..]
    review.author = req.user._id;
    campground.reviews.push(review); // campground null because router likes to make params separate. Routers get separate params so need to set mergeParams to true
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteReview = async (req, res) => {
    //use an operator in Mongo called $pull to remove from an existing array all instances of a value or values that match a specified condition
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId }})
    await Review.findByIdAndDelete(reviewId)
    req.flash("success", 'Sucsessfully deleted a review')
    res.redirect(`/campgrounds/${id}`);
}