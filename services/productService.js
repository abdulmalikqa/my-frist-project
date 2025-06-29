const Product = require("../Model/productModel"); // capital P
const Order = require("../Model/orderSchema");
const asyncHandler = require("express-async-handler");
const handlerFactory = require("./handlerFactory");
const { uploadMixOfImages } = require("../middlewares/uploadImageMiddleware");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const { error } = require("console");
 
const allowedFieldsToUpdate = [
  'title',
  'description',
  'price',
  'priceAfterDiscount',
  'quantity',
  'colors',
  'Category',
  'subcategories',
  'brand',
  'imageCover',
  'images'
];
exports.uploadProductImage = uploadMixOfImages([
  {
    name: "imageCover",
    maxCount: 1,
  },
  {
    name: "images",
    maxCount: 5,
  },
]);

exports.resizeImageProduct = asyncHandler(async (req, res, next) => {
  const uploadDir = path.join(__dirname, `../uploads/Products`);

   
      // تأكد من وجود المجلد
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
   
  // 1- Process ImageCover
  if (req.files.imageCover) {
    //Name Image Product Cover
    const imageProductCover = `product-${uuidv4()}-${Date.now()}-Cover.jpeg`;
    //الصورة المخزنة
    await sharp(req.files.imageCover[0].buffer)
      //ابعاد الصورة الطوب و العرض
      .resize(2000, 1333)
      // صيغة الصورة
      .toFormat("jpeg")
      //دقة الصورة او جودة الصورة وهي بين 0-100
      .jpeg({ quality: 90 })
      //
      //   .toFile(`uploads/Products/${imageProductCover}`)
      .toFile(path.join(uploadDir, imageProductCover));

    req.body.imageCover = imageProductCover;
  }
  // 2-process list Images Product

  if (req.files.images) {
    //Creat array image in body to save file names to end process
    req.body.images = [];

    await Promise.all(
      req.files.images.map(async (img, index) => {
        const nameImg = `product-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;

        //الصورة المخزنة
        await sharp(img.buffer)
          //ابعاد الصورة الطوب و العرض
          .resize(2000, 1333)
          // صيغة الصورة
          .toFormat("jpeg")
          //دقة الصورة او جودة الصورة وهي بين 0-100
          .jpeg({ quality: 90 })
          //
          //.toFile(`uploads/Product/${nameImg}`)
          .toFile(path.join(uploadDir, nameImg));;


          req.body.images.push(nameImg)
      })
    );
    next()
  }
});

//@desc Soft Delete
//@route PUT /api/v1/product/:id
//@access Private
exports.softDeleteProduct = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findById(productId); // استخدم الـ Model الصحيح
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  // 🔍 تحقق من وجود المنتج في أي طلب
  const existingOrder = await Order.findOne({ "products.product": productId }).lean();

  if (existingOrder) {
    return res.status(400).json({
      message: "Cannot delete product: it is linked to existing orders.",
    });
  }

  // Rule: منع حذف منتج له مبيعات (sold > 0)
  if (product.sold > 0) {
    return res
      .status(400)
      .json({ message: "Cannot delete: product has been sold before" });
  }

  product.isDeleted = true;
  await product.save();

  return res.status(200).json({
    status: 'success',
    message: "Product soft-deleted successfully",
  });
});

// @desc    Create new product
// @route   POST /api/v1/products
// @access  Private/Admin
exports.createOnProduct = handlerFactory.CreateOne(Product);
// @desc    get List product
// @route   get /api/v1/products
// @access  public/all
exports.getListProduct = handlerFactory.getAll(Product , 'Product')

// @desc    get  product by ID
// @route   get /api/v1/products/:id
// @access  public/all
exports.getProductById =   asyncHandler(async (req, res) => {
  let query = Product.findById(req.params.id);

  // إذا فيه fields في الـ query string
  if (req.query.fields) {
    // نحول fields من "title,imageCover,price" إلى "title imageCover price"
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields);
  }

  const product = await query;

  if (!product) {
    return res.status(404).json({ status: 'error', message: 'Product not found' });
  }

  res.status(200).json({
    status: 'success',
    data: product
  });
});

exports.updateProductImages = asyncHandler(async(req,res,next)=>{
const productId = req.params.id;
const product = await Product.findById(productId)
if(!product)
{
 return next(new Error('Product not found'));
}
   //  معالجة الصورة الرئيسية imageCover
if(req.files && req.files.imageCover)
{
    //Deleted old iimage
    if(product.imageCover)
    {
        const oldCoverimag = path.join(__dirname, `../uploads/Products/${product.imageCover}`)
        //check imageCover in folder 
        if(fs.existsSync(oldCoverimag))
        {
            //deleted imageCover
            fs.unlinkSync(oldCoverimag)
        }
    }

        // حفظ الصورة الجديدة
    const imageCoverName = `product-${uuidv4()}-${Date.now()}-Cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`uploads/products/${imageCoverName}`);
  // نحفظ الاسم الجديد في req.body ليتم تحديثه في DB
    req.body.imageCover = imageCoverName;

}
 //  معالجة الصور المتعددة images

 if(req.files && req.files.images)
 {
     // حذف الصور القديمة من الملف
     if(product.images && product.images.length >0)
     {
        product.images.forEach((img)=> {
            
            const oldimages = path.join(__dirname, `../uploads/products/${img}`)
        //check imageCover in folder 
        
        if(fs.existsSync(oldimages))
        {
            //deleted imageCover
            fs.unlinkSync(oldimages)
            
        }
        });
     }

     // حفظ الصور الجديدة
     const newImage =[]
     await Promise.all(
        req.files.images.map(async(img,index)=>{

            const nameImg = `product-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;

        //الصورة المخزنة
        await sharp(img.buffer)
          //ابعاد الصورة الطوب و العرض
          .resize(2000, 1333)
          // صيغة الصورة
          .toFormat("jpeg")
          //دقة الصورة او جودة الصورة وهي بين 0-100
          .jpeg({ quality: 90 })
          //
          .toFile(`uploads/products/${nameImg}`)
          
         newImage.push(nameImg)
        })
     );
         // نحفظ الأسماء الجديدة في req.body ليتم تحديثها في DB
         req.body.images = newImage;
 }
 next();

})
exports.updateProduct = asyncHandler(async (req, res, next) => {
  // إنشاء كائن جديد يحتوي فقط على الحقول المسموحة

  const filteredBody = {};
  Object.keys(req.body).forEach((field) => {
    if (allowedFieldsToUpdate.includes(field)) {
      filteredBody[field] = req.body[field];
    }
  });
  // 1️⃣ الحصول على المنتج الحالي من قاعدة البيانات
    const product = await Product.findById(req.params.id);

    // 3️⃣ التحقق من priceAfterDiscount مقابل السعر الجديد أو القديم
  const newPrice = req.body.price !== undefined ? req.body.price : product.price;
  const newPriceAfterDiscount = req.body.priceAfterDiscount !== undefined
    ? req.body.priceAfterDiscount
    : product.priceAfterDiscount;

  if (newPriceAfterDiscount >= newPrice) {
    return next(new Error('priceAfterDiscount must be lower than price', 400));
  }

  // 4️⃣ إذا المستخدم أرسل priceAfterDiscount فقط بدون price → نضيف السعر الحالي للـ update حتى يعمل validator
  if (req.body.priceAfterDiscount && !req.body.price) {
    filteredBody.price = product.price;
  }
//   // 1️⃣ الحصول على المنتج الحالي من قاعدة البيانات
//   const product = await Product.findById(req.params.id);
//   if(req.body.price && (!req.body.priceAfterDiscount))
//     {
//         if(product.priceAfterDiscount >= req.body.price)
//         {
//                return next(new Error('The price must be greater than the discount.', 400));

//         }
//     }

//      if(req.body.priceAfterDiscount && (!req.body.price))
//     {
//         if(req.body.priceAfterDiscount  >= product.price)
//         {
//                return next(new Error('priceAfterDiscount must be lower than price', 400));

//         }
//     }
   
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    filteredBody,
    { new: true, runValidators: true }
  );
 
  if (!updatedProduct) {
    return next(new Error('Product not found'));
  }

  res.status(200).json({ status: 'success', data: updatedProduct });
});

//هذا الكود يعيد تفعيل المنتج بجعل isDeleted = false:
exports.restoreProduct = asyncHandler(async (req, res, next) => {
  const productId = req.params.id;

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  if (!product.isDeleted) {
    return res.status(400).json({ message: "Product is already active" });
  }

  product.isDeleted = false;
  await product.save();

  res.status(200).json({
    status: 'success',
    message: "Product restored successfully",
    data: product
  });
});
//هذا الكود يحذف السجل نهائيًا من قاعدة البيانات:
exports.hardDeleteProduct = asyncHandler(async (req, res, next) => {
  const productId = req.params.id;

  // 1️⃣ جلب المنتج لمعرفة أسماء الصور
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  // 2️⃣ حذف الصورة الرئيسية إن وجدت
  if (product.imageCover) {
    const coverPath = path.join(__dirname, `../uploads/Product/${product.imageCover}`);
    if (fs.existsSync(coverPath)) {
      fs.unlinkSync(coverPath);
    }
  }

  // 3️⃣ حذف باقي الصور إن وجدت
  if (product.images && product.images.length > 0) {
    product.images.forEach((imgName) => {
      const imgPath = path.join(__dirname, `../uploads/Product/${imgName}`);
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    });
  }

  // 4️⃣ حذف المنتج من قاعدة البيانات
  await Product.findByIdAndDelete(productId);

  res.status(200).json({
    status: 'success',
    message: "Product and its images permanently deleted"
  });
});
