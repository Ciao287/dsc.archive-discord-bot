const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { fetchMessages } = require("dsc.archive");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('fetchmessages')
		.setDescription('Fetches messages from this channel (max 5 messages for performance reasons).')
        .addIntegerOption(option =>
            option.setName('amount')
            .setDescription('The number of messages to fetch (1-5).')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(5))
        .addStringOption(option => 
            option.setName('fields')
            .setDescription('The fields to include/exclude from the output (separated by commas).'))
        .addStringOption(options =>
            options.setName('options')
            .setDescription('Options to include/exclude additional data from the output (separated by commas).')),
	async execute(interaction, client) {
        const { options, channel } = interaction;
		const amount = options.getInteger('amount');
        let fields = options.getString('fields') || undefined;
        let additionalOptions = options.getString('options') || undefined;

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        if (fields) {
            if (fields !== 'false' && fields !== 'true' && fields !== 'undefined') {
                if (!fields.startsWith('{')) fields = `{${fields}}`;
                fields = fields.replace(/([{,])\s*([a-zA-Z_$][\w$]*)\s*:/g,'$1"$2":');
                try {
                    fields = JSON.parse(fields);
                } catch (error) {
                    return interaction.editReply({ content: "TypeError: Fields must be true, undefined or an object.", flags: MessageFlags.Ephemeral });
                };
            } else {
                if (fields === 'true') fields = true;
                if (fields === 'false') fields = false;
                if (fields === 'undefined') fields = undefined;
            }
        };

        if (additionalOptions) {
            if (additionalOptions !== 'false' && additionalOptions !== 'true' && additionalOptions !== 'undefined') {
                if (!additionalOptions.startsWith('{')) additionalOptions = `{${additionalOptions}}`;
                additionalOptions = additionalOptions.replace(/([{,])\s*([a-zA-Z_$][\w$]*)\s*:/g,'$1"$2":');
                try {
                    additionalOptions = JSON.parse(additionalOptions);
                } catch (error) {
                    return interaction.editReply({ content: "TypeError: Fields must be true, undefined or an object.", flags: MessageFlags.Ephemeral });
                };
            } else {
                if (additionalOptions === 'true') additionalOptions = true;
                if (additionalOptions === 'false') additionalOptions = false;
                if (additionalOptions === 'undefined') additionalOptions = undefined;
            };
        };

        let result;
        
        try {
            result = await fetchMessages(channel, amount, fields, additionalOptions);
            const json = await result.toJSON();
            await interaction.editReply({ files: [{attachment: Buffer.from(json), name: 'fetchedMessages.json'}], flags: MessageFlags.Ephemeral})
        } catch (error) {
            if (error instanceof TypeError) {
                await interaction.editReply({ content: `TypeError: ${error.message}`, flags: MessageFlags.Ephemeral });
            } else {
                console.error(error);
            };
            return;
        }
        console.log(result);
	}
};