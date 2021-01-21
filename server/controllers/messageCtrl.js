import db from '../db/db';
import redis from '../db/redis';
const { ObjectId } = require("mongodb");

module.exports = {
    async create(ws, req, data) {
        const messages = db.Get().collection("messages");
        const users = db.Get().collection("users");
        try {
            let message = {
                text: data.text,
                userID: ws.userID,
                roomID: ws.roomID,
                createdAt: Date.now(),
            }
            let result = await messages.insertOne(message);

            let userFilter = { _id: ObjectId(ws.userID) };
            let user = await users.findOne(userFilter);

            // Publish to all clients
            redis.GetPublisher().publish('message:new', JSON.stringify({ message: result.ops[0], user: user }));
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
        const mResult = messages.find({ roomID: ObjectId(req.params.roomID) }, options);
        const mValues = await mResult.toArray();

        let userIDs = mValues.map(each => {
            return ObjectId(each.userID);
        });

        const users = db.Get().collection("users");
        let mUsers = users.find( { _id: { $in: userIDs } } );
        const rUsers = await mUsers.toArray();

        const result = mValues.map(each => {
            rUsers.forEach(u => {
                if (each.userID.equals(u._id)) {
                    each.user = u;
                }
            });
            return each;
        });

        res.send({
            data: result,
            meta: { skip: skip, limit: limit }
        });
    }
};
