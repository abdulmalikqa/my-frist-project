const Order = require('../Model/orderSchema'); // مسار ملف الـ orderModel
const Product = require('../Model/productModel'); // لتأكيد الأسعار
const asyncHandler = require('express-async-handler');
const sendEmail = require('../utils/sendEmail');

exports.createOrder = asyncHandler(async (req, res) => {
  const { cartItems, shippingAddress, paymentMethod, discount = 0 } = req.body;

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ message: 'Cart items are required' });
  }

  // حساب مجموع الأسعار من cartItems
  let totalItemsPrice = 0;

  for (const item of cartItems) {
    // اختياري: تأكيد سعر المنتج الحالي
    const product = await Product.findById(item.product);
    if (!product) {
      return res.status(404).json({ message: `Product not found: ${item.product}` });
    }

    //التاكد من كمية المنتج
    if (product.quantity < item.quantity) {
  return res.status(400).json({ message: `Not enough stock for product: ${product.title}` });
}

    // استخدم السعر المرسل أو سعر المنتج من قاعدة البيانات
    item.price = product.price;

    totalItemsPrice += item.quantity * item.price;
  }

  // ضرائب ثابتة كمثال (10%)
  const taxPrice = totalItemsPrice * 0.1;

  // سعر الشحن ثابت أو منطق مخصص
  const shippingPrice = 50;

  // حساب السعر النهائي
  const totalOrderPrice = totalItemsPrice + taxPrice + shippingPrice - discount;

  // إنشاء الطلب
  const order = await Order.create({
    user: req.user._id, // يعتمد أن يكون عندك middleware يضيف req.user
    cartItems,
    shippingAddress,
    paymentMethod,
    taxPrice,
    shippingPrice,
    discount,
    totalOrderPrice,
  });

    // بعد إنشاء الطلب بنجاح
  await sendEmail({
    email: req.user.email,   // بريد المستخدم
    subject: 'تم إنشاء طلبك بنجاح',
   //  html: paymentTemplate(order.user.name, order._id , 'تم إنشاء طلبك بنجاح' ,'تم إنشاء طلبك بنجاح رقم الطلب ' , 'سنقوم بمعالجتة قريبا' ),
    message: `عزيزي ${req.user.name}, طلبك رقم ${order._id} تم إنشاؤه بنجاح. سنقوم بمعالجته قريباً.`,
  });
  res.status(201).json({
    status: 'success',
    data: order,
  });
});


exports.getOrder = asyncHandler(async (req, res, next) => {
  const orderId = req.params.id;
 
  const order = await Order.findById(orderId);
 
 
  if (!order) {
    return res.status(404).json({ status: 'fail', message: 'Order not found' });
  }

  res.status(200).json({
    status: 'success',
    data: order,
  });
});

//تحديث حالة الدفع
exports.markOrderAsPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (order.isPaid) {
    return res.status(400).json({ message: 'Order is already paid' });
  }

  order.isPaid = true;
  order.paidAt = Date.now();
  await order.save();

  //  تحديث المخزون هنا فقط بعد الدفع
  for (const item of order.cartItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: {
        quantity: -item.quantity,
        sold: +item.quantity
      }
    });
  }
  // ✉️ إرسال بريد تأكيد الدفع
  await sendEmail({
    email: order.user.email,
    subject: 'تم تأكيد الدفع لطلبك',
    //html: paymentTemplate(order.user.name, order._id , 'تم تأكيد الدفع لطلبك' ,'تم الدفع بنجاح لطلبك رقم ' , 'شكرًا لتسوقك معنا!' ),
    message: `مرحبًا ${order.user.name}, تم الدفع بنجاح لطلبك رقم ${order._id}. شكرًا لتسوقك معنا!`
  });

  res.status(200).json({ status: 'success', data: order });
});


//تحديث حالة التوصيل
exports.markOrderAsDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  order.isDelivered = true;
  order.deliveredAt = Date.now();

  await order.save();

   // ✉️ إرسال بريد تأكيد التوصيل
  await sendEmail({
    email: order.user.email,
    subject: 'تم توصيل طلبك',
    //html: paymentTemplate(order.user.name, order._id , 'تم توصيل طلبك' ,'تم توصيل طلبك رقم' , 'نتمنى أن ينال إعجابك' ),
    message: `مرحبًا ${order.user.name}, تم توصيل طلبك رقم ${order._id} بنجاح. نتمنى أن ينال إعجابك!`
  });

  res.status(200).json({
    status: 'success',
    message: 'Order marked as delivered successfully',
    data: order,
  });
});

