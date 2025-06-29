
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({

    title:{
        type : String,
        required: true,
        trim : true,
        minlength:[3 , 'Too short prodect title'],
        maxlength:[100,'Too long prodect title']

    },
    slug:{
        type:String,
        required: true,
        lowercase: true,
    },
    description:{
        type: String,
        required:[true,'Product description is required'],
        minlength:[20,'Too short product description'],
    },
    //كمية المنتج
    quantity:{
        type:Number,
        required:[true,'Product quantity']
    },
    //كم الكمية التي اباعت من بداية المنتج
    sold:{
        type: Number,
        default:0
    },
    //سعر المنتج
    price:{
        type:Number,
        required:[true,'Product price is required'],
        trim: true,
        max:[250000,'Too long product price'],
    },
    //سعر المنتج بعد الخصم
    priceAfterDiscount:{
    type: Number,
    // validate: {
    //     validator: function(val) {
    //         return val < this.price;
    //     },
    //     message: 'Discount price ({VALUE}) should be below the regular price'
    // }
    },
    //الوان المنتج
    colors: {
    type: [String],
    default: []
        },

  inStock: {
    type: Boolean,
    default: true
},
    //الصورة التي تظهر على المنتج اول القائمة
    imageCover:{
   type: String,
   required:[true,'Product Image cover is required']
    },
    //صور المنتج
    images:{
       type: [String],
    default: []
    },
//تابع لاي صنف
    Category:{
        type:mongoose.Schema.ObjectId,
        ref:'Category',
        required:[true,'Product must be belong to  category'],

    },
    //الصنف التابع
    subcategories:[
        {
        type : mongoose.Schema.ObjectId,
        ref:'subCategory'

    },
],
//الماركة
brand:{
    type:mongoose.Schema.ObjectId,
    ref:'Brand'
},
//ratingsAverage
ratingsAverage:{
    type:Number,
    min:[1,'Rating must be above or equal 1.0'],
    max:[5,'Rating must be below or equal 5.0']

},
ratingsQuantity:
{
 type:Number,
 default:0,
},

isDeleted: {
        type: Boolean,
        default: false
    },

},{timestamps: true});

productSchema.pre(/^find/, function (next) {
    // 1️⃣ استبعاد المنتجات المحذوفة (Soft Delete)
    this.find({ isDeleted: { $ne: true } });

    // 2️⃣ Populate المرتبط
    this.populate({ path: 'Category', select: 'name' })
        .populate({ path: 'subcategories', select: 'name' })
        .populate({ path: 'brand', select: 'name' });

    next();
});
// productSchema.pre("find" , function(next){

//     this.populate({path:'category' , select:'name'});
//     next();
// });
module.exports= mongoose.model('Product', productSchema);



// const mongoose = require('mongoose');

// const productSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'Product name is required'],
//     unique: true,
//     trim: true,
//     minlength: [3, 'Too short product name'],
//     maxlength: [100, 'Too long product name']
//   },
//   nameAr: {
//     type: String,
//     default: ''
//   },
//   description: {
//     type: String,
//     default: ''
//   },
//   fullDescription: {
//     type: String,
//     default: ''
//   },
//   price: {
//     type: Number,
//     required: [true, 'Product price is required'],
//     min: [0, 'Price cannot be below 0']
//   },
//   priceAfterDiscount: {
//     type: Number,
//     min: [0, 'Discount price cannot be below 0']
//   },
//   availableQuantity: {
//     type: Number,
//     default: 0
//   },
//   imageCover: {
//     type: String,
//     default: ''
//   },
//   images: [String],
//   category: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Category',
//     required: [true, 'Product must belong to a category']
//   },
//   brand: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Brand'
//   },
//   isFeatured: {
//     type: Boolean,
//     default: false
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now
//   }
// } ,   { timestamps : true});

// module.exports = mongoose.model('Product', productSchema);
