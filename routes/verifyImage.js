const express = require('express');
const router = express.Router();
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { setCache, getCache } = require('../lib/cache');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

// Helper to download image and convert to base64
const imageUrlToBase64 = async (url) => {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  const buffer = Buffer.from(response.data, 'binary');
  return buffer.toString('base64');
};

// POST /verify-image
router.post('/', async (req, res) => {
  const { image_url, report_id } = req.body;
  const cacheKey = `verify:${report_id}`;

  try {
    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const base64Image = await imageUrlToBase64(image_url);

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image,
            },
          },
          {
            text: 'Is this image real, manipulated, or disaster-related? Give a short explanation.',
          },
        ],
      }],
    });

    const text = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || 'No explanation';
    const status = text.toLowerCase().includes('real') ? 'verified' :
                   text.toLowerCase().includes('manipulated') || text.toLowerCase().includes('fake') ? 'manipulated' :
                   'unknown';

    const verification = { verification_status: status, explanation: text };

    await setCache(cacheKey, verification, 3600);
    res.json(verification);
  } catch (err) {
    console.error('Image verification error:', err.message);
    res.status(500).json({ error: 'Failed to verify image' });
  }
});

module.exports = router;
