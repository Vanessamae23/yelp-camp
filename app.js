// when we deploy, we will run under production. If we are in development mode, require the env package
// take the key value pairs and adding them to process.env so that it can be used in the file
// in production, another way to set 
// use .gitignore to add entry to the .env ffiles to prevent sensitive info to be displayed in the github repo
if(process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}



const express = require('express')
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground')
const methodOverride = require("method-override")
const { campgroundSchema, reviewSchema } = require('./schemas.js')
const ejsMate = require('ejs-mate');
const res = require('express/lib/response');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const { resourceLimits } = require('worker_threads');
const Review = require('./models/review')
const session = require("express-session")
const flash = require('connect-flash');
const passport = require('passport') // allows multiple strategies
const LocalStrategy = require('passport-local'); 
const User = require('./models/user')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')

const sessionConfig = {
    name: 'session', // not using the default name
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    //cookie not accessible by javascript
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(mongoSanitize())
//app.use(helmet()) //specify to display things tht come from this website

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/yelpcampudemyfile/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// app.use(passport) must be before the session part
app.use(passport.initialize());
app.use(passport.session()); // 
passport.use(new LocalStrategy(User.authenticate())); // use local strategy to authenticate the user model

passport.serializeUser(User.serializeUser()); // passport telling how to serialize a user - how do we get and store a user in the session
passport.deserializeUser(User.deserializeUser())

const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')

mongoose.connect('mongodb://localhost:27017/yelp-camp', { useNewUrlParser: true, useUnifiedTopology: true })


//To check whether connected to the database
const db = mongoose.connection;
db.on("error", console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log("Database connected")
})


app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({extended: true}))
app.use(methodOverride("_method"))
app.use(express.static(path.join(__dirname, "public"))) // to render static files like css, html and JS

//Define a MIDDLEWARE function - rmember to put the req, res and NEXT
const validateCampground = (req, res, next) => {
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



// set up flash middleware before the route handlers
//middleware must have the next
app.use((req, res, next) => {
    res.locals.currentUser = req.user; // in all templates, now can access to the currentuser
    //As we are using success and error as part of res.locals, we can access success and error directly in our ejs files like <%= success%> and <%= error%>
    // we will have access to it in our template without having to pass it through. have access to in our locals under the key success
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error')
    next();
})



//specify the router and the path prefix so app.use('prefix used', then what file to render)
app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

app.get('/', (req, res) => {
    res.render('home')
})



app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404))
    // inside next is the error so it will be passed down to error handler below as an error. Err is the new instance of the class
})

app.use((err, req, res, next) => {
    // destructuring from error (meaning Error class?)
    // also give a default value
    const { statusCode = 500 } = err;
    if(!err.message) err.message = "Oh no, something went wrong!"
    res.status(statusCode).render('error', {err}) //passing through the entire error using err to the template
})

app.listen(3000, () => {
    console.log("Listening on port 3000")
})