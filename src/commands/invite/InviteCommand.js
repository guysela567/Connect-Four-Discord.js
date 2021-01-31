const BaseCommand = require('../../utils/structures/BaseCommand');
const Discord = require('discord.js');

const inviteUrl = 'https://discord.com/oauth2/authorize?client_id=803976994848243714&scope=bot&permissions=388312';

module.exports = class InviteCommand extends BaseCommand {
  constructor() {
    super('invite', 'invite', []);
  }

  run(client, message, args) {
    const embed = new Discord.MessageEmbed()
      .setTitle('Invite link')
      .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: false }), inviteUrl)
      .setColor('#ff0000')
      .setDescription(`[Click here to invite the bot to your server!](${inviteUrl})`)
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }));
    message.channel.send(embed);
  }
}