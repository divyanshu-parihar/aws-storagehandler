//  CONSTANTS
const { PORT } = require('./config.js');
const express = require('express')
const fileUpload = require('express-fileupload')
const session = require('express-session');
const passport = require('passport');
const { StorageHandler } = require('./awsHandler.js');
const multer = require('multer')
const multerS3 = require('multer-s3');
require('./auth')


// main app
const app = express();


function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(fileUpload());
app.use(express.static('public'))
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
  let check = results['Buckets'].some(async (el) => {
    if (el['Name'] === `${req.user.id}`) {
      return FoundPrev = true;
    }
  })
  if (!check) {
    await StorageManager.createBucket(req.user.id)
  }


  results = await StorageManager.listObjects(req.user.id)

  res.render('dashboard', {
    results: results || null
  })
});

app.get("/list", isLoggedIn, async (req, res) => {
  let x = await StorageManager.listObjects(req.user.id)
  res.send(`<pre>${JSON.stringify(x, null, 2)}</pre>`)
})

app.post("/delete", isLoggedIn, async (req, res) => {
  let fileName = req.body.fileName
  await StorageManager.deleteObject(req.user.id, fileName)
  res.redirect('/dashboard')
})

app.post('/download', isLoggedIn, async (req, res) => {
  let fileName = req.body.fileName
  let data = await StorageManager.downloadObject(req.user.id, fileName)
  res.send(data)
})
app.get('/logout', (req, res) => {
  req.logout(() => {
    console.log('logged out')
  });
  // req.session.destroy();
  res.redirect('/');
});

app.get('/auth/google/failure', (req, res) => {
  res.send('Failed to authenticate..');
});

app.get('/uploadFile', async (req, res) => {
  res.send("... uploading files")
})




app.post('/upload', isLoggedIn, async (req, res) => {
  if (!req.files) {
    res.send("File was not found");
    return;
  }
  const file = req.files.inputFile
  await StorageManager.putObject(req.user.id, file, req.body.FileName);
  res.redirect("/dashboard")
})

app.listen(PORT, () => {
  global.StorageManager = new StorageHandler()
  console.log(`SERVER STARTED: ` + PORT)
})