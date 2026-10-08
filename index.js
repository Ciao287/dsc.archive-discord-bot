const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { token } = require("./config.json");
const { loadCommand } = require('./Handler/commandHandler');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

client.login(token).then(() => {
    loadCommand(client);
});