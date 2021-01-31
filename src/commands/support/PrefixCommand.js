const BaseCommand = require('../../utils/structures/BaseCommand');
const fs = require('fs');

module.exports = class PrefixCommand extends BaseCommand {
  constructor() {
    super('prefix', 'support', []);
  }

  async run(client, message, args) {
    if (!message.member.hasPermission('ADMINISTRATOR')) {
      await message.channel.send('You don\'t have to permission to do that (administrator required).');
      return;
    }

    // add data
    const dir = 'src/db/prefix.json';
    fs.readFile(dir, 'utf8', async (err, data) => {
      if (err) {
        console.log(err);
      } else {
      const obj = JSON.parse(data); // parse data
      const oldPrefix = obj[message.guild.id] || client.prefix;

      // create new text channel
      const prefix = args[0];
      if (!prefix) {
        message.channel.send(`You didn\'t supply a new prefix. Correct Usage of this command: \`${oldPrefix}prefix [new prefix]\``);
      }
      console.log(prefix);

      obj[message.guild.id] = prefix; //add guild's configuration data
      const json = JSON.stringify(obj, null, 2); //convert it back to json
      fs.writeFile(dir, json, 'utf8', () => { // write it back 
        message.channel.send(`Changed prefix to \`${prefix}\``);
      });
    }});
  }
}