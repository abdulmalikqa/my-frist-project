const slugify = require('slugify');
const { check, body } = require('express-validator');
const validetorMiddleware = require('../../middlewares/validetorMiddleware');
const categoryModel = require('../../Model/categoryModel');
const subcategoryModel = require('../../Model/subCategoryModel');
const mongoose = require('mongoose');
const apiError = require('../apiError')
exports.createProductValidator = [
  check('title')
    .notEmpty().withMessage('Product title is required')
    .isLength({ min: 3 }).withMessage('Too short product name')
    .isLength({ max: 100 }).withMessage('Too long product name')
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check('description')
    .notEmpty().withMessage('Product description is required')
    .isLength({ max: 500 }).withMessage('Too long description'),

  check('quantity')
    .notEmpty().withMessage('Product quantity is required')
    .isNumeric().withMessage('Product quantity must be a number'),

  check('sold')
    .optional()
    .isNumeric().withMessage('Sold must be a number'),

  check('price')
    .notEmpty().withMessage('Product price is required')
    .isFloat().withMessage('Price must be a number'),

  check('priceAfterDiscount')
    .optional()
    .isFloat().withMessage('priceAfterDiscount must be a number')
    .custom((value, { req }) => {
      if (req.body.price && value >= req.body.price) {
        throw new Error('priceAfterDiscount must be lower than price');
      }
      return true;
    }),

  check('colors')
    .optional()
    .isArray().withMessage('Colors should be an array of strings'),

  check('imageCover')
    .optional()
    .notEmpty().withMessage('Product imageCover is required'),

  check('images')
    .optional()
    .isArray().withMessage('Images should be an array of strings'),

  check('Category')
    .notEmpty().withMessage('Product must belong to a category')
    .isMongoId().withMessage('Invalid ID format')
    .custom(async (value) => {
      const category = await categoryModel.findById(value);
      if (!category) {
        throw new Error('Category not found');
      }
      return true;
    }),

  check('subcategories')
     .optional()
  .isArray().withMessage('Subcategories should be an array')
  .custom(async (value, { req }) => {
    if (!value || value.length === 0) return true;

    const subcategories = await subcategoryModel.find(
      { 
          _id: { $in: value },
       Category: req.body.Category
    }).lean()  // استخدم .lean() لتحسين الأداء
 
     
    if (subcategories.length !== value.length) {
  
      throw new Error(`Some subcategories do not belong to the specified category or do not exist`);
    }
    return true;
  }),

  check('brand')
    .optional()
    .isMongoId().withMessage('Invalid ID format'),

  check('ratingsAverage')
    .optional()
    .isFloat({ min: 1, max: 5 }).withMessage('Rating must be between 1.0 and 5.0'),

  check('ratingsQuantity')
    .optional()
    .isNumeric().withMessage('ratingsQuantity must be a number'),

  validetorMiddleware,
];

exports.getProductValidator = [
  check('id').isMongoId().withMessage('Invalid ID format'),
  validetorMiddleware,
];

exports.updateProductValidator = [
  check('id').isMongoId().withMessage('Invalid ID format'),

   body('title')
    .optional()
    .notEmpty().withMessage('Product title is required')
    .isLength({ min: 3 }).withMessage('Too short product name')
    .isLength({ max: 100 }).withMessage('Too long product name')
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  body('description')
    .optional()
    .notEmpty().withMessage('Product description is required')
    .isLength({ max: 500 }).withMessage('Too long description'),

  body('quantity')
    .optional()
    .notEmpty().withMessage('Product quantity is required')
    .isNumeric().withMessage('Product quantity must be a number'),

  check('price')
    .optional()
    .notEmpty().withMessage('Product price is required')
    .isFloat().withMessage('Price must be a number'),

  check('priceAfterDiscount')
    .optional()
    .isFloat().withMessage('priceAfterDiscount must be a number')
    .custom((value, { req }) => {
       
      if (req.body.price && value >= req.body.price) {
       
        throw new Error('priceAfterDiscount must be lower than price');
      }
      return true;
    }),

  check('colors')
    .optional()
    .isArray().withMessage('Colors should be an array of strings'),

  check('imageCover')
    .optional()
    .notEmpty().withMessage('Product imageCover is required'),

  check('images')
    .optional()
    .isArray().withMessage('Images should be an array of strings'),

  check('Category')
    .optional()
    .notEmpty().withMessage('Product must belong to a category')
    .isMongoId().withMessage('Invalid ID format')
    .custom(async (value) => {
      const category = await categoryModel.findById(value);
      if (!category) {
        throw new Error('Category not found');
      }
      return true;
    }),

  check('subcategories')
     .optional()
  .isArray().withMessage('Subcategories should be an array')
  .custom(async (value, { req }) => {
    if (!value || value.length === 0) return true;

    const subcategories = await subcategoryModel.find(
      { 
          _id: { $in: value },
       Category: req.body.Category
    }).lean()  // استخدم .lean() لتحسين الأداء
 
     
    if (subcategories.length !== value.length) {
  
      throw new Error(`Some subcategories do not belong to the specified category or do not exist`);
    }
    return true;
  }),

  check('brand')
    .optional()
    .isMongoId().withMessage('Invalid ID format'),

  check('ratingsAverage')
    .optional()
    .isFloat({ min: 1, max: 5 }).withMessage('Rating must be between 1.0 and 5.0'),

 
  validetorMiddleware,
];

exports.deleteProductValidator = [
  check('id').isMongoId().withMessage('Invalid ID format'),
  validetorMiddleware,
];
