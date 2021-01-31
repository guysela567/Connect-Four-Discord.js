require('dotenv').config();
const { Client } = require('discord.js');
const { registerCommands, registerEvents } = require('./utils/registry');
const config = require('../slappey.json');
const client = new Client();
const keepAlive = require('./server');

(async () => {
  client.commands = new Map();
  client.events = new Map();
  client.prefix = config.prefix;
  await registerCommands(client, '../commands');
  await registerEvents(client, '../events');
  keepAlive();
  await client.login(process.env.BOT_TOKEN);
})();

