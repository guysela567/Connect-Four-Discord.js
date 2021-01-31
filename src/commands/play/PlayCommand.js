const BaseCommand = require('../../utils/structures/BaseCommand');
const Discord = require('discord.js');
const Game = require('./game-files/sketch');
const GIFEncoder = require('gif-encoder-2');
const db = require('../../db/setup.json');
const fetch = require('node-fetch');
require('dotenv').config();

const reactions = {
  '1️⃣': 1,
  '2️⃣': 2,
  '3️⃣': 3,
  '4️⃣': 4,
  '5️⃣': 5,
  '6️⃣': 6,
  '7️⃣': 7,
  '🏳️': 'forfeit'
};

const timeForTurn = 45 * 1000;

module.exports = class PlayCommand extends BaseCommand {
  constructor() {
    super('play', 'play', []);
  }

  async run(client, message, args) {
    // check if server is set up
    if (db[message.guild.id]) {
      const channelId = db[message.guild.id];
      if (message.channel.id != '804357139132186655' && // bot-testing
        message.channel.id != channelId) {
        await message.channel.send(`You ca\'t use this command here! Try to use it in <#${channelId}>`);
        return;
      }
    }

    const challenged = message.mentions.members.first();
    if (!challenged) {
      message.reply('you need to mention someone to play with!');
      return;
    }

    if (challenged.id == message.author.id) {
      message.reply('you can\'t play with yourself dummy!');
      return;
    }

    if (challenged.user.bot) {
      message.reply('We are sorry, but we don\'t think he will reply...');
      return;
    }
    
    const nameDict = {
      'red': getName(message.member),
      'yellow': getName(challenged),
    };

    const profileImg = {
      'red': message.author.displayAvatarURL({ dynamic: true }),
      'yellow': challenged.user.displayAvatarURL({ dynamic: true }),
      'draw': 'https://media.giphy.com/media/M79uK5ysq1QefcGDqr/giphy.gif', // draw gif
    }
    
    const playerIDs = [message.author.id, challenged.id];
    let currentPlayer = 0;
    
    // make a game instance
    const game = new Game(nameDict);

    // make and start a gif encoder
    const encoder = new GIFEncoder(game.canvas.width, game.canvas.height);
    encoder.setDelay(500)
    encoder.start()
    
    // send embed and image
    const gameMessage = await message.channel.send(await createEmbed(client, game, nameDict, profileImg));

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
        const collectedReaction = await gameMessage.awaitReactions(reactionFilter, { max: 1, time: timeForTurn, errors: ['time'] });
        col = reactions[collectedReaction.first().emoji.name];
      } catch (err) {
        // end game if player didn't respond
        const img = await searchGif('times up');
        await gameMessage.edit(new Discord.MessageEmbed()
          .setTitle(`${nameDict[game.playerWaiting()]} Won!`)
          .setDescription(`\n${nameDict[game.turn]} didn\'t respond in ${timeForTurn / 1000} seconds...\n${nameDict[game.playerWaiting()]} Automatically won!`)
          .setColor(0xff)
          .setTimestamp()
          .setImage(img) // out of time gif
          .setThumbnail(profileImg[game.playerWaiting()])
        );
        endGame(game, gameMessage);
        return;
      }

      if (col == 'forfeit') {
        const img = await searchGif('forfeit');
        await gameMessage.edit(new Discord.MessageEmbed()
          .setTitle(`${nameDict[game.playerWaiting()]} Won!`)
          .setDescription(`\n${nameDict[game.turn]} forfeited...\n${nameDict[game.playerWaiting()]} Automatically won!`)
          .setColor(0xff)
          .setTimestamp()
          .setImage(img) // forfeit gif
          .setThumbnail(profileImg[game.playerWaiting()])
        );
        endGame(game, gameMessage);
        return;
      }

      if (!game.addPiece(col)) { // add a piece in the chosen column
        // continue only if move is valid
        encoder.addFrame(game.ctx); // add canvas image to encoder
        currentPlayer = 1 - currentPlayer; // switch player
        await gameMessage.edit(await createEmbed(client, game, nameDict, profileImg)); // edit embed
      }
    }

    endGame(game, gameMessage);
    // send gif via dms
    encoder.finish();
    [message.author, challenged.user].forEach(async user => {
      const dm = await user.createDM();
      await dm.send(new Discord.MessageAttachment(encoder.out.getData(), 'game-progress.gif'));
    });
  }
}

async function createEmbed(client, game, nameDict, profileImg) {
  const img = game.canvas.toBuffer();
  const attachment = new Discord.MessageAttachment(img);
  const developmentChannel = client.channels.cache.get('804356981129347072'); // bot-attachments
  const attachmentMsg = await developmentChannel.send(attachment);
  const imgUrl = attachmentMsg.attachments.first().url;
  const footerContent = !game.isGameOver ? '|       1      |       2      |      3      |      4      |' +
                        '      5       |      6       |      7     |' : '';

  const embed = new Discord.MessageEmbed()
    .setTitle(
      game.isGameOver ? 
        game.getWinner() ?
          `${nameDict[game.getWinner()]} Won!` :
        'Draw.' :
      `Waiting for ${nameDict[game.turn]}...`
    )
    .setImage(imgUrl)
    .setDescription('Made by <@310670926960394240> and <@319478655568838657>')
    .setColor(
      getPresenceColorString(game) != 'draw' ? 
      getPresenceColor(game) :
      0xff
    )
    .setFooter(footerContent)
    .setThumbnail(profileImg[getPresenceColorString(game)]);

    if (game.isGameOver) embed.setTimestamp();

  game.attachments.push(attachmentMsg);
  return embed;
}

function getName(member) {
  return member.nickname || member.user.username;
}

function getPresenceColor(game) {
  if (game.isGameOver)
    return game.turn == 'red' ? 0xffff00 : 0xff0000;
  return game.turn == 'red' ? 0xff0000 : 0xffff00;
}

function getPresenceColorString(game) {
  if (game.isGameOver) {
    if (game.getWinner()) return game.getWinner();
    return 'draw';
  }
  return game.turn;
}

function endGame(game, gameMessage) {
  gameMessage.reactions.removeAll(); // remove all reactions
  game.attachments.forEach(msg => msg.delete()); // delete all attachments after game ends
}

async function searchGif(query) {
  const apiUrl = `http://api.giphy.com/v1/gifs/search?q=${query}&api_key=${process.env.GIPHY_API_KEY}`;
  const collectedGifs = await (await fetch(apiUrl)).json();
  return collectedGifs.data[Math.floor(Math.random() * collectedGifs.data.length)].images.original.url;
}