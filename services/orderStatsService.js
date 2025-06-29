// services/orderStatsService.js
const Order = require('../Model/orderSchema');
const asyncHandler = require('express-async-handler');

// تقرير 1: نظرة عامة 
exports.getOrderOverview = asyncHandler(async (req, res) => {
    //هذه هي دالة التجميع (aggregation)
    //  التي تسمح لنا نكتب مراحل متعددة لمعالجة البيانات مباشرةً في قاعدة البيانات
    // .
  const stats = await Order.aggregate([
    {
        /**
         * هي مرحلة خاصة جدًا تسمح لنا نشغل عدة تجميعات مختلفة في نفس الوقت، والنتيجة تكون في شكل object يحتوي على مفاتيح مختلفة، كل مفتاح يمثل نتيجة مرحلة منفصلة.

           يعني بدل ما نرسل 5 استعلامات مختلفة، نرسل استعلام واحد يجمع لنا الكل دفعة واحدة.
         */
      $facet: {
        //اجمالي الطلبات 
        totalOrders: [{ $count: 'count' }],
        //اجمالي المبيعات
        totalSales: [
          { $match: { isPaid: true } },
          { $group: { _id: null, total: { $sum: '$totalOrderPrice' } } }
        ],
        //اجمالي المدفوعات
        paidOrders: [{ $match: { isPaid: true } }, { $count: 'count' }],
        //اجمالي التوصيل
        deliveredOrders: [{ $match: { isDelivered: true } }, { $count: 'count' }],
        //اجمالي الطلبات التي تم الغائها
        cancelledOrders: [{ $match: { isCancelled: true } }, { $count: 'count' }]
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      totalOrders: stats[0].totalOrders[0]?.count || 0,
      totalSales: stats[0].totalSales[0]?.total || 0,
      paidOrders: stats[0].paidOrders[0]?.count || 0,
      deliveredOrders: stats[0].deliveredOrders[0]?.count || 0,
      cancelledOrders: stats[0].cancelledOrders[0]?.count || 0,
    }
  });
});

//تقرير 2: إجمالي المبيعات في فترة زمنية
exports.getSalesInPeriod = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) {
    return res.status(400).json({ message: 'Please provide from and to dates' });
  }

  const sales = await Order.aggregate([
    {
      $match: {
        isPaid: true,
        isCancelled: false,    // استبعد الملغى
        isReturned: false,  
        createdAt: { $gte: new Date(from), $lte: new Date(to) }
      }
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: '$totalOrderPrice' },
        count: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      totalSales: sales[0]?.totalSales || 0,
      ordersCount: sales[0]?.count || 0
    }
  });
});
