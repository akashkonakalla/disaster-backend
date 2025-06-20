const axios = require('axios');
const { getCache, setCache } = require('../lib/cache');

exports.geocodeLocation = async (req, res) => {
  const { location_name } = req.body;

  if (!location_name) {
    return res.status(400).json({ error: 'location_name is required' });
  }

  const cacheKey = `geocode:${location_name.toLowerCase()}`;
  const cached = await getCache(cacheKey);
  if (cached) return res.json(cached);

  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: location_name,
        format: 'json',
        limit: 1
      },
      headers: { 'User-Agent': 'DisasterCoordinationApp/1.0' }
    });

    if (response.data.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }

    const { lat, lon } = response.data[0];
    const result = { lat, lng: lon };

    await setCache(cacheKey, result, 86400); // 1 day cache
    res.json(result);
  } catch (err) {
    console.error('Geocode error:', err.message);
    res.status(500).json({ error: 'Failed to geocode location' });
  }
};
