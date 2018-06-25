let rp = require('request-promise');

class FootballDataOrg {
    constructor() {
        let FootballData = require('node-football-data');
        let config = require("../data/config.json");

        this.api = FootballData(config.fdo_key);
        return this;
    }
}

module.exports = {
    FootballDataOrg: FootballDataOrg
};