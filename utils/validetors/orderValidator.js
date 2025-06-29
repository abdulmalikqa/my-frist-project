const { check, body } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validetorMiddleware'); 
const mongoose = require('mongoose');
const Product = require('../../Model/productModel'); 

exports.createOrderValidator = [
  // cartItems يجب أن تكون مصفوفة
  check('cartItems')
    .isArray({ min: 1 }).withMessage('Cart items must be an array with at least one item'),

  // تحقق من كل عنصر داخل cartItems
  body('cartItems').custom(async (items) => {
    for (const item of items) {
      if (!item.product || !mongoose.Types.ObjectId.isValid(item.product)) {
        throw new Error('Each cart item must have a valid product ID');
      }

      // تحقق أن المنتج موجود
      const product = await Product.findById(item.product);
      if (!product) {
        throw new Error(`Product not found: ${item.product}`);
      }

      if (!item.quantity || item.quantity <= 0) {
        throw new Error('Each cart item must have a quantity greater than 0');
      }

      // اختياري: تحقق أن السعر مطابق لسعر المنتج
      if (item.price && item.price !== product.price) {
        throw new Error(`Price mismatch for product: ${product.title}`);
      }
    }
    return true;
  }),

  // shippingAddress
  check('shippingAddress')
    .isObject().withMessage('shippingAddress must be an object'),

  check('shippingAddress.details')
    .optional()
    .isString().withMessage('Address details must be a string'),

  check('shippingAddress.phone')
    .optional()
    .isMobilePhone().withMessage('Invalid phone number'),

  check('shippingAddress.city')
    .optional()
    .isString().withMessage('City must be a string'),

  check('shippingAddress.postalCode')
    .optional()
    .isString().withMessage('Postal code must be a string'),

  // paymentMethod
  check('paymentMethod')
    .optional()
    .isIn(['cash', 'card']).withMessage('Payment method must be cash or card'),

  // discount
  check('discount')
    .optional()
    .isFloat({ min: 0 }).withMessage('Discount must be a positive number'),

  validatorMiddleware,
];
//لتحديث حالة الطلب إلى مدفوع أو تم التوصيل
exports.updateOrderStatusValidator = [
  check('id')
    .isMongoId().withMessage('Invalid order ID'),

  // تحديث حالة الدفع
  check('isPaid')
    .optional()
    .isBoolean().withMessage('isPaid must be true or false'),

  check('paidAt')
    .optional()
    .isISO8601().withMessage('paidAt must be a valid date'),

  // تحديث حالة التوصيل
  check('isDelivered')
    .optional()
    .isBoolean().withMessage('isDelivered must be true or false'),

  check('deliveredAt')
    .optional()
    .isISO8601().withMessage('deliveredAt must be a valid date'),

  validatorMiddleware,
];
//لحذف الطلب 
exports.deleteOrderValidator = [
  check('id')
    .isMongoId().withMessage('Invalid order ID'),

  validatorMiddleware,
];