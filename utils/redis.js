/* RedisClient */
import { createClient } from 'redis';
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
}

const redisClient = new RedisClient
module.exports = redisClient;
