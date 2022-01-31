const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const Review = require("./review");

//can do .virtual like thumbnail where this refers to the particular image
const ImageSchema = new Schema({
    url : String,
    filename: String
})

//virtual because we do not store this in the model or database because it is derived frm the info that are already stored
ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('./upload', './upload/w_100')
})

const opts = { toJSON: { virtuals: true } }

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true,
        }
    },
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
}, opts);


CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`
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