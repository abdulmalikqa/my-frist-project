const express = require('express');
const orderService = require('../services/orderServices');
const orderValidator = require('../utils/validetors/orderValidator');
const router = express.Router();
const authService = require('../services/authService')
// require authService.protect أولاً إذا أردت حماية المسار
router.post(
  '/',
   authService.protect,
  orderValidator.createOrderValidator
  , orderService.createOrder
);
router.get('/:id'
  //  , authService.protect
    , orderService.getOrder);

    //تحديث حالة الدفع
    router.put('/markPaid/:id'
        , orderService.markOrderAsPaid);

    //تحديث حالة التوصيل
    router.put('/markDelivered/:id' , orderService.markOrderAsDelivered)

    //عرض جميع الطلبات 
router.get('/', 
  authService.protect, 
  authService.allowedTo('admin', 'manager'), 
  orderService.getAllOrders
);

router.put('/cancel/:id', authService.protect, orderService.cancelOrder);
router.put('/return/:id', authService.protect, orderService.returnOrder);
        

/**
 * GET /api/v1/orders/stats/overview → نظرة عامة

GET /api/v1/orders/stats/sales?from=2025-06-01&to=2025-06-30 → المبيعات لفترة

GET /api/v1/orders/stats/top-products?limit=5 → أكثر 5 منتجات مبيعًا

GET /api/v1/orders/stats/top-customers?limit=5 → أفضل 5 عملاء


 * 
 */
module.exports = router;
