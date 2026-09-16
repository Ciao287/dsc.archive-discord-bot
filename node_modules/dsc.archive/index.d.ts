import { TextBasedChannel, Guild, User, GuildMember, Webhook } from "discord.js"

/**
 * The message properties to include or exclude from the result.
 * The message properties may change over time, so to see the updated full list visit: https://discord.js.org/docs/packages/discord.js/main/Message:Class
 */
export type Fields = { [field: string]: boolean | Fields; }

/**
 * The default fields.
 */
export type DefaultFields = {
    /**
     * The message ID.
     */
    id: true;
    /**
     * When the message was sent.
     */
    createdTimestamp: true;
    /**
     * The message content.
     */
    content: true;
    /**
     * The message author.
     */
    author: {
        /**
         * The message author ID.
         */
        id: true;
        /**
         * The message author username.
         */
        username: true;
        /**
         * Whether the author belongs to an OAuth2 application.
         */
        bot: true;
        /**
         * Whether the author is an Official Discord System user.
         */
        system: true;
    };
    /**
     * When the message was edited (or null if never).
     */
    editedTimestamp: true;
}

/**
 * Additional data to include in {@link FetchedMessages}.
 */
export interface Options {
    /**
     * The guild where the channel is located.
     */
    guild?: boolean;
    /**
     * The text-based channel provided to `fetchMessages()`.
     */
    channel?: boolean;
    /**
     * The authors that sent messages.
     */
    authors?: boolean;
    /**
     * The authors that sent messages associated with interactions.
     */
    interactions?: boolean;
    /**
     * The webhooks that sent messages.
     */
    webhooks?: boolean;
}

/**
 * The default options.
 * {@link Options} to see the explanation for each option.
 */
export type DefaultOptions = {
    guild: true;
    channel: true;
    authors: true;
    interactions: true;
    webhooks: true;
}

export interface FetchedMessage { [field: string]: unknown; }

export class Messages extends Array<FetchedMessage> {
    /**
     * Returns the original array of messages without the custom wrapper.
     */
    readonly raw: FetchedMessage[];
    
    /**
     * Get a message in the array.
     * @param id The ID of the message you want to get. 
     */
    get(id: string): FetchedMessage | undefined;
    
    /**
     * Get the first message(s) in the array.
     * @param amount The amount of messages you want. Amount should be an integer greater than 0. Default `1`.
     */
    first(amount?: number): FetchedMessage | FetchedMessage[] | undefined;
    
    /**
     * Get the last message(s) in the array.
     * @param amount The amount of messages you want. Amount should be an integer greater than 0. Default `1`.
     */
    last(amount?: number): FetchedMessage | FetchedMessage[] | undefined;
}

export class BaseMap<T> extends Map<string, T> {
    /**
     * Returns the original map without the custom wrapper.
     */
    readonly raw: Map<string, T>;
    
    /**
     * Get the first entry(s) in the map.
     * @param amount The amount of entries you want. Amount should be an integer greater than 0. Default `1`.
     */
    first(amount?: number): T | Map<string, T> | undefined;
    
    /**
     * Get the last entry(s) in the map.
     * @param amount The amount of entries you want. Amount should be an integer greater than 0. Default `1`.
     */
    last(amount?: number): T | Map<string, T> | undefined;
}

/**
 * Data associated with an author, interaction or webhook.
 */
export interface BaseMapData<T> {
    author: T;
    messages: string[];
}

export type Authors = BaseMapData<GuildMember | User>
export type Interactions = BaseMapData<GuildMember | User>
export type Webhooks = BaseMapData<Webhook>

export class FetchedMessages {
    /**
     * The messages fetched from the channel.
     * If no messages satisfy the provided fields, this property will be an empty array.
     */
    messages: Messages;
    /**
     * The guild where the channel is located.
     * If the channel is a DM channel, this property will be `null`.
     * If the `guild` option is `false`, this property will be `null`.
     */
    guild: Guild | null;
    /**
     * The text-based channel provided to `fetchMessages()`.
     * If the `channel` option is `false`, this property will be `null`.
     */
    channel: TextBasedChannel | null;
    /**
     * The authors that sent messages.
     * If no authors sent messages in the fetched messages, this property will be `null`.
     * If the `authors` option is `false`, this property will be `null`.
     */
    authors: BaseMap<Authors> | null;
    /**
     * The authors that sent messages associated with interactions.
     * If no authors sent messages associated with interactions in the fetched messages, this property will be `null`.
     * If the `interactions` option is `false`, this property will be `null`.
     */
    interactions: BaseMap<Interactions> | null;
    /**
     * The webhooks that sent messages.
     * If no webhooks sent messages in the fetched messages, this property will be `null`.
     * If the `webhooks` option is `false`, this property will be `null`.
     */
    webhooks: BaseMap<Webhooks> | null;
    /**
     * The timestamp when the fetch started.
     */
    fetchTimestamp: number;

    /**
     * Alias of `messages.length`.
     */
    readonly length: number;
    
    /**
     * Alias of `messages.length`.
     */
    readonly size: number;
}

/**
 * Fetch messages from a text-based channel. 
 * 
 * @param channel The text-based channel from which you want to fetch messages.
 * @param amount The amount of messages you want to fetch. Amount must be an integer between 1 and Infinity. Default `100`.
 * @param fields Fields to include/exclude from the result. Default `undefined`.
 * If `fields` is omitted (`undefined`), the default fields are used: {@link DefaultFields}.
 * @param options Options to include/exclude additional data from the result. Default `undefined`.
 * If `options` is omitted (`undefined`), the default options are used: {@link DefaultOptions}.
 * @returns A {@link FetchedMessages} object containing the fetched messages, the fetch timestamp, and the data requested through `options`.
 */
export function fetchMessages( channel: TextBasedChannel, amount?: number, fields?: true | Fields, options?: boolean | Options): Promise<FetchedMessages>