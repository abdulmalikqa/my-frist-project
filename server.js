const express = require('express')
const morgan = require('morgan');
const dotenv = require('dotenv')
require('dotenv').config({path:'Config.env'})
const dbConnection = require('./config/database');
const mountRoutes = require('./Routes/index');
 

const app = express();


app.use(express.json()); // for raw JSON body
app.use(express.urlencoded({ extended: true }));

if(process.env.NODE_ENV ==='development')
{
     app.use(morgan('dev'));
    console.log(`Mode is :${process.env.NODE_ENV}`)
}
 dbConnection();
  app.use(express.json({limit:'20kb'}));

  mountRoutes(app);
//   mountRoutes(app);

 
// app.post('/api/user',async(req,res)=>{
    
//     const data= await userSchema.create(req.body);
//     res.status(201).json({DataUser:data});

// })
 //app.post('/api/user',createData)
 //app.use('/api/user',userRout) 

app.listen(process.env.PORT,()=>{

    console.log('App running....')
})

