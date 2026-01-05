const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const pasteSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => nanoid(10)
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: { expires: 86400 } // Optional: Auto-delete after 24h if TTL not set
  },
  expiresAt: {
    type: Date,
    default: null,
    index: true
  },
  maxViews: {
    type: Number,
    default: null,
    min: 1
  },
  views: {
    type: Number,
    default: 0
  },
  url: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// TTL index for automatic expiration
pasteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to check if paste is valid
pasteSchema.methods.isValid = function(testNow) {
  const now = testNow || new Date();
  
  // Check expiration
  if (this.expiresAt && this.expiresAt <= now) {
    return false;
  }
  
  // Check view limit
  if (this.maxViews !== null && this.views >= this.maxViews) {
    return false;
  }
  
  return true;
};

// Method to increment views
pasteSchema.methods.incrementViews = async function() {
  this.views += 1;
  await this.save();
  return this.views;
};

const Paste = mongoose.model('Paste', pasteSchema);

module.exports = Paste;