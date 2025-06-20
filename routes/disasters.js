const express = require('express');
const router = express.Router();
const {
  createDisaster,
  getDisasters,
  updateDisaster,
  deleteDisaster
} = require('../controllers/disastersController');

// Routes for /disasters
router.post('/', createDisaster);         // Create new disaster
router.get('/', getDisasters);            // Get all disasters (optionally filter by tag)
router.put('/:id', updateDisaster);       // Update disaster by ID
router.delete('/:id', deleteDisaster);    // Delete disaster by ID

module.exports = router;
