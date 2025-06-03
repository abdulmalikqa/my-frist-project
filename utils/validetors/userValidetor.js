const validetorMiddleware = require("../../middlewares/validetorMiddleware");
const userSchema = require("../../Model/userModel");
const { check, body } = require("express-validator");
const slugify = require("slugify");
const bcrypt = require("bcrypt");

exports.createUserValidetor = [
  check("name")
    .notEmpty() 
    .withMessage("Name is required")
    .isLength({ min: 5 })
    .withMessage("Name is too short") 
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    })
    ,
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .custom( async(val)=>{
        const user = await userSchema.findOne({email:val});
        if(user)
        {
            throw new Error("Email already in use");
        }
        return true;
    })
    ,

  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .custom((pass, { req }) => {
      if (pass !== req.body.passwordConfirm) {
        throw new Error("Password Confirmation incorrect");
      }
      return true;
    }),
  check("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirmation required"),
  check("profileImg").optional(),

  check("phone")
    .notEmpty()
    .withMessage("phone is required")
    .isMobilePhone(["ar-SA", "ar-YE"])
    .withMessage("Invalid phone number"),

  validetorMiddleware,
];

exports.checkformatId =[

    check('id').isMongoId().withMessage('Invalid user ID format'),

    validetorMiddleware,
];

exports.updateUserValidator = [
  check('id').isMongoId().withMessage('Invalid user ID format'),

  body('name')
    .optional()
    .isLength({ min: 3 }).withMessage('Name is too short')
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  body('email')
    .optional()
    .isEmail().withMessage('Invalid email format')
    .custom(async (val, { req }) => {
      const user = await userSchema.findOne({ email: val });
      if (user && user._id.toString() !== req.params.id) {
        throw new Error('Email already in use by another user');
      }
      return true;
    }),

  check('phone')
    .optional()
    .isMobilePhone(["ar-YE", "ar-SA"]).withMessage('Invalid phone number'),

  validetorMiddleware,
];

  exports.changePassworValidator=[
    check('id').isMongoId().withMessage('Invalid user ID format'),
    check('currentPassword').notEmpty().withMessage('You must enter your current password'),
    check('passwordConfirm')
    .notEmpty()
    .withMessage('You must enter the password confirm'),
    check('password')
    .notEmpty()
    .withMessage('You must enter new password')
    .custom( async(val ,{req})=>{

        const user = await userSchema.findById(req.params.id);

        // التحقق من اليوزر
        if(!user)
        {
            throw new Error('There is no user for id ');
        }
        //مقارنة كلمة المرور المرسلة مع الموجود بقاعدة البيانات بعد تحويلها 
     const isCurrect= await   bcrypt.compare(req.body.currentPassword , user.password);
     if(!isCurrect){        throw new Error('Incorrect current password');     }

     // التحقق من الكلمة السر المدخلة الجديدة 
     if(val !== req.body.passwordConfirm)
        {
            throw new Error('Password Confirmation incorrect');
        }
        return true;

    })
    , validetorMiddleware
  ];
  //updateLoggedUserValidator
  exports.updateLoggedUserValidator = [
    body('name')
      .optional()
      .custom((val, { req }) => {
        req.body.slug = slugify(val);
        return true;
      }),
    check('email')
      .notEmpty()
      .withMessage('Email required')
      .isEmail()
      .withMessage('Invalid email address')
      .custom((val) =>
        userSchema.findOne({ email: val }).then((user) => {
          if (user) {
            return Promise.reject(new Error('E-mail already in user'));
          }
        })
      ),
    check('phone')
      .optional()
      .isMobilePhone(['ar-YE', 'ar-SA'])
      .withMessage('Invalid phone number only accepted Ye and SA Phone numbers'),
  
    validetorMiddleware,
  ];