const { MessageFlags } = require('discord.js');
const command = require('../Command/fetchMessages.js');

async function loadCommand(client) {
    client.commands.set(command.data.name, command);

    await client.application.commands.set([command.data.toJSON()]);

    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) return interaction.reply({ content: `Command ${interaction.commandName} not found.`, flags: MessageFlags.Ephemeral });

        try {
            await command.execute(interaction, client);
        } catch (e) {
            console.error(e);
            try {
                if (interaction.replied || interaction.deferred) {
                    await interaction.editReply({ content: 'An error occurred while executing the command.', flags: MessageFlags.Ephemeral });
                } else {
                    await interaction.reply({ content: 'An error occurred while executing the command.', flags: MessageFlags.Ephemeral });
                };
            } catch (e) {
                console.error('Failed to send error message:', e);
            };
        };
    });

    console.log('Loaded Command.');
}

module.exports = { loadCommand };