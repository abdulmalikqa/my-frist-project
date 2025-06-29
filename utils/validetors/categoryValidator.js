const validetorMiddleware = require('../../middlewares/validetorMiddleware');
const {check } = require('express-validator')
const slugify = require('slugify');
const subCategory = require('../../Model/subCategoryModel');
const ApiError = require('../apiError');
exports.createCateogryValidetor =[

    check('name')
    .notEmpty().withMessage('Category required')
     .isLength({min:3}).withMessage('Too short category name')
     .isLength({max:32}).withMessage('Too long category name')
     .custom((val , {req})=>{
        req.body.slug = slugify(val);
        return true;
     }) ,

     validetorMiddleware,

];
exports.updateCategoryValidetor =[
    check('id').isMongoId().withMessage('Invalid category ID format'),

    check('name')
    .notEmpty().withMessage('Category required')
     .isLength({min:3}).withMessage('Too short category name')
     .isLength({max:32}).withMessage('Too long category name')
     .custom((val , {req})=>{
        req.body.slug = slugify(val);
        return true;
     }) ,


    , validetorMiddleware
];
exports.deletedCategoryValidetor =[
    check('id').isMongoId().withMessage('Invalid category ID format')
     .custom( async(value)=>{
        const subdou = await subCategory.findOne({Category:value});
        if(subdou){ throw new ApiError('❌ Cannot delete category: it has related subcategories.')}
        return true;
     })


    , validetorMiddleware
];