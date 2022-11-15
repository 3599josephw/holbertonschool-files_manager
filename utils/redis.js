/* RedisClient */
import { createClient } from 'redis';
const redis = require("redis");
const { promisify } = require("util");
class RedisClient {

  constructor() {
    this.client = createClient();
    //this.client.on('connect', () => this.isAlive(true));
    //this.client.on('error', (err) => this.isAlive(false), console.log(err));
  }

  isAlive() {
    try {
      this.client.ping();
      return true;
    } catch (err) {
      return false;
    }
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
