const express = require("express");

const {
  createUserValidetor,
  checkformatId,
  updateUserValidator,
  updateLoggedUserValidator,
} = require("../utils/validetors/userValidetor");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
const resizeImage = require("../middlewares/resizeImageMiddleware");
const {
  createUser,
  updateUser,
  getUsers,
  activateUser,
  deactivateUser,
  deleteUser,
  getUserById,
  getLoggedUserData, updateLoggedUserPassword , updateLoggedUserData
} = require("../services/userServices");

const getOldImage = require("../middlewares/getOldImageMiddleware");
const { googleLogin  } = require("../services/authService");
const userSchema = require("../Model/userModel"); // ← الموديل
const authService = require('../services/authService')

const route = express.Router();

route.use(authService.protect);
// Frist Logger
route.get('/getMe', getLoggedUserData, getUserById);
route.put('/updateMyPassword',updateLoggedUserPassword)
route.put('/updateMe', updateLoggedUserValidator, updateLoggedUserData);
route.get("/google", googleLogin);


//Scound allwto
route.use(authService.allowedTo('admin', 'manager'))
route.get('/', getUsers)
route.post( "/", uploadSingleImage("profileImg"),createUserValidetor,resizeImage("User", "profileImg"),createUser);

route.put(  "/:id",uploadSingleImage("profileImg"),getOldImage(userSchema, "profileImg"),updateUserValidator,resizeImage("User", "profileImg"),updateUser);

route.put("/deactivateUser/:id", deactivateUser);
route.put("/activateUser/:id", activateUser);

route.delete("/:id", deleteUser);
route.get('/:id', getUserById);





// route.get('/:id', getUserById)
module.exports = route;
