const Paste = require('../models/Paste');
const { getTestTime } = require('../middleware/validation');

const createPaste = async (req, res) => {
  try {
    const { content, ttl_seconds, max_views } = req.body;
    const now = new Date();
    
    // Calculate expiration time if TTL is provided
    let expiresAt = null;
    if (ttl_seconds) {
      expiresAt = new Date(now.getTime() + ttl_seconds * 1000);
    }
    
    const paste = new Paste({
      content: content.trim(),
      expiresAt,
      maxViews: max_views || null,
      url: `${req.protocol}://${req.get('host')}/p/`
    });
    
    await paste.save();
    
    // Update URL with actual ID
    paste.url = `${req.protocol}://${req.get('host')}/p/${paste.id}`;
    await paste.save();
    
    res.status(201).json({
      id: paste.id,
      url: paste.url
    });
  } catch (error) {
    console.error('Error creating paste:', error);
    res.status(500).json({ 
      error: 'Failed to create paste',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getPaste = async (req, res) => {
  try {
    const { id } = req.params;
    const now = getTestTime(req);
    
    const paste = await Paste.findOne({ id });
    
    if (!paste) {
      return res.status(404).json({ 
        error: 'Paste not found' 
      });
    }
    
    // Check if paste is still valid
    if (!paste.isValid(now)) {
      await Paste.deleteOne({ _id: paste._id });
      return res.status(404).json({ 
        error: 'Paste not found or expired' 
      });
    }
    
    // Increment view count
    await paste.incrementViews();
    
    const response = {
      content: paste.content,
      remaining_views: paste.maxViews ? Math.max(0, paste.maxViews - paste.views) : null,
      expires_at: paste.expiresAt ? paste.expiresAt.toISOString() : null
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching paste:', error);
    res.status(500).json({ 
      error: 'Failed to fetch paste',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const deleteExpiredPastes = async () => {
  try {
    const now = new Date();
    const result = await Paste.deleteMany({
      $or: [
        { expiresAt: { $lte: now } },
        { $expr: { $gte: ['$views', '$maxViews'] } }
      ]
    });
    
    if (result.deletedCount > 0) {
      console.log(`Cleaned up ${result.deletedCount} expired pastes`);
    }
  } catch (error) {
    console.error('Error cleaning up expired pastes:', error);
  }
};

// Run cleanup every hour
setInterval(deleteExpiredPastes, 3600000);

module.exports = { createPaste, getPaste };