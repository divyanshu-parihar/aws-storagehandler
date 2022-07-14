//  CONSTANTS
import { PORT } from './config.js';

// Libraries
import express from 'express'

const app = express(); 


// engine 
app.set('view engine', 'ejs')

app.get('/',(req,res)=>{
   res.render('index')
})
app.listen(PORT,()=>console.log(`SERVER STARTED: `+ PORT))