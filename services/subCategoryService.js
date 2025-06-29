const handlerFactory = require('../services/handlerFactory')
const subCategory = require('../Model/subCategoryModel') 
const asyncHandler = require('express-async-handler')
const ApiError = require('../utils/apiError')
exports.createSubCategory = handlerFactory.CreateOne(subCategory)

exports.updateSubCategory = handlerFactory.UpdateData(subCategory,'subCategory')

exports.getlistsubcategory= handlerFactory.getAll(subCategory,'subCategory')

exports.deleteOneById= handlerFactory.DeletedOn(subCategory,'subCategory')
exports.crateSubId = (req , res ,next)=>{
console.log(req.body.Category)
    if(req.params.Category)
        req.body.Category = req.params.Category;

     
    next()
}

exports.CreateOneOrArray = asyncHandler(async (req, res) => {
      const { categoryId } = req.params;

  const isArray = Array.isArray(req.body);

  // أضف categoryId لكل عنصر
  if (isArray) {
    req.body = req.body.map(item => ({
      ...item,
      Category: categoryId,
    }));
  } else {
    req.body.Category = categoryId;
  }

  try {
    const doc = isArray
      ? await subCategory.insertMany(req.body, { ordered: false })
      : await subCategory.create(req.body);

    res.status(201).json({
      status: 'success',
      type: isArray ? 'array' : 'single',
      data: doc,
    });
  } catch (err) {
    console.error('❌ Insert Error:', err);
    res.status(400).json({
      status: 'error',
      message: err.message,
      error: err,
    });
  }
});

exports.deletedAllsubByIdCateyogry = asyncHandler(async(req,res,next)=>{
    const { categoryId } = req.params;
    const result = await subCategory.deleteMany({Category :categoryId })
    if(!result)
    {
      return next(new ApiError(`Not foud ID ${categoryId}` , 404))
    }

    res.status(201).json({
      status: 'success',
    
      DeletedCount: result.deletedCount,})
})