//  CONSTANTS
const {PORT} = require('./config.js');
const express = require('express')
const session =  require('express-session');
const passport = require('passport');
require('./auth')


// main app
const app = express();


function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

app.use(session({ secret: 'cats', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());





// engine 
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
  res.render('index')
})





app.get('/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile','openid'] }
  ));

app.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/dashboard',
    failureRedirect: '/auth/google/failure'
  })
);

app.get('/dashboard', isLoggedIn, (req, res) => {
  res.render('dashboard',{
    user:JSON.stringify(req.user,null,2) || null
  })
});

app.get('/logout', (req, res) => {
  req.logout();
  req.session.destroy();
  res.send('Goodbye!');
});

app.get('/auth/google/failure', (req, res) => {
  res.send('Failed to authenticate..');
});
app.listen(PORT, () => console.log(`SERVER STARTED: ` + PORT))