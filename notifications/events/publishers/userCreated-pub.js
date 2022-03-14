const { Subject,Publisher } = require('@srpfoodapp/comman');
const natsWrapper = require('../nats-wrapper')
let UserCreatedPublisher = new Publisher(natsWrapper.client, Subject.UserCreated);
module.exports = UserCreatedPublisher
