//  CONSTANTS
const { PORT } = require('./config.js');
const express = require('express')
// const bodyParser = require("body-parser");
const session = require('express-session');
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

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// engine 
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile', 'openid'] }
  ));

app.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/dashboard',
    failureRedirect: '/auth/google/failure'
  })
);

app.get('/dashboard', isLoggedIn, async (req, res) => {
  let results = await StorageManager.listBuckets()
  let FoundPrev = false;
  let check  = results['Buckets'].some(async (el) => {
    if (el['Name'] === `${req.user.id}`) { 
        return FoundPrev= true; 
    }
  })
  console.log(FoundPrev)
  if(!check){
    await StorageManager.createBucket(req.user.id)
  }


  results = await StorageManager.listBuckets()
  res.render('dashboard', {
    results: JSON.stringify(results, null, 2) || null
  })
});

app.get("/list", isLoggedIn,async (req, res) => {
    let x = await StorageManager.listObjects(req.user.id)
    res.send(`<pre>${JSON.stringify(x,null, 2)}</pre>`)
})

app.post("/delete", isLoggedIn,async (req, res) => {
    let fileName = req.params.fileName
    let x = await StorageManager.deleteObject(req.user.id,fileName)
    res.send(`<pre>${JSON.stringify(x,null, 2)}</pre>`)
})

app.post('/download',isLoggedIn,async(req,res)=>{
  let fileName = req.params.fileName
  let x = await await StorageManager.downloadObject(req.user.id,fileName)
  res.send(x)
})
app.get('/logout', (req, res) => {
  req.logout();
  req.session.destroy();
  res.send('Goodbye!');
});

app.get('/auth/google/failure', (req, res) => {
  res.send('Failed to authenticate..');
});

app.get('/uploadFile', async (req, res) => {
  res.send("... uploading files")
})

app.post('/uploadFile', async (req, res) => {
  const file = req.file
  console.log(req.body.FileName)
  await StorageManager.putObject(req.user.id, file, req.body.FileName);
  res.send("file uploaded successfully")
})


app.listen(PORT, () => {
  global.StorageManager = new StorageHandler()
  console.log(`SERVER STARTED: ` + PORT)
})