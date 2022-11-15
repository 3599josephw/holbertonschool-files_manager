/* RedisClient */
import { createClient } from 'redis';
class RedisClient {

  constructor() {
    this.client = createClient();
    //this.client.on('connect', () => this.isAlive(true));
    //this.client.on('error', (err) => this.isAlive(false), console.log(err));
  }

  isAlive() {
    const response = this.client.ping();
    console.log('isALive:' + response);
    return true;
  }
}

const redisClient = new RedisClient
module.exports = redisClient;
