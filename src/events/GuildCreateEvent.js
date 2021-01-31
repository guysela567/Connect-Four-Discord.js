const BaseEvent = require('../utils/structures/BaseEvent');
const Discord = require('discord.js');

module.exports = class GuildCreateEvent extends BaseEvent {
  constructor() {
    super('guildCreate');
  }
  
  async run(client, guild) {
    await client.channels.cache.get('804354985591963668').send(`Bot joined server: ${guild.name}, ${guild.memberCount.toLocaleString()} members.`);
    const logs = await guild.fetchAuditLogs({ limit: 1, type: 'BOT_ADD' });
    const inviter = logs.entries.first().executor;
    const dmChannel = await inviter.createDM();
    const embed = new Discord.MessageEmbed()
      .setTitle(`Thanks for using ${client.user.username}!`)
      .setDescription(`\`c4!setup\` to set up the bot in your server.
\`c4!help\` to get a list of all present commands.

If you're not sure about your bot configured prefix in your server, mention him in any text channel to get the current prefix.

For any more help or suggestions, join our [support server](https://discord.gg/YwNtfNXSMe).`)
      .setImage('https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Puissance4_01.svg/1200px-Puissance4_01.svg.png')
      .setColor(0xff);

    dmChannel.send(embed);
  }
}