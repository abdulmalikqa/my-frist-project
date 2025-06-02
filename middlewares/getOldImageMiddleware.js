// middlewares/getOldImageMiddleware.js
const ApiError = require('../utils/apiError');
 
/**
 * ميدل وير عام لاستخراج اسم الصورة القديمة من أي موديل
 * @param {Mongoose.Model} model - موديل مثل userSchema أو productSchema
 * @param {string} imageField - اسم الحقل الذي يحتوي على اسم الصورة (مثل 'profileImg' أو 'image')
 */
const getOldImage = (model, imageField) => {
  return async (req, res, next) => {
    try {
      const doc = await model.findById(req.params.id);
      if (!doc) {
        return next(new ApiError(`No document found with ID ${req.params.id}`, 404));
      }

      // إن وجد حقل الصورة، خزّنه في req.oldImage
      if (doc[imageField]) {
        req.oldImage = doc[imageField];
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};
 

module.exports = getOldImage;
