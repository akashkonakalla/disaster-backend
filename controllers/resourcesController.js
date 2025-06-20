const supabase = require('../lib/supabase');
const axios = require('axios');

// Create a new resource
const createResources = async (req, res) => {
  const io = req.app.get('io');
  try {
    const { disaster_id, name, location_name, type } = req.body;

    const geoRes = await axios.post('http://localhost:5000/geocode', { location_name });
    const { lat, lng } = geoRes.data;

    const { data, error } = await supabase.from('resources').insert([
      {
        disaster_id,
        name,
        location_name,
        type,
        location: `POINT(${lng} ${lat})`,
        created_at: new Date().toISOString()
      }
    ]).select();

    if (error) throw error;

    const newResource = data[0];  // ✅ define newResource
    io.emit('resources_updated', { action: 'created', resource: newResource });

    res.status(201).json(newResource);
  } catch (err) {
    console.error('Create resource error:', err.message);
    res.status(500).json({ error: 'Failed to create resource' });
  }
};


// Get all resources or by filters
const getResources = async (req, res) => {
  const { disaster_id, type } = req.query;

  try {
    let query = supabase.from('resources').select('*');

    if (disaster_id) query = query.eq('disaster_id', disaster_id);
    if (type) query = query.eq('type', type);

    const { data, error } = await query;

    if (error) return res.status(400).json({ error: error.message });

    res.json(data);
  } catch (err) {
    console.error('Get resources error:', err.message);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
};

// Update resource
const updateResources = async (req, res) => {
  const io = req.app.get('io');
  const { id } = req.params;
  const { name, type, location_name } = req.body;

  try {
    let updateData = { name, type };

    if (location_name) {
      const geoRes = await axios.post('http://localhost:5000/geocode', { location_name });
      const { lat, lng } = geoRes.data;
      updateData.location_name = location_name;
      updateData.location = `POINT(${lng} ${lat})`;
    }

    const { data, error } = await supabase
      .from('resources')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) return res.status(400).json({ error: error.message });
    if (!data || data.length === 0) return res.status(404).json({ error: 'Resource not found' });

    const updatedResource = data[0];
    io.emit('resources_updated', { action: 'updated', resource: updatedResource });

    res.json({ message: 'Resource updated', data: updatedResource });
  } catch (err) {
    console.error('Update resource error:', err.message);
    res.status(500).json({ error: 'Failed to update resource' });
  }
};


// Delete resource
const deleteResources = async (req, res) => {
  const io = req.app.get('io');
  const { id } = req.params;

  // Get resource first (optional, for emit)
  const { data: resourceToDelete } = await supabase.from('resources').select('*').eq('id', id).single();

  const { error } = await supabase.from('resources').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });

  if (resourceToDelete) {
    io.emit('resources_updated', { action: 'deleted', resource: resourceToDelete });
  }

  res.json({ message: 'Resource deleted successfully' });
};


module.exports = {
  createResources,
  getResources,
  updateResources,
  deleteResources
};
