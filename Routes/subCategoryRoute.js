const{createSubCateogryValidetor,craetofArrayValidator ,updatesubCategoryValidator,crsuVar } = require('../utils/validetors/subCategoryValidetor');
const{createSubCategory , updateSubCategory , getlistsubcategory , crateSubId , CreateOneOrArray , deletedAllsubByIdCateyogry} = require('../services/subCategoryService');

const express = require('express')
const route = express.Router()


 route.post('/' , createSubCateogryValidetor , createSubCategory)
// route.post('/' , craetofArrayValidator , CreateOneOrArray)
route.put('/:id',updatesubCategoryValidator , updateSubCategory)
route.get('/' , getlistsubcategory)
route.post('/:categoryId', crsuVar , CreateOneOrArray)
route.delete('/deletAll/:categoryId' , deletedAllsubByIdCateyogry)
module.exports = route;
