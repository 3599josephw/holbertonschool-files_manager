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
    const { name } = req.body;
    const { type } = req.body;
    const { data } = req.body;
    if (!name) {
      return resp.status(400).json({ error: 'Missing name' });
    }
    if (!type || !(['folder', 'file', 'image'].includes(type))) {
      return resp.status(400).json({ error: 'Missing type' });
    }
    if (!data && type !== 'folder') {
      return resp.status(400).json({ error: 'Missing data' });
    }

    let { parentId } = req.body;
    if (!parentId) {
      parentId = 0;
    } else {

    }

    let { isPublic } = req.body;
    if (!isPublic) {
      isPublic = false;
    }
  }
}

module.exports = FilesController;
