const express = require('express')

const{ softDeleteProduct , uploadProductImage ,resizeImageProduct, createOnProduct 
     , getListProduct , getProductById , updateProduct , updateProductImages
     , hardDeleteProduct
} = require('../services/productService');

const{ createProductValidator , getProductValidator , updateProductValidator ,deleteProductValidator}= require('../utils/validetors/productValidator')

//  const authService = require('../services/authService')

const route = express.Router();
 
route.post('/',
    //authService.protect , 
    //authService.allowedTo('admin', 'manager'),
    uploadProductImage, resizeImageProduct,  createProductValidator ,    createOnProduct)
route.get('/', getListProduct)
route.get('/:id',getProductValidator, getProductById)
route.put('/:id',
    //authService.protect , 
    //authService.allowedTo('admin', 'manager'),
    uploadProductImage,
    updateProductImages ,
    updateProductValidator, updateProduct);
    route.delete('/:id',
          //authService.protect , 
        //authService.allowedTo('admin', 'manager'),
        deleteProductValidator, softDeleteProduct);
route.delete('/herdDelete/:id',
          //authService.protect , 
        //authService.allowedTo('admin', 'manager'),
         hardDeleteProduct)
         
module.exports = route;