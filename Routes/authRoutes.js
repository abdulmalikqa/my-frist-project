const express = require("express");
const {logIn , forgotPassword , verifyPasswordReset , resetPassword}= require('../services/authService');
const{logInValidetor}= require('../utils/validetors/authValidetor')
const route= express.Router();

route.post('/logIn',logInValidetor,logIn);
route.post('/forgotPassword',forgotPassword);
route.post('/verifyResetCode',verifyPasswordReset);
route.post('/resetPassword' , resetPassword);


module.exports =route;

