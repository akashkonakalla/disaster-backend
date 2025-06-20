const supabase = require('../lib/supabase');


// Create a new report
exports.createReports = async (req, res) => {


  try {
    
    const { disaster_id, user_id, content, image_url, verification_status } = req.body;
    
    const { data, error } = await supabase.from('reports').insert([
      {
        disaster_id,
        user_id,
        content,
        image_url,
        verification_status:"pending",
        created_at: new Date().toISOString()
      }
    ]).select();


    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('Error creating report:', err.message);
    res.status(500).json({ error: 'Failed to create report' });
  }
};

// Get all reports, optionally filtered by disaster_id
exports.getReports = async (req, res) => {
  try {
    const { disaster_id } = req.query;
    let query = supabase.from('reports').select('*');

    if (disaster_id) {
      query = query.eq('disaster_id', disaster_id);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('Error fetching reports:', err.message);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

// Update a report by ID
exports.updateReports = async (req, res) => {
  const { id } = req.params;
  const { content, image_url, verification_status, user_id } = req.body;

  const audit_trail = {
    action: 'update',
    user_id,
    timestamp: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('reports')
      .update({
        content,
        image_url,
        verification_status,
        
      })
      .eq('id', id)
      .select();

    if (error) throw error;

    res.json({ message: 'Report updated', data });
  } catch (err) {
    console.error('Error updating report:', err.message);
    res.status(500).json({ error: 'Failed to update report' });
  }
};
