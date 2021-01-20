import messageCtrl from './controllers/messageCtrl';

module.exports = (router) => {
    router.get('/', (req, res) => {
        res.send('Hello World!');
    });

    router.post('/message', messageCtrl.create);
}
