 
const Order = require('../Model/orderSchema');
const asyncHandler = require('express-async-handler');
/**
 * 
 * كل تقرير يعرض إحصائية مهمة للإدارة والتسويق.
   إمكانية عرضها في لوحة تحكم (Dashboard).
   تحسين القرارات المستقبلية.
 */
 // تقرير: أكثر المنتجات مبيعًا
exports.getTopSellingProducts = asyncHandler(async (req, res) => {
  const topProducts = await Order.aggregate([
    { $unwind: '$cartItems' },
    {
      $group: {
        _id: '$cartItems.product',
        totalSold: { $sum: '$cartItems.quantity' },
        totalRevenue: { $sum: { $multiply: ['$cartItems.quantity', '$cartItems.price'] } },
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: '$product' },
    {
      $project: {
        productTitle: '$product.title',
        totalSold: 1,
        totalRevenue: 1,
        price: '$product.price'
      }
    }
  ]);

  res.status(200).json({ status: 'success', data: topProducts });
});
//تقرير: إجمالي المبيعات شهريًا خلال آخر سنة
exports.getMonthlySales = asyncHandler(async (req, res) => {
  const year = parseInt(req.query.year) || new Date().getFullYear();

  const monthlySales = await Order.aggregate([
    {
      $match: {
        isPaid: true,
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { month: { $month: '$createdAt' } },
        totalSales: { $sum: '$totalOrderPrice' },
        ordersCount: { $sum: 1 }
      }
    },
    { $sort: { '_id.month': 1 } }
  ]);

  res.status(200).json({ status: 'success', data: monthlySales });
});
// العملاء الاكثر شراء
exports.getTopCustomers = asyncHandler(async (req, res) => {
  const topCustomers = await Order.aggregate([
    { $match: { isPaid: true } },
    {
      $group: {
        _id: '$user',
        totalSpent: { $sum: '$totalOrderPrice' },
        ordersCount: { $sum: 1 }
      }
    },
    { $sort: { totalSpent: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $project: {
        name: '$user.name',
        email: '$user.email',
        totalSpent: 1,
        ordersCount: 1
      }
    }
  ]);

  res.status(200).json({ status: 'success', data: topCustomers });
});
//اجمالي الطلبات حسب حالة الطلب 
exports.getOrdersByStatus = asyncHandler(async (req, res) => {
  const statusCounts = await Order.aggregate([
    {
      $group: {
        _id: '$orderStatus',
        count: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({ status: 'success', data: statusCounts });
});
