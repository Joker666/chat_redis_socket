const { MongoClient, Logger } = require("mongodb");

let state = {
    db: null,
}

// Mongo Connection
const dbClient = new MongoClient(process.env.DB_URI, { useUnifiedTopology: true });

async function Connect() {
    try {
        Logger.setLevel("info");
        await dbClient.connect();
        let db = await dbClient.db(process.env.DB_NAME);
        db.command({ ping: 1 });
        console.log("Connected successfully to mongo server");
        state.db = db;
    } catch (e) {
        console.error(e);
    }
}

function Get() {
    return state.db;
}

module.exports = {
    Connect,
    Get
}
