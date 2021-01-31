const BaseEvent = require('../../utils/structures/BaseEvent');

const statuses = [
  'c4!setup to get started',
  'c4!help to get help',
  'Mention me for my prefix',
];

module.exports = class ReadyEvent extends BaseEvent {
  constructor() {
    super('ready');
  }

  async run (client) {
    console.log(client.user.tag + ' has logged in.');

    let index = 0;
    while (true) {
      await client.user.setActivity(statuses[index]);
      await new Promise(resolve => setTimeout(resolve, 5000));
      index++;
      if (index == statuses.length) index = 0;
    }
  }
}