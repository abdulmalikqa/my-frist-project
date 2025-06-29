// services/policyService.js
const asyncHandler = require('express-async-handler');
const Policy = require('../Model/policyModel');

// إضافة سياسة
exports.createPolicy = asyncHandler(async (req, res) => {
  const policy = await Policy.create(req.body);
  res.status(201).json({ status: 'success', data: policy });
});

// عرض كل السياسات
exports.getPolicies = asyncHandler(async (req, res) => {
  const policies = await Policy.find();
  res.status(200).json({ status: 'success', data: policies });
});

// عرض سياسة بنوع محدد
exports.getPolicyByType = asyncHandler(async (req, res) => {
  const policy = await Policy.findOne({ type: req.params.type });
  if (!policy) {
    return res.status(404).json({ message: 'Policy not found' });
  }
  res.status(200).json({ status: 'success', data: policy });
});

// تحديث سياسة
exports.updatePolicy = asyncHandler(async (req, res) => {
  const policy = await Policy.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  if (!policy) {
    return res.status(404).json({ message: 'Policy not found' });
  }
  res.status(200).json({ status: 'success', data: policy });
});

// حذف سياسة
exports.deletePolicy = asyncHandler(async (req, res) => {
  const policy = await Policy.findByIdAndDelete(req.params.id);
  if (!policy) {
    return res.status(404).json({ message: 'Policy not found' });
  }
  res.status(200).json({ status: 'success', message: 'Policy deleted' });
});
