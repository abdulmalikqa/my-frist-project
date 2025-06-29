const brandShcema = require('../Model/brandSchema')
const handlerfactory = require('../services/handlerFactory')

//@dec Create Category
//@route Post /api/v1/brands
//@access private
exports.createBrand = handlerfactory.CreateOne(brandShcema);
 //@desc Deleted Brand
 //@route DELETE /api/v1/brands/:id
 //@access private
 exports.deletedBrand=handlerfactory.DeletedOn(brandShcema , ' Brand ');
  //@desc updet specific Brand
 //@route put /api/v1/Brand/:id
 //@access private 
  exports.updateBrand = handlerfactory.UpdateData(brandShcema , ' Brand ');

// @desc    Get  specific brand by id  
 //@rout   Get/api/v1/Brand/:id
 //@access  public
 exports.getBrandbyID= handlerfactory.getDataById(brandShcema ,' Brand ');

 // @desc    Get List of Brands
 //@rout   Get/api/v1/Brands
 //@access  public
exports.getBrand =handlerfactory.getAll(brandShcema , ' Brand ');
