// UsersController Module
const crypto = require('crypto');
const reds = require('../utils/redis');
const db = require('../utils/db');

class UsersController {
  static async postNew(req, resp) {
    const { email } = req.body;
    const { password } = req.body;
    if (!email || email === '') {
      return resp.status(400).json({ error: 'Missing email' });
    }
    if (!password || password === '') {
      return resp.status(400).json({ error: 'Missing password' });
    }
    const hashedPWD = crypto.createHash('sha1').update(password).digest('hex');
    const user = await db.db.collection('users').findOne({ email });
    if (user) {
      return resp.status(400).json({ error: 'Already exist' });
    }
    const newUser = await db.db.collection('users').insertOne({ email, password: hashedPWD });
    return resp.status(201).send({ id: newUser.ops[0]._id, email: newUser.ops[0].email });
  }

  static getMe(req, resp) {
    const xtoken = `auth_${req.headers['x-token']}`;
    let userId;
    reds.get(xtoken).then((result) => {
      if (!result) {
        return resp.status(401).json({ error: 'Unauthorized' });
      }
      userId = result;
    });
    db.db.collection('users').findOne({ userId }, (err, result) => {
      if (!result) {
        return resp.status(401).json({ error: 'Unauthorized' });
      }
      return resp.status(200).send({ id: result._id, email: result.email });
    });
  }
}

module.exports = UsersController;
