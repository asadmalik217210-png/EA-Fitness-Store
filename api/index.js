const { app, connectDb } = require('../backend/server');

let databaseConnection;

module.exports = async function handler(req, res) {
  const requestPath = String(req.url || '').split('?')[0];

  if (requestPath === '/api/health' || requestPath === '/health') return app(req, res);

  try {
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
