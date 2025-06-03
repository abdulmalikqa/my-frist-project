const userSchema = require('../Model/userModel');
const  asyncHandler = require('express-async-handler')
const ApiError = require('../utils/apiError')
const handlerFactory = require('../services/handlerFactory');
const fs = require('fs');
const path = require('path'); 
const bcrypt = require('bcrypt');
const createToken = require('../utils/createToken');

// @desc    Create User
// @route   POST  /api/v1/user
// @access  Private
exports.createUser= handlerFactory.CreateOne(userSchema);

// @desc    Get specific User by id
// @route   GET /api/v1/users/:id
// @access  Public
exports.getUserById = handlerFactory.getDataById(userSchema ,'user');

// @desc    Get list of user
// @route   GET /api/v1/users
// @access  private
exports.getUsers = handlerFactory.getAll(userSchema);
// @desc    Update specific User
// @route   PUT /api/v1/user/:id
// @access  Private
exports.updateUser = asyncHandler(async(req,res , next)=>{

    const oldUser = await userSchema.findById(req.params.id);
    if(!oldUser){return next(new ApiError(`No user found with ID: ${req.params.id}`, 404))}
      // 1. تجهيز الصورة القديمة للحذف إن طلب المستخدم حذفها أو رفع صورة جديدة
  if (req.body.deleteImage === 'true' || req.file) {
    if (oldUser.profileImg) {
      req.oldImage = oldUser.profileImg;
    }
  }

  // 2. إذا طلب حذف الصورة فقط، نحذفها من الداتا
  if (req.body.deleteImage === 'true' && !req.file) {
    req.body.profileImg = undefined;
  }
 
  const doucm = await userSchema.findByIdAndUpdate(req.params.id ,
    {
      name: req.body.name,
      slug: req.body.slug,
      phone: req.body.phone,
      email: req.body.email,
      profileImg: req.body.profileImg,
      role: req.body.role,

    },{new : true});
   
 if(!doucm)
 {
  return next(new ApiError(`Error for Update for id ${req.params.id}` , 404));
 }
 res.status(200).json({Data : doucm})
});

// @desc    deactivateUser specific User
// @route   PUT /api/v1/users/deactivateUser/:id
// @access  Private
exports.deactivateUser = asyncHandler(async(req,res,next)=>{
    const user = await userSchema.findByIdAndUpdate(req.params.id,{active:false},{new:true});
    if(!user)
    {
        return next(new ApiError('User not found',404));
    }
    res.status(200).json({Masseg:'User deactivated' , Date:user});
});

// @desc    deactivateUser specific User
// @route   PUT /api/v1/users/activateUser/:id
// @access  Private
exports.activateUser= asyncHandler(async(req,res,next)=>{
    const user = await userSchema.findByIdAndUpdate(req.params.id ,{active:true},{new:true});

    if(!user){return next(new ApiError('User not found',404))}
    res.status(200).json({Masseg :'User activated..' , Data:user} )
})

// @desc    delete specific User
// @route   PUT /api/v1/users/deleteUser/:id
// @access  Private
exports.deleteUser = asyncHandler(async(req,res,next)=>{

    const user = await userSchema.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if(user.profileImg)
    {
        const imagePath = path.join(__dirname, '..', 'uploads', 'User', user.profileImg);
         fs.unlink(imagePath, (err) => {
        if (err) {
          console.warn('Failed to delete user image:', err);
          // ممكن تستمر حتى لو فشل حذف الصورة
        }
      });
    }

    await userSchema.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'User and image deleted successfully' });

});
// @desc    Get Logged user data
// @route   GET /api/v1/users/getMe
// @access  Private/Protect
 exports.getLoggedUserData = asyncHandler(async(req,res,next)=>{
  
  req.params.id = req.user._id;
  next();

 })

 // @desc    Update logged user password
// @route   PUT /api/v1/users/updateMyPassword
// @access  Private/Protect
exports.updateLoggedUserPassword = asyncHandler(async(req,res,next)=>{
     // 1) Update user password based user payload (req.user._id)
     const  user = await userSchema.findByIdAndUpdate( req.user._id,
      {
        password : await bcrypt.hash(req.body.password ,12),
        passwordChangedAt : Date.now(),
      },
      {
        new : true

      }

     );

      // 2) Generate token
    const token = createToken(user._id);

    res.status(200).json({ data: user, token });


 }) ;

// @desc    Update logged user data (without password, role)
// @route   PUT /api/v1/users/updateMe
// @access  Private/Protect
exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const updatedUser = await userSchema.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
    },
    { new: true }
  );

  res.status(200).json({ data: updatedUser });
});