// services/orderServices.js
exports.cancelOrder = asyncHandler(async (req, res, next) => {
  const orderId = req.params.id;
  const order = await Order.findById(orderId);
  if (!order) {
    return next(new Error('Order not found', 404));
  }

  // تحقق من حالة الطلب: فقط نسمح بالإلغاء إذا لم يتم دفعه أو لم يتم توصيله
  if (order.isPaid) {
    return next(new Error('Cannot cancel: order already paid', 400));
  }

  if (order.isDelivered) {
    return next(new Error('Cannot cancel: order already delivered', 400));
  }

  order.isCancelled = true;
  order.cancelledAt = Date.now();
  await order.save();

//   // ✅ استرجاع الكمية للمخزون
//   for (const item of order.cartItems) {
//     await Product.findByIdAndUpdate(
//       item.product,
//       { $inc: { quantity: item.quantity } }
//     );
//   }

  // إرسال بريد إشعار
  await sendEmail({
    email: order.user.email,
    subject: 'تم إلغاء طلبك',
    html: cancelOrReturnTemplate(order.user.name, order._id, 'تم الإلغاء بناءً على طلبك')
  });

  res.status(200).json({
    status: 'success',
    message: 'Order cancelled successfully',
    data: order
  });
});
exports.returnOrder = asyncHandler(async (req, res, next) => {
  const orderId = req.params.id;
  const order = await Order.findById(orderId);
  if (!order) {
    return next(new Error('Order not found', 404));
  }

  console.log(order.isPaid ,'  ',  order.isDelivered )
  // تحقق من الشروط: مثل أن يكون مدفوعًا وتم تسليمه
  if (!order.isPaid || !order.isDelivered) {
    return next(new Error('Cannot return: order not paid or not delivered', 400));
  }

  order.isReturned = true;
  order.returnedAt = Date.now();
  await order.save();

  // استرجاع الكمية
  for (const item of order.cartItems) {
    await Product.findByIdAndUpdate(
      item.product,
      { $inc:
         {
             quantity: item.quantity ,  // استرجاع الكمية للمخزون
             sold: -item.quantity      // تقليل عدد المبيعات 
          }
      }
    );
  }

  // إرسال بريد إشعار
  await sendEmail({
    email: order.user.email,
    subject: 'تم استرجاع طلبك',
    html: cancelOrReturnTemplate(order.user.name, order._id, 'تم الاسترجاع بناءً على طلبك')
  });

  res.status(200).json({
    status: 'success',
    message: 'Order returned successfully',
    data: order
  });
});


//  عرض جميع الطلبات في قاعدة البيانات. غالبًا ستكون هذه العملية متاحة للمشرف (admin) أو المدير (manager) لمتابعة الطلبات.
exports.getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find(); // يمكنك أيضًا إضافة فلاتر أو Pagination أو Sort لاحقًا

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: orders,
  });
});


const paymentTemplate = (userName, orderId , titelAddress , txtMasseg , noet) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border:1px solid #ddd; border-radius:8px; overflow:hidden">
    <div style="background-color: #4CAF50; color: white; padding: 16px; text-align: center;">
      <h2>✅ ${titelAddress}</h2>
    </div>
    <div style="padding: 20px; color: #333;">
      <p>مرحبًا <strong>${userName}</strong>,</p>
      <p>${txtMasseg} <strong>${orderId}</strong>.</p>
      <p>${noet}</p>
    </div>
    <div style="background-color: #f8f8f8; padding: 10px; text-align: center; color: #888;">
      &copy; ${new Date().getFullYear()} اسم متجرك
    </div>
  </div>
`;

const cancelOrReturnTemplate = (userName, orderId, reason = 'تم إلغاء الطلب بناءً على طلبك') => `
  <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; border:1px solid #ddd; border-radius:8px; overflow:hidden;">
    <div style="background-color:#f44336; color:white; padding:16px; text-align:center;">
      <h2>🚫 إشعار إلغاء / استرجاع طلب</h2>
    </div>
    <div style="padding:20px; color:#333;">
      <p>مرحبًا <strong>${userName}</strong>,</p>
      <p>نود إعلامك بأن طلبك رقم <strong>${orderId}</strong> قد تم إلغاؤه أو استرجاعه.</p>
      <p>السبب: <em>${reason}</em></p>
      <p>إذا كان لديك أي استفسار أو تحتاج للمساعدة، لا تتردد بالتواصل معنا.</p>
    </div>
    <div style="background-color:#f8f8f8; padding:10px; text-align:center; color:#888;">
      &copy; ${new Date().getFullYear()} اسم متجرك
    </div>
  </div>
`;
