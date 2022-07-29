const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;

const GOOGLE_CLIENT_ID = 'CLIENT_KEY_FROM_GOOGLE_API_CONSOLE';
const GOOGLE_CLIENT_SECRET = 'CLIENT_SECRET_FROM_GOOGLE_API_CONSOLE';

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback",
    passReqToCallback: true,
},
function(request, accessToken, refreshToken, profile, done) {
    return done(null, profile);
}));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});
