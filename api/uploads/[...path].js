const fs = require('fs');
const path = require('path');

module.exports = function handler(req, res) {
  const parts = Array.isArray(req.query.path) ? req.query.path : [req.query.path];
  const filename = path.basename(parts.join('/'));
  const filePath = path.join('/tmp', process.env.UPLOAD_DIR || 'uploads', filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'Image not found' });
  res.sendFile(filePath);
};