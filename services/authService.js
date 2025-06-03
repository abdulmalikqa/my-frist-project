const asyncHandler = require("express-async-handler");
const userSchema = require("../Model/userModel"); // نموذج المستخدم
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const ApiError = require("../utils/apiError");
const crypto = require("crypto");
const createToken = require("../utils/createToken");
const { sanitizeUser } = require("../utils/sanitizeData");
 const sendEmail = require('../utils/sendEmail');
 

 // @desc    Signup
// @route   GET /api/v1/auth/signup
// @access  Public
exports.singnUp= asyncHandler(async(req,res,next)=>{
   // 1) Create User
    const user = await userSchema.create({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
    });

    // 2) Generate token
   const token=  createToken(user._id);

   console.log(token);
        res.status(201).json({Data:sanitizeUser(user) , token})
    
});
exports.googleLogin = asyncHandler(async (req, res) => {
  const { email, name, picture, googleId } = req.body;

  let user = await userSchema.findOne({ email });

  if (!user) {
    user = await userSchema.create({
      name,
      email,
      googleId,
      profileImg: picture,
      active: true,
    });
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.status(200).json({ token, user });
});
// @desc    Login
// @route   GET /api/v1/auth/login
// @access  Public
exports.logIn = asyncHandler(async (req, res, next) => {
  //1- chech if password and email in the body(validator)
  //2-check if user exist and check if password is correct
  const user = await userSchema.findOne({ email: req.body.email });
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("Incorrect email or password...", 401));
  }
  //3- generat Token
  const token = createToken(user._id);
  //4-send response to clint side

  //res.status(200).json({  status: 'success', token,  data: {  user: {  id: user._id,  name: user.name,  email: user.email, },},});

  res.status(200).json({ status: "Success...",  Data: sanitizeUser(user), token, });
});
// @desc    Forgot password
// @route   POST /api/v1/auth/forgotPassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // 1- Get Id Uesr by email
  const user = await userSchema.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`There is no user with that email ${req.body.email}`, 404)
    );
  }
  // 2- if user exise ,Generate hash reset random 6 digits and save it in db
  //Generate hash reset random 6 digits
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  // Encry reset code
  // تشفير الكود
  const hashedResetCode = crypto.createHash("sha256").update(resetCode).digest("hex");
  // saver hashedResetCode in  passwordResetCode
  user.passwordResetCode = hashedResetCode;
  // Add expiration time for password reset code (10 min)
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;

  await user.save();

   // 3) Send the reset code via email
     const message = `Hi ${user.name},
      \n We received a request to reset the password on your E-shop Account. 
      \n ${resetCode} \n Enter this code to complete the reset.
       \n Thanks for helping us keep your account secure.
       \n The E-shop Team`;
  try{

  await sendEmail({
    email:user.email , 
    subject :'Your password reset code (valid for 10 min)',
    message,

  });

       } catch(err)
       {
        user.passwordResetCode = undefined; 
        user.passwordResetExpires = undefined ;
        user.passwordResetVerified = undefined ; 
        await user.save();
        return next(new ApiError('There is an error in sending email' , 500));
       }

         res.status(200).json({status:'Success', message :'Reset code sent to email'});
    
});
// @desc    Verify password reset code
// @route   POST /api/v1/auth/verifyResetCode
// @access  Public
exports.verifyPasswordReset = asyncHandler(async(req,res,next)=>{
     //1 get user baset reset cod req.body.resetCode
    // قبل الاستعلام نحول الكود الى هاشتنج
     const hashedResetCode = crypto.createHash('sha256').update(req.body.resetCode).digest('hex');
    const user = await userSchema.findOne({
        passwordResetCode : hashedResetCode ,
        passwordResetExpires:{$gt:Date.now()},
        passwordResetVerified:false,
    });

    
    if(!user)
    {
        return next(new ApiError('Reset Code Invalid or expires'));
    }
     

     user.passwordResetVerified= true;

    await user.save();
    res.status(200).json({status :'Success'})

});
// @desc    Reset password
// @route   POST /api/v1/auth/resetPassword
// @access  Public
exports.resetPassword = asyncHandler(async(req,res,next)=>{
    // 1) Get User from Email
    const user=await userSchema.findOne({email:req.body.email});
    if(!user)
    {
        return next(new ApiError(`There is no user with that email ${req.body.email}`, 404))
    }
     //2) check passwordResetVerified true or fales
    if(!user.passwordResetVerified)
    {
      return next(new ApiError('Reset code not verified', 404));
    }

    //3) Save Data
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    user.password= req.body.newPassword;
    await user.save();

   //4) generat Token
   const token = createToken(user._id);

   res.status(200).json({status :'Success reset password' , token})
    
})

// @desc   make sure the user is logged in
exports.protect = asyncHandler(async (req, res, next) => {
  //1) Check if token exist, if exist get
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new ApiError(  "You are not login, Please login to get access this route", 401 )
    );
  }
  // 2) Verify token (no change happens, expired token)
  const decoded = jwt.verify(token, process.env.JWT_KEY);

  /**
      * decoded = 
      * {
         userId: '683ddac34e8ab050826246ec',
         iat: 1748887460,
         exp: 1751479460
        }
      */
  // 3) Check if user exists
  const currentUser = await userSchema.findById(decoded.userId);
  if (!currentUser) {
    return next(
      new ApiError( "The user that belong to this token does no longer exist",  401 ) );
  }
  //    Check if User active
  if (!currentUser.active) {
    return next(new ApiError("User is inactive User must be activated", 401));
  }

  // 4) Check if user change his password after token created
  /**
   *  iat: 1746635073, هذا هو عبارة عن انتهاء التوكن متى بينتهي التوكني
   * الحين نريد ان نعرف هل قام بتغير كلمة المرور بعد تغير التوكن
   *
   */

  if (currentUser.passwordChangedAt) {
    /**
     * currentUserزpasswordChangedAt =  2025-05-07T16:42:06.759Z
     * decoded.iat = 1746636625
     * شكل البيانات
     * الان اما انقوم بتحويل تاريخ تغير الباسورد الى تايم سبس او نحول
     * iat الى تاريخ
     */
    const passChangedTimestamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );

    // password changed after token create(Error)
    if (passChangedTimestamp > decoded.iat) {
      return next(
        new ApiError(
          "User Iecenty changed his password. Please login again..",
          401
        )
      );
    }
  }

  req.user = currentUser;
  next();
});

exports.allowedTo =(...roles)=> asyncHandler(async(req,res,next)=>{

    // 1) access roles
    // 2) access registered user (req.user.role)
    
     if(!roles.includes(req.user.role))
    {
       return next(new ApiError('You are not allowed to access this route',403)) ;
    }
    next();
})
