const { MongoClient } = require('mongodb');


class DBClient {
  constructor() {
    if (process.env.DB_HOST) {
      this.host = process.env.DB_HOST;
    } else {
      this.host = 'localhost';
    }

    if (process.env.DB_PORT) {
      this.port = process.env.DB_PORT;
    } else {
      this.port = '27017';
    }

    if (process.env.DB_DATABASE) {
      this.database = process.env.DB_DATABASE;
    } else {
      this.database = 'files_manager';
    }
    this.url = `mongodb://${this.host}:${this.port}/${this.database}`;
    MongoClient.connect(this.url, { useUnifiedTopology: true }, (err, client) => {
      if (!err) {
          this.db = client.db(this.database);
      }
      else
          console.log("Error in the connectivity");
    });
  }

  isAlive() {
    if (this.db) {
      return true;
    } else {
      return false;
    }
  }

  async nbUsers() {
    const collection = this.db.collection('users').countDocuments();
    return collection;

  }

  async nbFiles() {
    const col = this.db.collection('files').countDocuments();
    return col;
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
