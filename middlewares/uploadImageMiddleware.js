//multer: مكتبة متخصصة في رفع الملفات عبر Express.
// eslint-disable-next-line import/no-extraneous-dependencies
const multer = require('multer');
//ApiError: كلاس مخصص لإرسال رسائل خطأ بصيغة JSON مهيكلة.
const ApiError = require('../utils/apiError');

const multerOptions = () => {

  //يتم تخزين الملفات موقتًا في الذاكرة وليس على القرص.
  const multerStorage = multer.memoryStorage();

  //هذا فلتر يتحقق إن كان نوع الملف image/*.
  const multerFilter = function (req, file, cb) {
    if (file.mimetype.startsWith('image')) {
      cb(null, true); 
    } else {
      cb(new ApiError('Only Images allowed', 400), false);
    }
  };

  // دمج الإعدادات في Multer
  //الآن أصبحت لدينا نسخة مخصصة من multer
  //تخزن في الذاكرة. storage: multerStorage
  //تقبل فقط الصور fileFilter: multerFilter
  const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

  return upload;
};

/**
 * رفع صورة واحدة
 * تتيح لك رفع صورة واحدة فقط من خلال حقل معين (مثل image أو profilePic).
 * @param {*} fieldName 
 * @returns 
 */
exports.uploadSingleImage = (fieldName) => multerOptions().single(fieldName);

/**
 * تتيح لك رفع أكثر من صورة من حقول مختلفة.
 * @param {*} arrayOfFields 
 * @returns 
 */
exports.uploadMixOfImages = (arrayOfFields) => multerOptions().fields(arrayOfFields);