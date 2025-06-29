const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analyticsService');

// يمكنك إضافة middlewares للتحقق أو الصلاحيات إذا أردت
router.get('/top-products', analyticsService.getTopSellingProducts);
router.get('/monthly-sales', analyticsService.getMonthlySales);
router.get('/top-customers', analyticsService.getTopCustomers);
router.get('/orders-status', analyticsService.getOrdersByStatus);

module.exports = router;
