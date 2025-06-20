const express = require('express');
const router = express.Router();
const {
  createReports,
  getReports,
  updateReports,
  //deleteReports
} = require('../controllers/reportsController');

// Routes for /disasters
router.post('/', createReports);         // Create new disaster
router.get('/', getReports);            // Get all disasters (optionally filter by tag)
router.put('/:id', updateReports);       // Update disaster by ID
//router.delete('/:id', deleteReports);    // Delete disaster by ID

module.exports = router;
