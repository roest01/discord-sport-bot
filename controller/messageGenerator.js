let dateFormat = require("dateformat");

class MessageGenerator {
    constructor(guild) {
        this.client = guild.client;
    }


    getMatchMessage(matchID){
        let messageGenerator = this;
        return new Promise((resolveMatchMessages, rejectMatchMessages) => {
            this._getMatch(matchID).then((fixture) => {
                resolveMatchMessages({
                    embed: {
                        color: 2067276,
                        fields: [this._getMessageFieldFromFixture(fixture)]
                    }
                });
            });
        });
    };

    /**
     *
     * @param channelID
     * @param timeFrame {String} n1
     * @param matchStatus
     * @returns {Promise<any>} Resolve array of string messages
     */
    getMatchInfoMessages(channelID, matchStatus="IN_PLAY", timeFrame=0){
        let messageGenerator = this;
        return new Promise((resolveMatchInfoMessages, rejectMatchInfoMessages) => {
            this._getMatches(channelID, matchStatus, timeFrame).then(function (competitionPromises) {
                Promise.all(competitionPromises).then(competitionFixtures => {
                    let messages = [];
                    competitionFixtures.forEach(response => {
                        let competition = response.competition;
                        let messageFields = [];
                        response.fixtures.forEach(function (fixture) {
                            messageFields.push(messageGenerator._getMessageFieldFromFixture(fixture))
                        });

                        if (messageFields.length > 0) {
                            let dateFilter = messageGenerator.timeFrameToDate(timeFrame);

                            messages.push({
                                embed: {
                                    color: 3447003,
                                    title: competition.name,
                                    description: dateFormat(new Date(dateFilter.dateFrom), messageGenerator.client.settings.dateFormat),
                                    fields: messageFields
                                }
                            });
                        }
                    });
                    resolveMatchInfoMessages({
                        info: {
                            timeFrame: timeFrame,
                            status: matchStatus,
                            channelID: channelID
                        },
                        messages: messages
                    });
                }).catch(rejectMatchInfoMessages);
            }).catch(rejectMatchInfoMessages);
        });
    };

    getListMessage(tier){
        return new Promise((resolve, reject) => {
            let api = this.client.fdo.api;
            let prefix = this.client.settings.prefix;
            if (!tier) { tier = "TIER_ONE" }

            api.getCompetitions({
                plan: tier
            }).then(function (res) {
                let competitions = "";
                res.competitions.forEach(function(item){
                    competitions += item.name + " " + "(`" + prefix + "add " + item.id + "`)" + "\n";
                });
                resolve(competitions)
            }).catch(reject);
        });
    }

    getTodayMessages(channelID, timeFrame= 0){
        let messageGenerator = this;
        return new Promise((resolveTodayMessages, rejectTodayMessages) => {
            this._getMatches(channelID, "ALL", timeFrame).then(function(competitionPromises){
                Promise.all(competitionPromises).then(competitionFixtures => {
                    let messages = []; //multiple messages allowed
                    competitionFixtures.forEach(response => {
                        let competition = response.competition;
                        let messageFields = [];
                        response.fixtures.forEach(function(fixture){
                            messageFields.push(messageGenerator._getMessageFieldFromFixture(fixture))
                        });

                        if (messageFields.length > 0){
                            let dateFilter = messageGenerator.timeFrameToDate(timeFrame);

                            messages.push({embed: {
                                    color: 3447003,
                                    title: competition.name,
                                    description: dateFormat(new Date(dateFilter.dateFrom), messageGenerator.client.settings.dateFormat),
                                    fields: messageFields
                                }
                            });
                        }
                    });
                    resolveTodayMessages(messages);
                }).catch(rejectTodayMessages);
            }).catch(rejectTodayMessages);
        });
    }

    _getMessageFieldFromFixture(match) {
        let matchDate = new Date(match.utcDate);


        let matchInfo = {
            name: match.homeTeam.name + " ( " + match.score.fullTime.homeTeam + " ) vs " + match.awayTeam.name + " ( " + match.score.fullTime.awayTeam + " )",
            value: match.status + " - " + dateFormat(matchDate, this.client.settings.timeFormat) + "\n" + match.id
        };
        if (match.status === "SCHEDULED") { //remove goals if not started
            matchInfo.name = match.homeTeam.name + " vs " + match.awayTeam.name;
        }
        return matchInfo;
    }

    /**
     *
     * @param matchID
     * @private
     */
    _getMatch(matchID){
        return new Promise((resolveGetMatch, rejectGetMatch) => {
            let api = this.client.fdo.api;

            if (!!matchID){
                api.getMatch(matchID).then((response) => {
                    console.log(response);
                    resolveGetMatch(response.match);
                }).catch(rejectGetMatch);
            }
        });
    }

    /**
     *
     * @param channelID
     * @param runningState
     * @param timeFrame
     * @returns {Promise<any>} Resolve with Promise.all(retVal).then(x)
     * @private
     */
    _getMatches(channelID, runningState="ALL", timeFrame= 0){
        let timeFrameObj = this.timeFrameToDate(timeFrame);


        return new Promise((resolveGetMatches, rejectGetMatches) => {
            let api = this.client.fdo.api;
            let storageWorker = this.client.storageWorker;

            storageWorker.getWatcherForChannel(channelID).then(function(watchers){
                let promiseStack = [];
                watchers.forEach(function(watcher){
                    promiseStack.push(new Promise((resolveWatcher, rejectWatcher) => {
                        api.getCompetition(watcher.league).then(function(competition){
                            api.getCompetitionMatches(competition.id, timeFrameObj
                            ).then(function(result){
                                let retFixtures = [];
                                result.matches.forEach(function(match){
                                    if (
                                        (runningState === "ALL" || runningState === match.status)
                                    ){
                                        retFixtures.push(match);
                                    }
                                });
                                resolveWatcher({
                                    competition: competition,
                                    fixtures: retFixtures
                                });
                            }).catch(rejectWatcher);
                        }).catch(rejectWatcher);
                    }));
                });
                resolveGetMatches(promiseStack);
            }).catch(rejectGetMatches);
        });
    }

    timeFrameToDate(timeFrame) {
        let today = new Date();

        if (!timeFrame){ timeFrame = 0; }

        console.log(timeFrame);

        let date = today;
        if (timeFrame.toString().startsWith("+")){
            let tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + parseInt(timeFrame.replace('+', '')));
            date = tomorrow;
        } else if (timeFrame.toString().startsWith("-"))  {
            let today = new Date();
            let yesterday = new Date(today);
            console.log(timeFrame, "<---");
            yesterday.setDate(yesterday.getDate() - parseInt(timeFrame.toString().replace('-', '')));
            date = yesterday;
        }


        //date format is required by api
        let year = date.toLocaleString("en-GB", {year: 'numeric'});
        let month = date.toLocaleString("en-GB", {month: '2-digit'});
        let day = date.toLocaleString("en-GB", {day:'2-digit'});
        let filterDate = year + "-" + month + "-" + day;


        return {
            dateFrom: filterDate,
            dateTo: filterDate
        };
    }
}

module.exports = {
    MessageGenerator: MessageGenerator
};
