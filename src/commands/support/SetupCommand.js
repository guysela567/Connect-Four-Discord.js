const BaseCommand = require('../../utils/structures/BaseCommand');
const fs = require('fs');

module.exports = class SetupCommand extends BaseCommand {
  constructor() {
    super('setup', 'support', []);
  }

  async run(client, message, args) {
    if (!message.member.hasPermission('ADMINISTRATOR')) {
      await message.channel.send('You don\'t have to permission to do that (administrator required).');
      return;
    }

    // add data
    const dir = 'src/db/setup.json';
    fs.readFile(dir, 'utf8', async function readFileCallback(err, data) {
      if (err) {
        console.log(err);
      } else {
      const obj = JSON.parse(data); // parse data
      
      // check if setup was already done
      if (obj.hasOwnProperty(message.guild.id))
        message.channel.send('Setup already done for this server, doing re-setup.');

      // create new text channel
      await message.channel.send('Enter channel name:');
      const channelName = await message.channel.awaitMessages(msg => msg.author.id == message.author.id, { max: 1 });
      const createdChannel = await message.guild.channels.create(channelName.first().content,
      {
        type: 'text',
        // give the bot permissions to that channel
        permissionOverwrites: [
          {
            id: message.guild.me,
            allow: [
              'READ_MESSAGE_HISTORY',
              'VIEW_CHANNEL',
              'ATTACH_FILES',
              'SEND_MESSAGES',
              'MANAGE_MESSAGES',
              'EMBED_LINKS',
              'ADD_REACTIONS',
            ]
          },
        ],
      });

      obj[message.guild.id] = createdChannel.id; //add guild's configuration data
      const json = JSON.stringify(obj, null, 2); //convert it back to json
      fs.writeFile(dir, json, 'utf8', () => { // write it back 
        message.channel.send('Done!');
      });
    }});
  }
}