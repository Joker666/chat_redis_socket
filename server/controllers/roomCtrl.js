import db from '../db/db';

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
            } else {
                let user = {
                    name: data.name,
                    ipAddress: req.socket.remoteAddress,
                    lastJoinedAt: Date.now(),
                }
                user = await users.insertOne(user);
            }
            ws.userID = user._id;

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
            } else {
                let room = {
                    name: 'main',
                    participants: [ws.userID],
                    updatedAt: Date.now(),
                }
                room = await rooms.insertOne(room);
            }
            ws.roomID = room._id;

            ws.send(JSON.stringify({status: 'Connected'}));
        } catch (e) {
            console.log(e);
        }
    },

    async leave(ws) {
        const rooms = db.Get().collection("rooms");
    }
};
