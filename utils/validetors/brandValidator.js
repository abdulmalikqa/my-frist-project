const validetorMiddleware = require('../../middlewares/validetorMiddleware');
const {check , body} = require('express-validator')
const slugify = require('slugify');
const productModel = require('../../Model/productModel')
const ApiError = require('../apiError');

exports.getBrandValidator=[
     check('id').isMongoId().withMessage('Invalid Brand id'),
     validetorMiddleware,
];
 
exports.createBrandValidator=[
     check("name").notEmpty().withMessage('Brand required')
     .isLength({min:3}).withMessage('oo short Brand name')
     .isLength({max:32}).withMessage('Too long Brand name')
     .custom((val ,{req})=>{
     req.body.slug = slugify(val);
     return true;
     })
     ,validetorMiddleware
];
exports.updateBrandValidator=[
     check('id').isMongoId().withMessage('Invalid Brand id'),
     check('name').custom((val ,{req})=>{
     req.body.slug = slugify(val);
     return true;
     }), 
     validetorMiddleware,
];
exports.deletedBrandValidator=[
     check('id').isMongoId().withMessage('Invalid Brand id')
     .custom(async(val ,{req})=>{
      const doc = await productModel.findOne({brand : val})
      if(doc){ throw new ApiError('❌ Cannot delete brand: it has related product.')}

      return true;

     }),

     validetorMiddleware,
];