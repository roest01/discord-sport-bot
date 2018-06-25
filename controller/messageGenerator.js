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
                        fields: [MessageGenerator._getMessageFieldFromFixture(fixture)]
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
    getMatchInfoMessages(channelID, matchStatus="IN_PLAY", timeFrame=1){
        return new Promise((resolveMatchInfoMessages, rejectMatchInfoMessages) => {
            this._getMatches(channelID, matchStatus, timeFrame).then(function (competitionPromises) {
                Promise.all(competitionPromises).then(competitionFixtures => {
                    let messages = [];
                    competitionFixtures.forEach(response => {
                        let competition = response.competition;
                        let messageFields = [];
                        response.fixtures.forEach(function (fixture) {
                            messageFields.push(MessageGenerator._getMessageFieldFromFixture(fixture))
                        });

                        if (messageFields.length > 0) {
                            messages.push({
                                embed: {
                                    color: 3447003,
                                    title: "_" + competition.caption + "_",
                                    description: "Matchday: __" + competition.currentMatchday + "/" + competition.numberOfMatchdays + "__",
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

    getListMessage(season){
        return new Promise((resolve, reject) => {
            let api = this.client.fdo.api;
            let prefix = this.client.akairoOptions.prefix;
            if (!season) { season = (new Date()).getFullYear() }

            api.getCompetitions(season).then(function (res) {
                let competitions = "";
                res.forEach(function(item){
                    competitions += item.caption + " " + "(`" + prefix + "add " + item.id + "`)" + "\n";
                });
                resolve(competitions)
            }).catch(reject);
        });
    }

    getTodayMessages(channelID){
        let messageGenerator = this;
        return new Promise((resolveTodayMessages, rejectTodayMessages) => {
            this._getMatches(channelID).then(function(competitionPromises){
                Promise.all(competitionPromises).then(competitionFixtures => {
                    let messages = []; //multiple messages allowed
                    competitionFixtures.forEach(response => {
                        let competition = response.competition;
                        let messageFields = [];
                        response.fixtures.forEach(function(fixture){
                            messageFields.push(MessageGenerator._getMessageFieldFromFixture(fixture))
                        });

                        if (messageFields.length > 0){
                            messages.push({embed: {
                                    color: 3447003,
                                    title: "_" + competition.caption + "_",
                                    description: "Matchday: __"+competition.currentMatchday + "/" + competition.numberOfMatchdays+"__",
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

    static _getMessageFieldFromFixture(fixture) {
        let matchDate = new Date(fixture.date);

        let matchInfo = {
            name: fixture.homeTeamName + " ( " + fixture.result.goalsAwayTeam + " ) vs " + fixture.awayTeamName + " ( " + fixture.result.goalsAwayTeam + " )",
            value: fixture.status + " " + matchDate.toLocaleDateString('de-DE') + " " + matchDate.toLocaleTimeString('de-DE')
        };
        if (fixture.status === "TIMED") { //remove goals if not started
            matchInfo.name = fixture.homeTeamName + " vs " + fixture.awayTeamName;
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
                api.getFixture(matchID).then((response) => {
                    resolveGetMatch(response.fixture);
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
    _getMatches(channelID, runningState="ALL", timeFrame=1){
        let timeFrameObj = this.timeFrameToDate(timeFrame);


        return new Promise((resolveGetMatches, rejectGetMatches) => {
            let api = this.client.fdo.api;
            let storageWorker = this.client.storageWorker;

            storageWorker.getWatcherForChannel(channelID).then(function(watchers){
                let promiseStack = [];
                watchers.forEach(function(watcher){
                    promiseStack.push(new Promise((resolveWatcher, rejectWatcher) => {
                        api.getCompetition(watcher.league).then(function(competition){
                            api.getLeagueFixturesInTimeFrame(competition.id, timeFrameObj.timeFrameRequest
                            ).then(function(result){
                                let retFixtures = [];
                                result.fixtures.forEach(function(fixture){
                                    let fixtureDate = new Date(fixture.date);

                                    if (
                                        (runningState === "ALL" || runningState === fixture.status)
                                        &&
                                        (timeFrameObj.requestedDate.toDateString() === fixtureDate.toDateString())
                                    ){
                                        retFixtures.push(fixture);
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
        let timeFrameRequest;
        let requestedDate = new Date();
        if (!!timeFrame) {
            timeFrame = parseInt(timeFrame);//convert to INT
            if (timeFrame < 0) {
                timeFrameRequest = "p" + (timeFrame * -1);
                requestedDate.setDate(requestedDate.getDate() - (timeFrame * -1));
            } else if (timeFrame > 1) { //1 = today therefore > 1
                timeFrameRequest = "n" + timeFrame;
                requestedDate.setDate(requestedDate.getDate() + timeFrame);
            } else {
                timeFrameRequest = "n1"
            }
        }
        return {
            timeFrameRequest: timeFrameRequest,
            requestedDate: requestedDate
        };
    }
}

module.exports = {
    MessageGenerator: MessageGenerator
};