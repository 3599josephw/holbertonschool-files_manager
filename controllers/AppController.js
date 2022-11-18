// AppController Module
const reds = require('../utils/redis');
const db = require('../utils/db');

class AppController {
  static getStatus(req, resp) {
    if (reds.isAlive() && db.isAlive()) {
      return resp.status(200).json({ redis: true, db: true });
    }
    return resp.json('Not connected');
  }

  static async getStats(req, resp) {
    const userNum = await db.nbUsers();
    const fileNum = await db.nbFiles();
    return resp.status(200).json({ users: userNum, files: fileNum });
  }
}

module.exports = AppController;
