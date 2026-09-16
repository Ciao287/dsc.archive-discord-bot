const util = require("util");

class Messages extends Array {
    constructor(messages) {
        super(...messages);
    };

    get raw() {
        return [...this];
    };

    get(id) {
        return this.find(msg => msg.id === id);
    };

    first(amount = 1) {
        if (typeof amount !== "number" || Number.isNaN(amount) || amount <= 0) throw new TypeError(`The message amount must be a positive number.`);

        if (!Number.isInteger(amount)) throw new TypeError(`Amount must be an integer.`);

        if (amount === 1) return this[0];

        return [...this].slice(0, amount);
    };

    last(amount = 1) {
        if (typeof amount !== "number" || Number.isNaN(amount) || amount <= 0) throw new TypeError(`The message amount must be a positive number.`);

        if (!Number.isInteger(amount)) throw new TypeError(`Amount must be an integer.`);

        if (amount === 1) return this[this.length - 1];

        return [...this].slice(-amount);
    };

    [util.inspect.custom](depth, options) {
        if (this.length > 5) {
            return options.stylize(`[${this.constructor.name}]`, `special`);
        };

        return this;
    };
};

module.exports = Messages;