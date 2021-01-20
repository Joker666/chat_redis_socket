import db from '../db/db';
import redis from '../db/redis';
const { ObjectId } = require("mongodb");

module.exports = {
    async create(ws, req, data) {
        const messages = db.Get().collection("messages");
        try {
            let message = {
                text: data.text,
                userID: ws.userID,
                roomID: ws.roomID,
                createdAt: Date.now(),
            }
            let result = await messages.insertOne(message);

            // Publish to all clients
            redis.GetPublisher().publish('message:new', JSON.stringify(result.ops[0]));
        } catch (e) {
            console.log(e);
        }
    },

    async list(req, res) {
        let skip = 0;
        let limit = 20;

        if (req.query.skip) {
            skip = parseInt(req.query.skip);
        }
        if (req.query.limit) {
            limit = parseInt(req.query.limit);
        }
        const messages = db.Get().collection("messages");
        const options = { sort: { createdAt: -1 }, skip: skip, limit: limit }
        const cursor = messages.find({ roomID: ObjectId(req.params.roomID) }, options);
        const allValues = await cursor.toArray();
        res.send({
            data: allValues,
            meta: { skip: skip, limit: limit }
        });
    }
};
