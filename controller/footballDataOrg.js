class FootballDataOrg {
    constructor() {
        let FootballDataApi = require('node-football-api/lib/FootballDataApi');
        let config = require("../data/config.json");

        this.api = new FootballDataApi(config.fdo_key);
        return this;
    }
}

module.exports = {
    FootballDataOrg: FootballDataOrg
};
