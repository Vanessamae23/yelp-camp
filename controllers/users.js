const User = require('../models/user')

module.exports.renderRegister = (req, res) => {
    res.render('users/register')
};

module.exports.register = async(req, res, next) => {
    try {
    // basic user model instance
    const { email, username, password} = req.body;
    const user = new User({ email, username });
    //use the password, store the salt and the hash
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, err => { //from passport
        if(err) return next(err);
        req.flash('success', 'Welcome');
        res.redirect('/campgrounds')
    });
    } catch(e) {
        req.flash('error', e.message)
        res.redirect('register')
    }
};

module.exports.renderLogin = (req, res) => {
    res.render('users/login')
};

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome Back');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    //delete sth from an object cos don want it to be in the session
    delete req.session.returnTo;
    res.redirect(redirectUrl)
}

module.exports.logout = (req, res) => {
    //from passport
    req.logout();
    req.flash('success', "Goodbye!")
    res.redirect('/campgrounds')
}