const util = require("util");

class BaseMap extends Map {
    get raw() {
        return new Map(this);
    };

    first(amount = 1) {
        const values = [...this.values()];
        if (typeof amount !== "number" || Number.isNaN(amount) || amount <= 0) throw new TypeError(`The message amount must be a positive number.`);

        if (!Number.isInteger(amount)) throw new TypeError(`Amount must be an integer.`);

        if (amount === 1) return values[0];

        return values.slice(0, amount);
    };

    last(amount = 1) {
        const values = [...this.values()];
        if (typeof amount !== "number" || Number.isNaN(amount) || amount <= 0) throw new TypeError(`The message amount must be a positive number.`);

        if (!Number.isInteger(amount)) throw new TypeError(`Amount must be an integer.`);

        if (amount === 1) return values[values.length - 1];

        return values.slice(-amount);
    };

    [util.inspect.custom](depth, options) {
        if (this.size > 5) {
            return options.stylize(`[${this.constructor.name}]`, `special`);
        };

        return this;
    };
};

module.exports = BaseMap;