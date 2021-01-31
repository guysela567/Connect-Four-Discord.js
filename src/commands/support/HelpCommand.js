const BaseCommand = require('../../utils/structures/BaseCommand');
const db = require('../../db/setup.json');

module.exports = class HelpCommand extends BaseCommand {
  constructor() {
    super('help', 'support', []);
  }

  async run(client, message, args, prefix) {
    let text = `\`\`\`
Prefix for this server: ${prefix}

    ---- COMMANDS LIST ----
${prefix}!help: shows this message.
${prefix}setup: setup a channel for this game.
${prefix}play @user: play connect four.
${prefix}prefix [new prefix]: change bot's prefix.
\`\`\``;

    if (db.hasOwnProperty(message.guild.id))
      text += `\nNOTE: the \`${prefix}play\` command is only usable at <#${db[message.guild.id]}>`;
    else text += `\nNOTE: server needs to be set up, type \`${prefix}setup\` to set up.`

    await message.channel.send(text);
  }
}
