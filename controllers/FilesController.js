// FilesController
const crypto = require('crypto');
const uuid4 = require('uuid4');
const fs = require('fs');
const mongo = require('mongodb');
const mime = require('mime-types');
const redis = require('../utils/redis');
const db = require('../utils/db');

/*

"Create a local path in the storing folder with filename a UUID" - not sure what this means

*/

class FilesController {
  static async postUpload(req, resp) {
    /* Saves a file with data to local disc & to DB */

    const xtoken = `auth_${req.headers['x-token']}`;
    const key = await redis.get(xtoken);
    /* Verify user */
    if (!key) {
      return resp.status(401).json({ error: 'Unauthorized' });
    }

    /* Get file parameters, then error checks */
    let {
      name, type, data, parentId, isPublic,
    } = req.body;

    if (!name) {
      return resp.status(400).json({ error: 'Missing name' });
    }
    if (!type || !(['folder', 'file', 'image'].includes(type))) {
      return resp.status(400).json({ error: 'Missing type' });
    }
    if (!data && type !== 'folder') {
      return resp.status(400).json({ error: 'Missing data' });
    }

    /* if there is data, decode to utf8 */
    if (data) {
      const buff = Buffer.from(data, 'base64');
      data = buff.toString('utf8');
    }

    if (!parentId) {
      parentId = 0;
    } else {
      /* [if not type folder: error] */
    }

    if (!isPublic) {
      isPublic = false;
    }

    /* get path to save file from env or default */
    let path;
    if (process.env.FOLDER_PATH && process.env.FOLDER_PATH !== '') {
      path = process.env.FOLDER_PATH;
    } else {
      path = '/tmp/files_manager';
    }

    /* create directory if needed, then save file to disc */
    if (type !== 'folder') {
      if (!fs.existsSync(path)) {
        fs.mkdir(path, { recursive: true }, (err) => {
          if (err) console.log(err);
        });
      }
      fs.appendFile(`${path}/${name}`, data, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log('SUCCESS');
        }
      });
    }

    /* save file to DB */
    const newFile = await db.db.collection('files').insertOne({
      userId: key,
      name,
      type,
      isPublic,
      parentId,
      localPath: path,
    });
    return resp.status(201).send({
      id: newFile.ops[0]._id,
      userId: newFile.ops[0].userId,
      name: newFile.ops[0].name,
      type: newFile.ops[0].type,
      isPublic: newFile.ops[0].isPublic,
      parentId: newFile.ops[0].parentId,
      localPath: newFile.ops[0].localPath,
    });
  }

  static async getShow(req, resp) {
    const xtoken = `auth_${req.headers['x-token']}`;
    const key = await redis.get(xtoken);
    /* Verify user */
    if (!key) {
      return resp.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const file = await db.db.collection('files').findOne({ _id: new mongo.ObjectID(id) });
    if (!file || file.userId.toString() !== key) {
      return resp.status(404).json({ error: 'Not found' });
    }
    return resp.status(200).send({
      id: file._id,
      userId: file.userId,
      name: file.name,
      type: file.type,
      isPublic: file.isPublic,
      parentId: file.parentId,
    });
  }

  static async getIndex(req, resp) {
    const xtoken = `auth_${req.headers['x-token']}`;
    const key = await redis.get(xtoken);
    /* Verify user */
    if (!key) {
      return resp.status(401).json({ error: 'Unauthorized' });
    }

    /* Get parentId parameter */
    let pId;
    if (req.query.parentId) {
      pId = req.query.parentId;
    } else {
      pId = 0;
    }

    // const files = await db.db.collection('files').findOne({ userId: key });
    /* MongoDB Aggregation */
    let files;
    if (pId === 0) {
      files = await db.db.collection('files').aggregate([
        { $match: { userId: new mongo.ObjectID(key) } },
        { $skip: 20 },
        { $limit: 20 },
      ]).toArray();
      console.log(`Testing: ${files}`);
      const fileArray = files.map((file) => ({
        id: file._id,
        userId: file.userId,
        name: file.name,
        type: file.type,
        isPublic: file.isPublic,
        parentId: file.parentId,
      }));
      return resp.status(200).send(fileArray);
    }
    files = await db.db.collection('files').aggregate([
      { $match: { parentId: pId } },
      { $skip: 20 },
      { $limit: 20 },
    ]).toArray().then((files) => {
      const fileArray = files.map((file) => ({
        id: file._id,
        userId: file.userId,
        name: file.name,
        type: file.type,
        isPublic: file.isPublic,
        parentId: file.parentId,
      }));
      console.log(`In else: ${files}`);
      return resp.status(200).send(fileArray);
    });
  }

  static async putPublish(req, resp) {
    const xtoken = `auth_${req.headers['x-token']}`;
    const key = await redis.get(xtoken);
    /* Verify user */
    if (!key) {
      return resp.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const file = await db.db.collection('files').findOne({ _id: new mongo.ObjectID(id) });
    if (!file || file.userId.toString() !== key) {
      return resp.status(404).json({ error: 'Not found' });
    }

    const updatedFile = await db.db.collection('files').updateOne({ _id: new mongo.ObjectID(id) },
      {
        $set: { isPublic: true },
      });
    file.isPublic = true;
    return resp.status(200).send(file);
  }

  static async putUnpublish(req, resp) {
    const xtoken = `auth_${req.headers['x-token']}`;
    const key = await redis.get(xtoken);
    /* Verify user */
    if (!key) {
      return resp.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const file = await db.db.collection('files').findOne({ _id: new mongo.ObjectID(id) });
    if (!file || file.userId.toString() !== key) {
      return resp.status(404).json({ error: 'Not found' });
    }

    const updatedFile = await db.db.collection('files').updateOne({ _id: new mongo.ObjectID(id) },
      {
        $set: { isPublic: false },
      });
    file.isPublic = false;
    return resp.status(200).send(file);
  }

  static async getFile(req, resp) {
    const xtoken = `auth_${req.headers['x-token']}`;
    const key = await redis.get(xtoken);
    /* Verify user */
    if (!key) {
      return resp.status(401).json({ error: 'Unauthorized' });
    }
    const { id } = req.params;
    const file = await db.db.collection('files').findOne({ _id: new mongo.ObjectID(id) });
    if (!file || file.userId.toString() !== key || file.isPublic === false) {
      return resp.status(404).json({ error: 'Not found' });
    }
    if (file.type === 'folder') {
      return resp.status(400).json({ error: 'A folder doesn\'t have content' });
    }
    const mimeType = mime.lookup(file.name);
    const text = fs.readFileSync(`${file.localPath}/${file.name}`);
    return resp.status(200).send(text);
  }
}

module.exports = FilesController;
