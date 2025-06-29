const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    //المستخدم الذي قام بالطلب
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Order must belong to a user'],
    },
    //مصفوفة من المنتجات 
    cartItems: [
      {
        //المنتج
        product: {
          type: mongoose.Schema.ObjectId,
          ref: 'Product',
          required: true,
        },
        //الكمية 
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity cannot be less than 1.'],
        },
        //اللون
        color: String,
        //سعر المنتج
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    //العنوان 
    shippingAddress: {
      details: String,
      phone: String,
      city: String,
      postalCode: String,
    },
    //الظريبة 
    taxPrice: {
      type: Number,
      default: 0,
    },
    //تكلفة الشحن
    shippingPrice: {
      type: Number,
      default: 0,
    },
    //
    discount: {
      type: Number,
      default: 0,
    },
    //اسعر النهائي للطلب
    totalOrderPrice: {
      type: Number,
    },
    //طريقة الدفع
    paymentMethod: {
      type: String,
      enum: ['card', 'cash'],
      default: 'cash',
    },
    //حالة الطلب 
    orderStatus: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    //هل تم الدفع
    isPaid: {
      type: Boolean,
      default: false,
    },
    //تاريخ الدفع 
    paidAt: Date,
    //هل تم التسليم
    isDelivered: {
      type: Boolean,
      default: false,
    },
    //تاريخ التسليم
    deliveredAt: Date,
    //الملاحظة
    notes: String,
     // 🗂 تاريخ حالة الطلب (تتبع التغييرات عبر الزمن)
    statusHistory: [
      {
        status: {
          type: String,
          enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
        },
        changedAt: Date,
        changedBy: {
          type: mongoose.Schema.ObjectId,
          ref: 'User',
        },
      },
    ],

    //الغاء الطلب
    isCancelled: {
  type: Boolean,
  default: false
},
//تاريخ الغاء الطلب 
cancelledAt: Date,
// استرجاع الطلب
isReturned: {
  type: Boolean,
  default: false
},
//تاريخ استرجاع الطلب
returnedAt: Date,

    //تم التحديث بواسطة من 
    updatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Populate user and product titles when find
orderSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name profileImg email phone',
  }).populate({
    path: 'cartItems.product',
    select: 'title imageCover price',
  });
  next();
});
// إضافة فهارس
orderSchema.index({ user: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ isPaid: 1 });

module.exports = mongoose.model('Order', orderSchema);
