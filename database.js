import { MongoClient, ServerApiVersion } from 'mongodb'

const uri = "mongodb+srv://jeferson:jef123456@cluster0.fv8lsqm.mongodb.net/?retryWrites=true&w=majority";

class Database {
  constructor (database) {
    this.database = database;
    this.client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
  }
  async insertData (collection, dataList) {
    try {
      await this.client.connect()
      console.log("You successfully connected to MongoDB!")
      await this.client.db(this.database).collection(collection).insertMany(dataList)
    } catch (err) {
      console.log(err)
    } finally {
      await this.client.close();
    }
  }
  async upsertData (collection, dataList, upsertField = 'Id') {
    try {
      let updateRecordsList = []
      dataList.forEach(data => {
        let filter = {}
        filter[upsertField] = data[upsertField]
        let updateObject = {
          updateOne: {
            'filter': filter,
            'update': {$set: data},
            'upsert': true,
            'collection': collection
          }
        }
        updateRecordsList.push(updateObject)
      });
      await this.client.connect()
      console.log("You successfully connected to MongoDB!")
      await this.client.db(this.database).collection(collection).bulkWrite(updateRecordsList)
    } catch (err) {
      console.log(err)
    } finally {
      await this.client.close()
    }
  }
  async findData (collection, filter, project) {
    try {
      await this.client.connect()
      console.log("You successfully connected to MongoDB!")
      const results = await this.client.db(this.database).collection(collection).find(filter).project(project).toArray();
      return results
    } catch (err) {
      console.log(err)
    } finally {
      await this.client.close();
    }
  }
}
export { Database }