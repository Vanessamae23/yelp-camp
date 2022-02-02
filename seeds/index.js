
const path = require('path');
const mongoose = require('mongoose')
const cities = require('./cities')
const { places, descriptors} = require('./seedHelpers')
const Campground = require('../models/campground')

mongoose.connect('mongodb://localhost:27017/yelp-camp', { useNewUrlParser: true, useUnifiedTopology: true })


//To check whether connected to the database
const db = mongoose.connection;
db.on("error", console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log("Database connected")
})

// const sample = array => array[Math.floor(Math.random() * array.length)]
function sample(array) {
    return array[Math.floor(Math.random() * array.length)]
}

const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10
        const camp = new Campground({
            // ur user id
            author: '61fa6708dff76ac1287953c2',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'This place is very gorgeous with all the beautiful scenery around',
            price,
            geometry: { type: 'Point', coordinates: [
                cities[random1000].longitude,
                cities[random1000].latitude,
            ] },
            images:  [{ "url" : "https://res.cloudinary.com/yelpcampudemyfile/image/upload/v1643564105/YelpCamp/d5hf3yaopnppurnaljxe.jpg", "filename" : "YelpCamp/d5hf3yaopnppurnaljxe" }]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})