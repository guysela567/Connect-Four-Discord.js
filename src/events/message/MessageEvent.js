const BaseEvent = require('../../utils/structures/BaseEvent');
const db = require('../../db/prefix.json');

module.exports = class MessageEvent extends BaseEvent {
  constructor() {
    super('message');
  }
  
  async run(client, message) {
    if (message.author.bot) return;

    const prefix = db[message.guild.id] || client.prefix;

    if (message.mentions.users.array().includes(client.user))
      message.channel.send(`My prefix is \`${prefix}\``);
    if (message.content.startsWith(prefix)) {
      const [cmdName, ...cmdArgs] = message.content
      .toLowerCase()
      .slice(prefix.length)
      .trim()
      .split(/\s+/);
      const command = client.commands.get(cmdName);
      if (command) {
        command.run(client, message, cmdArgs, prefix);
      }
    }
  }
}