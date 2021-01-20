import redis from 'redis';

let r = {
    subscriber: null,
    publisher: null,
}

function Connect() {
    r.subscriber = redis.createClient({
        port: process.env.REDIS_PORT,
        host: process.env.REDIS_HOST,
    });
    r.publisher  = redis.createClient({
        port: process.env.REDIS_PORT,
        host: process.env.REDIS_HOST,
    });
}

function GetSubscriber() {
    return r.subscriber;
}

function GetPublisher() {
    return r.publisher;
}

module.exports = {
    Connect,
    GetSubscriber,
    GetPublisher
}
