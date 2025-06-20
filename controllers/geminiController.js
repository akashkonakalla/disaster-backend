const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { setCache, getCache } = require('../lib/cache');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.verifyImage = async (req, res) => {
  const { image_url } = req.body;
  if (!image_url) return res.status(400).json({ error: 'Image URL is required' });

  const cacheKey = `gemini:image:${image_url}`;
  const cached = await getCache(cacheKey);
  if (cached) return res.json(cached);

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

    // Download image and convert to base64
    const imageRes = await axios.get(image_url, { responseType: 'arraybuffer' });
    const base64Image = Buffer.from(imageRes.data).toString('base64');

    const result = await model.generateContent([
      {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // or 'image/png'
              data: base64Image,
            },
          },
          {
            text: 'Analyze this image and determine if it appears real or manipulated and if it is relevant to a disaster.',
          },
        ],
      },
    ]);

    const text = result.response.text().trim();

    let status = 'unverified';
    if (text.toLowerCase().includes('real') || text.toLowerCase().includes('authentic')) {
      status = 'verified';
    } else if (text.toLowerCase().includes('manipulated') || text.toLowerCase().includes('fake')) {
      status = 'manipulated';
    }

    const output = { verification_status: status, explanation: text };
    await setCache(cacheKey, output, 3600);

    res.json(output);
  } catch (err) {
    console.error('Gemini image verification error:', err.message);
    res.status(500).json({ error: 'Failed to verify image' });
  }
};


exports.extractLocation = async (req, res) => {
  const { description } = req.body;

  if (!description) return res.status(400).json({ error: 'Description is required' });

  const cacheKey = `gemini:location:${description}`;
  const cached = await getCache(cacheKey);
  if (cached) return res.json({ location: cached });

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Extract the location name from this description: "${description}"`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const location = text.replace(/[^a-zA-Z0-9, ]/g, '').trim();

    await setCache(cacheKey, location, 3600); // 1-hour TTL

    res.json({ location });
  } catch (err) {
    console.error('Gemini location extraction error:', err.message);
    res.status(500).json({ error: 'Failed to extract location' });
  }
};
