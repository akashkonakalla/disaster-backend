const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();
const { getCache, setCache } = require('../lib/cache');

// Example source: FEMA disaster declarations
const FEMA_URL = 'https://www.fema.gov/disaster/declarations';

router.get('/', async (req, res) => {
  const io = req.app.get('io');
  const cacheKey = 'officialUpdates';

  const cached = await getCache(cacheKey);
  if (cached) return res.json(cached);

  try {
    const { data: html } = await axios.get(FEMA_URL);
    const $ = cheerio.load(html);
    const updates = [];

    $('.views-row').each((i, el) => {
      const title = $(el).find('.field-content a').text().trim();
      const link = 'https://www.fema.gov' + $(el).find('.field-content a').attr('href');
      if (title && link) updates.push({ title, link });
    });

    await setCache(cacheKey, updates, 3600); // 1-hour cache
    res.json(updates);

    // Emit updates over WebSocket
    io.emit('official_updates_updated', { updates });
  } catch (err) {
    console.error('Official update scrape error:', err.message);
    res.status(500).json({ error: 'Failed to fetch updates' });
  }
});

module.exports = router;
