import db from '../db/db';
import redis from "../db/redis";
const { ObjectId } = require("mongodb");

module.exports = {
    async join(ws, req, data) {
        const users = db.Get().collection("users");
        const rooms = db.Get().collection("rooms");
        try {
            let userFilter = { name: data.name };
            let user = await users.findOne(userFilter);
            if (user) {
                const updateDoc = {
                    $set: {
                        lastJoinedAt: Date.now(),
                    },
                };
                await users.updateOne(userFilter, updateDoc);
                ws.userID = user._id;
            } else {
                let user = {
                    name: data.name,
                    ipAddress: req.socket.remoteAddress,
                    lastJoinedAt: Date.now(),
                }
                let result = await users.insertOne(user);
                ws.userID = result.ops[0]._id;
            }

            let roomFilter = { name: 'main' };
            let room = await rooms.findOne(roomFilter);
            if (room) {
                let prev = room.participants.filter(p => {
                    return p.equals(ws.userID);
                });
                if (prev.length === 0) {
                    let participants = [ws.userID, ...room.participants];
                    const updateDoc = {
                        $set: {
                            participants: participants,
                            updatedAt: Date.now(),
                        },
                    };
                    await rooms.updateOne(roomFilter, updateDoc);
                }
                ws.roomID = room._id;
            } else {
                let room = {
                    name: 'main',
                    participants: [ws.userID],
                    updatedAt: Date.now(),
                }
                let result = await rooms.insertOne(room);
                ws.roomID = result.ops[0]._id;
            }

            ws.send(JSON.stringify({status: 'Connected', user: user, room: room }));
            // Publish to all clients
            redis.GetPublisher().publish('join:new', JSON.stringify({ user: user, room: room }));
        } catch (e) {
            console.log(e);
        }
    },

    async leave(ws) {
        const users = db.Get().collection("users");
        const rooms = db.Get().collection("rooms");

        let roomFilter = { _id: ObjectId(ws.roomID) };
        let room = await rooms.findOne(roomFilter);
        if (room) {
            let prev = room.participants.filter(p => {
                return p.equals(ws.userID);
            });
            if (prev.length > 0) {
                let participants = room.participants.filter(p => {
                    return !p.equals(ws.userID);
                });
                const updateDoc = {
                    $set: {
                        participants: participants,
                        updatedAt: Date.now(),
                    },
                };
                await rooms.updateOne(roomFilter, updateDoc);
            }
        }

        let userFilter = { _id: ObjectId(ws.userID) };
        let user = await users.findOne(userFilter);
        // Publish to all clients
        redis.GetPublisher().publish('join:left', JSON.stringify({ user: user, room: room }));
    }
};
