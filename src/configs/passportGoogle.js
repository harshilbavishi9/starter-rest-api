const passport = require('passport');
const passportLocal = require('passport-local').Strategy;
const User = require('../Models/userModel');
const bcrypt = require('bcrypt');

passport.use(
    'local',
    new passportLocal({ usernameField: 'email' }, async (email, password, done) => {
        try {
            let user = await User.findOne({ email: email });
            console.log(user);

            if (!user) {
                console.log('User not found');
                return done(null, false, { message: 'Incorrect email or password.' });
            }

            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                console.log('Incorrect password');
                return done(null, false, { message: 'Incorrect email or password.' });
            }

            console.log('Authentication successful');
            return done(null, user);
        } catch (err) {
            console.error(err);
            return done(err);
        }
    })
);

passport.checkAuthentication = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.redirect('/api/user/login');
};

passport.setAuth = (req, res, next) => {
    res.locals.user = req.user;
    return next();
};

module.exports = passport;
