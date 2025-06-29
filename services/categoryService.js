const handlerFactory = require('../services/handlerFactory')
const categorySchema = require('../Model/categoryModel');

exports.createCategory = handlerFactory.CreateOne(categorySchema);

exports.updateCategory = handlerFactory.UpdateData(categorySchema ,'category');

exports.getCategorybyId = handlerFactory.getDataById(categorySchema ,'category');

exports.getCategoryAll = handlerFactory.getAll(categorySchema ,'category');

exports.deletedCategory = handlerFactory.DeletedOn(categorySchema ,'category');