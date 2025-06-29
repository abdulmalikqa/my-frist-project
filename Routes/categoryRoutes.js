const {createCategory , updateCategory ,getCategorybyId , getCategoryAll , deletedCategory} = require('../services/categoryService')
const {createCateogryValidetor , updateCategoryValidetor  , deletedCategoryValidetor} = require('../utils/validetors/categoryValidator');
const express = require('express')
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
const resizeImage = require('../middlewares/resizeImageMiddleware')
const getOldImage = require('../middlewares/getOldImageMiddleware')
const categoryModel = require('../Model/categoryModel')
const authorization = require('../services/authService')
const route = express.Router();


route.use(authorization.protect)
route.use(authorization.allowedTo('admin'))
route.post('/',uploadSingleImage('image') , createCateogryValidetor ,resizeImage('category' ,'image') , createCategory)
route.put('/:id',uploadSingleImage('image') ,getOldImage(categoryModel,'image'), updateCategoryValidetor ,resizeImage('category' ,'image')  , updateCategory)
route.get('/:id' , getCategorybyId)
route.get('/' , getCategoryAll)
route.delete('/:id' ,deletedCategoryValidetor , deletedCategory)

module.exports = route