const express = require('express');
const router = express.Router();
const { getCache, setCache } = require('../lib/cache');

const samplePosts = [
  { post: "#floodrelief Need food in NYC", user: "citizen1" },
  { post: "Trapped near Chennai airport #help", user: "survivor101" },
  { post: "Volunteers needed near Vizag #cyclonerescue", user: "rescueTeam" }
];

// GET /socialMedia/:disasterId
router.get('/:disasterId', async (req, res) => {
  const { disasterId } = req.params;
  const cacheKey = `socialMedia:${disasterId}`;
  const io = req.app.get('io');

  const cached = await getCache(cacheKey);
  if (cached) return res.json(cached);

  await setCache(cacheKey, samplePosts, 3600);
  io.emit('social_media_updated', { disasterId, posts: samplePosts });
  res.json(samplePosts);
});

module.exports = router;
