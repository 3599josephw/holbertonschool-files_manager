// AuthController
const crypto = require('crypto');
const uuid4 = require('uuid4');
const redis = require('../utils/redis');
const db = require('../utils/db');

class AuthController {
  static getConnect(req, resp) {
    let authCode = req.headers.authorization;
    authCode = authCode.split(' ')[1];
    const buff = Buffer.from(authCode, 'base64');
    const text = buff.toString('utf8');
    const email = text.split(':')[0];
    const password = text.split(':')[1];
    const hashedPWD = crypto.createHash('sha1').update(password).digest('hex');
    db.db.collection('users').findOne({ email, password: hashedPWD }, (err, result) => {
      if (!result) {
        return resp.status(401).json({ error: 'Unauthorized' });
      }
      const token = uuid4();
      const key = `auth_${token}`;
      redis.set(key, result._id, 60 * 60 * 24);
      return resp.status(200).json({ token });
    });
  }

  static getDisconnect(req, resp) {
    const xtoken = `auth_${req.headers['x-token']}`;
    redis.get(xtoken).then((result) => {
      if (!result) {
        return resp.status(401).json({ error: 'Unauthorized' });
      }
      redis.del(xtoken);
      return resp.status(204);
    });
  }
}

module.exports = AuthController;
