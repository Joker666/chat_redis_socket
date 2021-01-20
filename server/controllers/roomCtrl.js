module.exports = {
    async join(ws, req, db, data) {
        const users = db.collection("users");

        try {
            let user = await users.findOne({ name: data.name });
            console.log(user);
        } catch (e) {
            console.log(e);
        }
    },
};
