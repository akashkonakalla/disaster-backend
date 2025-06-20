const express = require('express');
const router = express.Router();
const {
  createResources,
  getResources,
  updateResources,
  deleteResources
} = require('../controllers/resourcesController');

// Routes for /disasters
router.post('/', createResources);         // Create new disaster
router.get('/', getResources);            // Get all disasters (optionally filter by tag)
router.put('/:id', updateResources);       // Update disaster by ID
router.delete('/:id', deleteResources);    // Delete disaster by ID

module.exports = router;
