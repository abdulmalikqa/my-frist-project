const validetorMiddleware = require('../../middlewares/validetorMiddleware');
const {check , body , param} = require('express-validator')
const slugify = require('slugify');
const subCategory = require('../../Model/subCategoryModel');
const category = require('../../Model/categoryModel') 

exports.createSubCateogryValidetor =[

    check('name')
    .notEmpty().withMessage('subCategory required')
     .isLength({min:3}).withMessage('Too short subcategory name')
     .isLength({max:32}).withMessage('Too long subcategory name')
     .custom((val , {req})=>{
        req.body.slug = slugify(val);
        return true;
     }) ,
     check('Category')
     .isMongoId().withMessage('Invalid category ID format')
     .notEmpty().withMessage("subCategory must be belong to category")
     .custom(async(val)=>{
        const doucmResult = await category.findById(val)
        if(!doucmResult){throw new Error('Not found Category...')}
        return true
     })

    , validetorMiddleware,

];

exports.crsuVar =[

   param('categoryId')
    .notEmpty().withMessage('Category ID is required')
    .isMongoId().withMessage('Invalid Category ID format')
    .custom(async (val) => {
      const cat = await category.findById(val);
      if (!cat) throw new Error('Category not found');
      return true;
    }),

  // تحقق من أن body عبارة عن مصفوفة أسماء صحيحة
  body().custom((names, { req }) => {
    if (!Array.isArray(names)) {
      throw new Error('Expected an array of names');
    }

    req.body = names.map((name, index) => {
      if (!name) throw new Error(`Item ${index}: Name is required`);
      if (name.length < 3) throw new Error(`Item ${index}: Name too short`);
      if (name.length > 32) throw new Error(`Item ${index}: Name too long`);

      return {
        name,
        slug: slugify(name),
        Category: req.params.categoryId
      };
    });

    return true;
  }),
];
exports.craetofArrayValidator=[
    check('[*].name')
    .notEmpty().withMessage('subCategory required')
    .isLength({ min: 3 }).withMessage('Too short subcategory name')
    .isLength({ max: 32 }).withMessage('Too long subcategory name')
    .custom((val, { req, path }) => {
      // استخرج رقم العنصر من path مثل '[0].name'
      const indexMatch = path.match(/\[(\d+)\]/);
      if (indexMatch) {
        const index = indexMatch[1];
        req.body[index].slug = slugify(val);
      }
      return true;
    }),

  check('[*].Category')
    .notEmpty().withMessage('subCategory must belong to category')
    .isMongoId().withMessage('Invalid category ID format')
    .custom(async (val) => {
      const cat = await category.findById(val);
      if (!cat) {
        throw new Error('Not found Category...');
      }
      return true;
    }),

    validetorMiddleware,
];
exports.updatesubCategoryValidator=[
     check('id').isMongoId().withMessage('Invalid subcategory id'),
     check('name').custom((val ,{req})=>{
         req.body.slug = slugify(val);
         return true;
         }), 

         check('Category').optional().isMongoId().withMessage('Invalid Category id')
        .custom(async (val) => {
      const cat = await category.findById(val);
      if (!cat) throw new Error('Category not found');
      return true;
    }),
     validetorMiddleware ,
];


// exports.deletedsubCategoryValidator=[
//      check('id').isMongoId().withMessage('Invalid subcategory id')
//      .custom(async (value)=>{ 
//                const prodect = await productModels.exists({ subcategories: value });;
//                if(prodect){ throw new Error('❌ Cannot delete subcategorغ: it has related products.'); }
//                return true;
//              })
//      ,
//      validetorMiddleware,
// ];