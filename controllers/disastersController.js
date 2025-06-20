const supabase = require('../lib/supabase');
const axios = require('axios');

// Create Disaster
exports.createDisaster = async (req, res) => {
  const io = req.app.get('io');

  try {
    const { title, location_name, description, tags, owner_id } = req.body;

    const geoRes = await axios.post('http://localhost:5000/geocode', { location_name });
    const { lat, lng } = geoRes.data;

    const { data, error } = await supabase
      .from('disasters')
      .insert([
        {
          title,
          location_name,
          description,
          tags,
          owner_id,
          location: `POINT(${lng} ${lat})`,
          audit_trail: {
        action: 'create',
        user_id: owner_id,
        timestamp: new Date().toISOString()
      }
        }
      ])
      .select();

    if (error) throw error;

    const created = data[0];
    res.status(201).json(created);

    io.emit('disaster_updated', { action: 'created', disaster: created });
  } catch (err) {
    console.error('Disaster create error:', err.message);
    res.status(500).json({ error: 'Failed to create disaster' });
  }
};

// Get All Disasters
exports.getDisasters = async (req, res) => {
  try {
    const { tag } = req.query;

    let query = supabase.from('disasters').select('*');

    if (tag) {
      query = query.contains('tags', [tag]);
    }

    const { data, error } = await query;

    if (error) return res.status(400).json({ error: error.message });

    res.json(data);
  } catch (err) {
    console.error("GET /disasters error:", err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update Disaster
exports.updateDisaster = async (req, res) => {
  const io = req.app.get('io');
  const { id } = req.params;
  const { title, location_name, description, tags, owner_id } = req.body;

  try {
    let location = undefined;

    if (location_name) {
      const geoRes = await axios.post('http://localhost:5000/geocode', { location_name });
      const { lat, lng } = geoRes.data;
      location = `POINT(${lng} ${lat})`;
    }

    const updateFields = {
      title,
      location_name,
      description,
      tags,
      audit_trail: {
        action: 'create',
        user_id: owner_id,
        timestamp: new Date().toISOString()
      }
    };

    if (location) updateFields.location = location;

    const { data, error } = await supabase
      .from('disasters')
      .update(updateFields)
      .eq('id', id)
      .select();

    if (error) return res.status(400).json({ error: error.message });

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Disaster not found or not updated' });
    }

    const updated = data[0];
    res.json({ message: 'Disaster updated', data: updated });

    io.emit('disaster_updated', { action: 'updated', disaster: updated });
  } catch (err) {
    console.error('Disaster update error:', err.message);
    res.status(500).json({ error: 'Failed to update disaster' });
  }
};

// Delete Disaster
exports.deleteDisaster = async (req, res) => {
  const io = req.app.get('io');
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('disasters')
      .delete()
      .eq('id', id);

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: 'Disaster deleted successfully' });
    io.emit('disaster_updated', { action: 'deleted', id });
  } catch (err) {
    console.error('Delete disaster error:', err.message);
    res.status(500).json({ error: 'Failed to delete disaster' });
  }
};
