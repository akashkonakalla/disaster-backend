const express = require('express');
const router = express.Router();
const { extractLocation, verifyImage } = require('../controllers/geminiController');

router.post('/location-extract', extractLocation);
router.post('/verify-image', verifyImage);



module.exports = router;
