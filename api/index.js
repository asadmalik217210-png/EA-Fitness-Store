let databaseConnection;
let app;
let connectDb;

function loadBackend() {
  if (!app || !connectDb) ({ app, connectDb } = require('../backend/server'));
}

module.exports = async function handler(req, res) {
  const requestPath = String(req.url || '').split('?')[0];

  if (requestPath === '/api/health' || requestPath === '/health' || requestPath === '/') {
    return res.status(200).json({
      success: true,
      message: 'EA Fitness Clothing API is running',
      brand: 'EA Fitness Clothing',
      project: 'EA-Fitness-Clothing-Store',
    });
  }

  try {
    loadBackend();
    if (!databaseConnection) databaseConnection = connectDb();
    await databaseConnection;
    return app(req, res);
  } catch (error) {
    databaseConnection = null;
    console.error('Database connection failed:', error.message);
    return res.status(503).json({
      success: false,
      message: 'Database connection unavailable. Check MONGODB_URI and MongoDB Atlas network access.',
    });
  }
};
