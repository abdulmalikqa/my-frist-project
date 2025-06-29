// models/policyModel.js
const mongoose = require('mongoose');

const policySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['return', 'cancel', 'shipping'],
      required: true,
      unique: true, // لكي لا نكرر نفس السياسة لنفس النوع
    },
    title: String,         // عنوان مختصر
    content: String,       // نص السياسة (HTML أو Markdown)
    isActive: {            // لتفعيل أو إيقاف عرض السياسة
      type: Boolean,
      default: true,
    },
    updatedBy: {          // آخر من عدّل السياسة
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Policy', policySchema);
