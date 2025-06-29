const express = require('express')

const{getBrandValidator,createBrandValidator,updateBrandValidator,deletedBrandValidator } = require('../utils/validetors/brandValidator')

const {createBrand,deletedBrand,updateBrand , getBrandbyID,getBrand} = require('../services/brandService')

const route = express.Router();
route.post('/', createBrandValidator,createBrand)
route.get('/',getBrand)
route.put('/:id',updateBrandValidator,updateBrand)
route.get('/:id',getBrandValidator,getBrandbyID)
route.delete('/:id',deletedBrandValidator,deletedBrand)

module.exports = route