/* RedisClient */
import { createClient } from 'redis';
const { promisify } = require("util");
class RedisClient {

  constructor() {
    this.client = createClient();
    this.client.on('error', (err) => console.log(err));
  }

  isAlive() {
    return this.client.connected;
  }

  async get(key) {
    const getAsync = promisify(this.client.get).bind(this.client);
    return getAsync(key);
  }

  async set(key, value, duration) {
    const setAsync = promisify(this.client.set).bind(this.client);
    return setAsync(key, value, 'EX', duration);
  }

  async del(key) {
    const deleteAsy = promisify(this.client.del).bind(this.client);
    return deleteAsy(key);
  }
}

const redisClient = new RedisClient
module.exports = redisClient;
