const BaseCommand = require('../../utils/structures/BaseCommand');
const Discord = require('discord.js');
const Game = require('./game-files/sketch');

const reactions = {
  '1️⃣': 1,
  '2️⃣': 2,
  '3️⃣': 3,
  '4️⃣': 4,
  '5️⃣': 5,
  '6️⃣': 6,
  '7️⃣': 7,
};

module.exports = class C4Command extends BaseCommand {
  constructor() {
    super('c4', 'play', []);
  }

  async run(client, message, args) {
    const challenged = message.mentions.members.first();
    if (!challenged) {
      message.reply('you need to mention someone to battle with!');
      return;
    }
    
    const nameDict = {
      'red': getName(message.member),
      'yellow': getName(challenged),
    };

    const playerIDs = [message.author.id, challenged.id];
    let currentPlayer = 0;

    // make a game instance
    const game = new Game(nameDict);

    // send embed and image
    const gameMessage = await message.channel.send(await createEmbed(client, game, nameDict, message));

    // add reactions
    for (let reaction of Object.keys(reactions))
      gameMessage.react(reaction);

    // remove all reactions added by users
    const collectorFilter = (_, user) => !user.bot;
    const collector = gameMessage.createReactionCollector(collectorFilter);
    collector.on('collect', reaction => {
      reaction.users.cache.array().forEach(user => {
        if (!user.bot) reaction.users.remove(user.id);
      });
    });

    let reactionFilter;
    let col;

    while (!game.isGameOver) {
      try {
        // await reactions
        reactionFilter = (reaction, user) => user.id == playerIDs[currentPlayer] && Object.keys(reactions).includes(reaction.emoji.name);
        const collectedReaction = await gameMessage.awaitReactions(reactionFilter, { max: 1, time: 30000, errors: ['time'] });
        col = reactions[collectedReaction.first().emoji.name];
      } catch (err) {
        // end game if player didn't respond
        message.channel.send('Player didn\'t respond in 30 seconds, game is canceled.');
        // delete all attachments after game ends
        game.attachments.forEach(msg => msg.delete());
        return;
      }

      // add a piece in the chosen column
      game.addPiece(col);

      // switch player
      currentPlayer = 1 - currentPlayer;

      // edit image
      await gameMessage.edit(await createEmbed(client, game, nameDict, message));
    }

    // delete all attachments after game ends
    game.attachments.forEach(msg => msg.delete());
  }
}

async function createEmbed(client, game, nameDict, message) {
  const img = game.canvas.toBuffer();
  const attachment = new Discord.MessageAttachment(img);
  const developmentChannel = client.channels.cache.get('804293967931506689');
  const attachmentMsg = await developmentChannel.send(attachment);
  const imgUrl = attachmentMsg.attachments.first().url;

  const embed = new Discord.MessageEmbed()
    .setTitle(`Waiting for ${nameDict[game.turn]}...`)
    .setImage(imgUrl)
    .setDescription('Made by <@310670926960394240> and <@319478655568838657>')
    .setColor(getPresentColor(game))
    .setTimestamp()
    .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))

  game.attachments.push(attachmentMsg);
  return embed;
}

function getName(member) {
  return member.nickname || member.user.username;
}

function getPresentColor(game) {
  if (game.isGameOver)
    return game.turn == 'red' ? 0xffff00 : 0xff0000;
  return game.turn == 'red' ? 0xff0000 : 0xffff00;
}