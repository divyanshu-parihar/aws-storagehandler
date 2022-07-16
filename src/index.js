//  CONSTANTS
const {PORT} = require('./config.js');
const express = require('express')
const session =  require('express-session');
const passport = require('passport');
const { StorageHandler } = require('./awsHandler.js');
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

app.get('/dashboard', isLoggedIn,async (req, res) => {
  let results = await StorageManager.listBuckets()
  results['Buckets'].some(async (el)=>{
    if(el['Name'] !== `${req.user.id}-cc-non-guided-project`) {console.log('here');await StorageManager.createBucket(req.user.id)}
  })
  res.render('dashboard',{
    results:JSON.stringify(results,null,2) || null
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

app.listen(PORT, () => {
  global.StorageManager = new StorageHandler()
  console.log(`SERVER STARTED: ` + PORT)}
)