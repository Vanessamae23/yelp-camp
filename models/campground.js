const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const Review = require("./review");

const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    reviews: [{
        type: Schema.Types.ObjectId,
        //ref to Review model (Object id from a review model)
        ref: 'Review'
    }],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

// cant use ES6 function format
CampgroundSchema.post('findOneAndDelete', async function(doc){
    //doc is the removed data from the findOneAndDelete
    if(doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);