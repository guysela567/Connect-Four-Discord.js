// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-guildDelete
const BaseEvent = require('../utils/structures/BaseEvent');
module.exports = class GuildDeleteEvent extends BaseEvent {
  constructor() {
    super('guildDelete');
  }
  
  run(client, guild) {
    const channel = client.channels.cache.get('804357981701013552');
    if (channel)
      client.channels.cache.get('804357981701013552').send(`Bot removed from server: ${guild.name}`);
  }
}