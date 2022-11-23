const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    this.host = process.env.DB_HOST || 'localhost';
    this.port = process.env.DB_PORT || 27017;
    this.database = process.env.DB_DATABASE || 'files_manager';

    this.url = `mongodb://${this.host}:${this.port}`;
    MongoClient.connect(this.url, { useUnifiedTopology: true }, (err, client) => {
      if (!err) {
        this.db = client.db(this.database);
      } else { console.log('Error in the connectivity'); }
    });
  }

  isAlive() {
    if (this.db) {
      return true;
    }
    return false;
  }

  async nbUsers() {
    const collection = await this.db.collection('users').countDocuments({});
    return collection;
  }

  async nbFiles() {
    const col = await this.db.collection('files').countDocuments({});
    return col;
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
