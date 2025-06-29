// routes/policyRoutes.js
const express = require('express');
const {
  createPolicy,
  getPolicies,
  getPolicyByType,
  updatePolicy,
  deletePolicy,
} = require('../services/policyService');

const router = express.Router();

// CRUD
router.post('/', createPolicy);
router.get('/', getPolicies);
router.get('/:type', getPolicyByType);  // مثال: /api/v1/policies/return
router.put('/:id', updatePolicy);
router.delete('/:id', deletePolicy);

module.exports = router;
