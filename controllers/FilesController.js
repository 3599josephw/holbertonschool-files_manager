// FilesController
const crypto = require('crypto');
const uuid4 = require('uuid4');
const redis = require('../utils/redis');
const db = require('../utils/db');

class FilesController {
  static postUpload(req, resp) {
    const xtoken = `auth_${req.headers['x-token']}`;
    const key = redis.get(xtoken);
    if (!key) {
      return resp.status(401).json({ error: 'Unauthorized' });
    }
  }
}

module.exports = FilesController;
