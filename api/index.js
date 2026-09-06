const { app, connectDb } = require('../backend/server');

let databaseConnection;

module.exports = async function handler(req, res) {
  if (!databaseConnection) databaseConnection = connectDb();
  await databaseConnection;
  return app(req, res);
};
