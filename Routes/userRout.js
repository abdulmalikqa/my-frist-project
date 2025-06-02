const express = require("express");

const { createUserValidetor,checkformatId,updateUserValidator,} = require("../utils/validetors/userValidetor");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
const resizeImage = require("../middlewares/resizeImageMiddleware");
const { createUser  , updateUser , activateUser ,deactivateUser, deleteUser } = require("../services/userServices");
const getOldImage = require("../middlewares/getOldImageMiddleware");
const { googleLogin } = require('../services/authService')

const userSchema = require("../Model/userModel"); // ← الموديل
const route = express.Router();

route.post(
  "/",
  uploadSingleImage("profileImg"),
  createUserValidetor,
  resizeImage("User", "profileImg"),

  createUser
);

route.put('/:id' ,
      uploadSingleImage("profileImg"),
      getOldImage(userSchema, "profileImg"),
      updateUserValidator,
      resizeImage("User" , "profileImg"),
      updateUser

    )

    route.put('/deactivateUser/:id' ,  deactivateUser, )
     route.put('/activateUser/:id' ,  activateUser,  );

     route.delete('/:id', deleteUser);
    route.post('/google', googleLogin);

module.exports = route;
