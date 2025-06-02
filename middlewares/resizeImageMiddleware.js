

const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const resizeImage = (folderName, imageField) => {
  return async (req, res, next) => {
   const uploadDir = path.join(__dirname, `../uploads/${folderName}`);

    // تأكد من وجود المجلد
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // إذا لم تُرسل صورة جديدة لكن طُلب حذف الصورة
    if (!req.file && req.oldImage && req.body.deleteImage === 'true') {
      const oldImagePath = path.join(uploadDir, req.oldImage);
      fs.unlink(oldImagePath, (err) => {
        if (err) {
          console.warn(`Failed to delete old image: ${oldImagePath}`);
        }
      });

      req.body[imageField] = undefined; // حذف من قاعدة البيانات
      return next();
    }

    // إذا لم يتم رفع صورة جديدة ولم يُطلب حذف، لا تفعل شيء
    if (!req.file) {
      return next();
    }

    // حفظ الصورة الجديدة
    const filename = `${imageField}-${uuidv4()}-${Date.now()}.jpeg`;
    const outputPath = path.join(uploadDir, filename);

    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat('jpeg')
      .jpeg({ quality: 95 })
      .toFile(outputPath);

    // حذف الصورة القديمة إن وُجدت
    if (req.oldImage) {
      const oldImagePath = path.join(uploadDir, req.oldImage);
      fs.unlink(oldImagePath, (err) => {
        if (err) {
          console.warn(`Failed to delete old image: ${oldImagePath}`);
        }
      });
    }

    // تخزين الاسم في الطلب
    req.body[imageField] = filename;

    next();
  };
};

module.exports = resizeImage;



// const sharp = require('sharp');
// const fs = require('fs');
// const path = require('path');
// const { v4: uuidv4 } = require('uuid');

// /**
//  * Middleware to resize, compress, and save uploaded image using Sharp.
//  *
//  * @param {String} folder - Folder name to save the image inside `uploads/`
//  * @param {String} fieldName - Field name to store in DB (e.g. "image", "profileImg")
//  * @param {Number} width - Width to resize (default 600)
//  * @param {Number} height - Height to resize (default 600)
//  * @returns Express middleware
//  */
// const resizeImage = (folder, fieldName, width = 600, height = 600) => {
//   return async (req, res, next) => {
//     try {
//       if (!req.file) return next();

//       // Ensure directory exists
//       const uploadPath = path.join(__dirname, `../uploads/${folder}`);
//       if (!fs.existsSync(uploadPath)) {
//         fs.mkdirSync(uploadPath, { recursive: true });
//       }

//       // Generate file name
//       const filename = `${folder.toLowerCase()}-${uuidv4()}-${Date.now()}.jpeg`;

//       // Process image with sharp
//       await sharp(req.file.buffer)
//         .resize(width, height)
//         .toFormat('jpeg')
//         .jpeg({ quality: 95 })
//         .toFile(path.join(uploadPath, filename));

//       // Store the filename in the request body for DB usage
//       req.body[fieldName] = filename;

//       next();
//     } catch (err) {
//       next(err);
//     }
//   };
// };

// module.exports = resizeImage;

/**
 * // utils/resizeImage.js
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// /**
//  * Middleware to resize and save an uploaded image buffer using sharp.
//  * It updates req.body[imageFieldName] with the filename.
//  *
//  * @param {string} folderName - Name of the folder to save image in (e.g., 'User', 'Product')
//  * @param {string} imageFieldName - Field name from form (e.g., 'profileImg', 'image')
//  */
// const resizeImage = (folderName, imageFieldName) => async (req, res, next) => {
//   try {
//     if (!req.file) return next();

//     // Ensure the directory exists
//     const uploadPath = path.join(__dirname, `../uploads/${folderName}`);
//     if (!fs.existsSync(uploadPath)) {
//       fs.mkdirSync(uploadPath, { recursive: true });
//     }

//     const filename = `${folderName.toLowerCase()}-${uuidv4()}-${Date.now()}.jpeg`;

//     await sharp(req.file.buffer)
//       .resize(600, 600)
//       .toFormat('jpeg')
//       .jpeg({ quality: 95 })
//       .toFile(path.join(uploadPath, filename));

//     req.body[imageFieldName] = filename;
//     next();
//   } catch (err) {
//     return res.status(500).json({ message: 'Image processing failed', error: err.message });
//   }
// };

// module.exports = resizeImage;
 