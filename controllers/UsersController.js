// UsersController Module
const crypto = require('crypto');
const reds = require('../utils/redis');
const db = require('../utils/db');

class UsersController {
  static postNew(req, resp) {
    const { email } = req.body;
    const { password } = req.body;
    if (!email || email === '') {
      return resp.status(400).json({ error: 'Missing email' });
    }
    if (!password || password === '') {
      return resp.status(400).json({ error: 'Missing password' });
    }
    const hashedPWD = crypto.createHash('sha1').update(password).digest('hex');
    const user = db.db.collection('users').findOne({ email });
    if (user) {
      return resp.status(400).json({ error: 'Already exist' });
    }
    const newUser = db.db.collection('users').insertOne({ email, password: hashedPWD });
    const processResults = newUser;
    return processResults.then((result) => resp.status(201).send({ id: result.ops[0]._id, email: result.ops[0].email }));
  }
}

module.exports = UsersController;
