const express = require('express');
const { getOrderOverview, getSalesInPeriod } = require('../services/orderStatsService');

const router = express.Router();

router.get('/overview', getOrderOverview);
router.get('/sales', getSalesInPeriod);
// يمكنك إضافة المزيد: top-products, top-customers

module.exports = router;