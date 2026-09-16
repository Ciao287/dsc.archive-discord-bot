const FetchedMessages = require("../classes/FetchedMessages.js");

function hasTrueFields(fields) {
    let hasFalseFields;
    for (const field of Object.values(fields)) {
        if ((typeof field !== "boolean" && typeof field !== "object") || (typeof field === "object" && (field === null || Array.isArray(field) || !Object.keys(field).length))) throw new TypeError(`Field values must be true, false, or a non-empty object.`);
        if (field === true) return true;
        if (!hasFalseFields && field === false) hasFalseFields = true;
    };

    if(!hasFalseFields) return true;

    return false;
};

function filterFields(message, fields, authorsIds, interactionsIds, webhooksOption) {
    if (!message || typeof message !== "object") return {};

    if (fields === true) {
        fields = Object.fromEntries(
            Object.keys(message).map(field => [field, true])
        );
    };

    const hasWhitelist = hasTrueFields(fields, message);

    const filteredFields = {};

    if (hasWhitelist) {
        for (const [field, value] of Object.entries(fields)) {
            if (!(field in message)) continue;

            if (value === true) {
                filteredFields[field] = message[field];
            } else if (value && typeof value === "object" && typeof message[field] === "object") {
                const filteredFields2 = filterFields(message[field], value);
                if (Object.keys(filteredFields2).length) {
                    filteredFields[field] = filteredFields2;
                };
            };
        };
    } else {
        for (const [field, value] of Object.entries(message)) {
            if (!(field in fields)) {
                filteredFields[field] = value;
                continue;
            };

            if (fields[field] === false) continue;

            if (fields[field] && typeof fields[field] === "object" && typeof value === "object") {
                const filteredFields2 = filterFields(value, fields[field]);
                if (Object.keys(filteredFields2).length) {
                    filteredFields[field] = filteredFields2;
                };
            } else {
                filteredFields[field] = value;
            };
        };
    };

    if (Object.keys(filteredFields).length && message.author && (authorsIds || interactionsIds || webhooksOption)) {
        if (!message.webhookId && authorsIds) {
            let author = authorsIds.get(message.author.id);
            if (!author) {
                author = { messages: [] };
                authorsIds.set(message.author.id, author);
            };

            if (fields.id) author.messages.push(message.id);
        };

        if (message.webhookId && message.applicationId && interactionsIds) {
            let interaction = interactionsIds.get(message.author.id);
            if (!interaction) {
                interaction = { messages: [] };
                interactionsIds.set(message.author.id, interaction);
            };

            if (fields.id) interaction.messages.push(message.id);
        };

        if (message.webhookId && !message.applicationId && webhooksOption) {
            let webhook = webhooksOption.get(message.webhookId);
            if (!webhook) {
                webhook = { author: message.author, webhookId: message.webhookId, messages: [] };
                webhooksOption.set(message.webhookId, webhook);
            };

            if (fields.id) webhook.messages.push(message.id);
        };
    };

    return filteredFields;
};

async function fetchMessages(channel, amount = 100, fields, options) {
    if (!channel) throw new TypeError(`Channel is not valid.`);

    channel = await channel;
    
    if (typeof channel.isTextBased !== "function") throw new TypeError(`Channel is not valid.`);

    if (!channel.isTextBased()) throw new TypeError(`Channel type "${channel.type}" does not support messages.`);

    if(typeof amount === "boolean") amount = 100;

    if (typeof amount !== "number" || Number.isNaN(amount) || amount <= 0) throw new TypeError(`The message amount must be a positive number.`);

    if (amount !== Infinity && !Number.isInteger(amount)) throw new TypeError(`Amount must be Infinity or an integer.`);

    const defaultFields = {
        id: true,
        createdTimestamp: true,
        content: true,
        author: {
            id: true,
            username: true,
            bot: true,
            system: true,
        },
        editedTimestamp: true
    };

    if ((fields !== undefined && fields !== true && typeof fields !== "object") || (typeof fields === "object" && (Array.isArray(fields) || fields === null))) throw new TypeError(`Fields must be true, undefined or an object.`);

    if (!fields) fields = defaultFields;

    if (typeof fields === "object" && !Object.keys(fields).length) throw new TypeError(`Fields object must contain at least one property.`);

    const optionsList = {
        guild: true,
        channel: true,
        authors: true,
        interactions: true,
        webhooks: true,
    };

    if ((options !== undefined && typeof options !== "boolean" && typeof options !== "object") || (typeof options === "object" && (Array.isArray(options) || options === null))) throw new TypeError(`Objects must be undefined, boolean or an object.`);
    
    if (options || options === undefined) options = optionsList;

    if (typeof options === "object" && !Object.keys(options).length) throw new TypeError(`Options object must contain at least one property.`);

    for (const [option, value] of Object.entries(options)) {
        if (!Object.hasOwn(optionsList, option)) throw new TypeError(`The ${option} property is invalid. Valid options properties are: guild, channel, authors, interactions, webhooks.`);
        if (typeof value !== "boolean") throw new TypeError(`The ${option} property must be a boolean.`);
    };

    let guildOption;
    let channelOption;
    let authorsOption;
    let authorsIds;
    let webhooksOption;
    let interactionsOption;
    let interactionsIds;

    if (options.guild && channel.guild) guildOption = await channel.guild.fetch();
    if (options.channel) channelOption = channel;
    if (options.authors) {
        authorsIds = new Map();
        authorsOption = new Map();
    };
    if (options.webhooks) webhooksOption = new Map();
    if (options.interactions) {
        interactionsIds = new Map();
        interactionsOption = new Map();
    };

    let messagesFetched = 0;
    let lastMessageFetched;
    let messages = [];
    const fetchTimestamp = Date.now();
    while (true) {
        let limit = Math.min(100, amount - messages.length);
        let msg = await channel.messages.fetch({limit: limit, before: lastMessageFetched});
        if (!msg.size) break;

        for (const message of msg.values()) {
            const filteredFields = filterFields(message, fields, authorsIds, interactionsIds, webhooksOption);
            if (Object.keys(filteredFields).length) {
                messages.push(filteredFields);
            };
        };

        messagesFetched += limit;
        lastMessageFetched = msg.last().id;
        if (msg.size < 100) break;
        if (messagesFetched >= amount) break;
    };

    if (authorsIds) {
        await Promise.all([...authorsIds].map(async ([id, data]) => {
            let member;
            if (channel.guild) {
                member = await channel.guild.members.fetch(id, { force: true }).catch(async () => { return await channel.client.users.fetch(id, { force: true } ); });
            } else {
                member = await channel.client.users.fetch(id, { force: true });
            };

            data = { author: member, ...data };

            authorsOption.set(id, data);
        }));
    };

    if (interactionsIds) {
        await Promise.all([...interactionsIds].map(async ([id, data]) => {
            let member;
            if (channel.guild) {
                member = await channel.guild.members.fetch(id, { force: true }).catch(async () => { return await channel.client.users.fetch(id, { force: true } ); });
            } else {
                member = await channel.client.users.fetch(id, { force: true });
            };

            data = { author: member, ...data };

            interactionsOption.set(id, data);
        }));
    };

    if (authorsOption && authorsOption.size === 0) authorsOption = null;

    if (interactionsOption && interactionsOption.size === 0) interactionsOption = null;

    if (webhooksOption && webhooksOption.size === 0) webhooksOption = null;

    return new FetchedMessages(messages, fetchTimestamp, {guild: guildOption, channel: channelOption, authors: authorsOption, interactions: interactionsOption, webhooks: webhooksOption})
};

module.exports = fetchMessages;