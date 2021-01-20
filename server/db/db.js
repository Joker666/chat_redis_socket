const { MongoClient, Logger } = require("mongodb");

// Mongo Connection
const dbClient = new MongoClient(process.env.DB_URI, { useUnifiedTopology: true });

async function ConnectDB() {
    try {
        Logger.setLevel("info");
        await dbClient.connect();
        let db = await dbClient.db(process.env.DB_NAME);
        db.command({ ping: 1 });
        console.log("Connected successfully to mongo server");
        return db;
    } catch (e) {
        console.error(e);
        return null;
    }
}

module.exports = {
    ConnectDB
}
