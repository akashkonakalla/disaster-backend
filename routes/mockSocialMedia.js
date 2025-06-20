const express = require('express');
const router = express.Router();
const { getCache, setCache } = require('../lib/cache');

// Sample mock data
const mockPosts = [
  { user: 'citizen1', post: '#floodrelief Need food in NYC' },
  { user: 'survivor101', post: 'Trapped near Chennai airport #help' },
  { user: 'volunteer77', post: 'We are organizing rescue boats #cyclonerescue' }
];

// GET /mock-social-media
router.get('/', async (req, res) => {
  const io = req.app.get('io');
  const cacheKey = 'mockSocialMedia';

  const cached = await getCache(cacheKey);
  if (cached) {
    res.json(cached);
    io.emit('social_media_updated', { posts: cached });
    return;
  }

  // Simulate delay or dynamic posts if needed
  const response = mockPosts;

  await setCache(cacheKey, response, 1800); // 30 min TTL
  res.json(response);

  // Broadcast via WebSocket
  io.emit('social_media_updated', { posts: response });
});

module.exports = router;
