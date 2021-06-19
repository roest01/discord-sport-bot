let dateFormat = require("dateformat");

class MessageGenerator {
    constructor(guild) {
        this.client = guild.client;
    }


    _getMatchData(matchID) {
        let api = this.client.fdo.api;

        return new Promise((resolve, reject) => {
            this._getMatch(matchID).then((match) => {
                api.getTeam(match.homeTeam.id).then(function (homeTeam) {
                    api.getTeam(match.awayTeam.id).then(function (awayTeam) {
                        resolve({
                            match: match,
                            homeTeam: homeTeam,
                            awayTeam: awayTeam
                        });
                    });
                });
            });
        });
    }

    getMatchMessage(matchID) {
        let messageGenerator = this;

        return new Promise((resolveMatchMessages, rejectMatchMessages) => {
            this._getMatchData(matchID).then((response) => {
                let match = response.match;
                let homeTeam = response.homeTeam;
                let awayTeam = response.awayTeam;
                let fields = [
                    messageGenerator._getMessageFieldFromFixture(match)
                ];
                let matchEmbedJSON = {
                    embed: {
                        color: 2067276,
                        fields: fields
                    }
                };


                if (!!match.score.halfTime.homeTeam) {
                    fields.push({
                        name: "HalfTime result",
                        value: match.homeTeam.name + " ( " + match.score.halfTime.homeTeam + " ) vs " + match.awayTeam.name + " ( " + match.score.halfTime.awayTeam + " )",
                    })
                }

                if (!!match.score.fullTime.homeTeam) {
                    fields.push({
                        name: match.status === "FINISHED" ? "FulTime result" : "Current result",
                        value: match.homeTeam.name + " ( " + match.score.fullTime.homeTeam + " ) vs " + match.awayTeam.name + " ( " + match.score.fullTime.awayTeam + " )",
                    })
                }

                if (!!match.score.extraTime.homeTeam) {
                    fields.push({
                        name: "ExtraTime result",
                        value: match.homeTeam.name + " ( " + match.score.extraTime.homeTeam + " ) vs " + match.awayTeam.name + " ( " + match.score.extraTime.awayTeam + " )",
                    })
                }

                if (!!match.score.penalties.homeTeam || !!match.score.penalties.awayTeam) {
                    fields.push({
                        name: "__Penalties result__",
                        value: match.homeTeam.name + " = " + match.score.penalties.homeTeam + "  | " + match.awayTeam.name + " = " + match.score.penalties.awayTeam,
                    })
                }


                if (!!match.score.winner) {
                    fields.push({
                        name: "WINNER",
                        value: (match.score.winner === "HOME_TEAM" ? match.homeTeam.name : match.awayTeam.name)
                    })

                    if (match.score.winner === "HOME_TEAM") {
                        matchEmbedJSON.thumbnail = {
                            url: homeTeam.crestUrl
                        };
                    } else {
                        matchEmbedJSON.thumbnail = {
                            url: awayTeam.crestUrl
                        };
                    }
                }

                if (!!match.goals) {
                    fields.push({
                        name: "⠀",
                        value: "**__Tore__**"
                    });

                    match.goals.forEach((goal) => {
                        let assist = "";
                        if (!!goal.assist){
                            assist = " nach Vorbereitung durch " + goal.assist.name;
                        }

                        let type = (goal.type === "OWN" ? "Eigentor" : "Tor");

                        fields.push({
                            name: "Minute " + goal.minute + " - " + goal.team.name,
                            value: type + " durch " + goal.scorer.name + " für " + goal.team.name + assist
                        });
                    });
                }

                if (!!match.bookings) {
                    fields.push({
                        name: "⠀",
                        value: "**__Karten__**"
                    });

                    match.bookings.forEach((booking) => {
                        let assist = "";
                        if (!!booking.assist){
                            assist = " nach Vorbereitung durch " + booking.assist.name;
                        }

                        let type = (booking.card === "YELLOW_CARD" ? "Gelbe Karte" : booking.card);

                        fields.push({
                            name: "Minute " + booking.minute + " - " + booking.team.name,
                            value: type + " für " + booking.player.name
                        });
                    });
                }


                fields.push({
                    name: "⠀",
                    value: "**__Schiedsrichter__**"
                });

                match.referees.forEach(function (referee) {
                    fields.push({
                        "name": referee.role,
                        "value": referee.name + " ( " + referee.nationality + " ) ",
                        "inline": true
                    });
                });


                fields.push({
                    "name": "Teams",
                    "value": match.homeTeam.name + ": `" + messageGenerator.client.settings.prefix + "team " + match.homeTeam.id + "`\n" + match.awayTeam.name + ": `" + messageGenerator.client.settings.prefix + "team " + match.awayTeam.id + "`\n"
                });

                fields.push({
                    "name": "Details",
                    "value": "`" + messageGenerator.client.settings.prefix + "lineup " + match.id + "`\n `" + messageGenerator.client.settings.prefix + "goals " + match.id + "`\n"
                });


                resolveMatchMessages(matchEmbedJSON);
            });
        });
    };

    getGoalsMessage(matchID) {
        let messageGenerator = this;

        return new Promise((resolveGoalsMessages, rejectGoalsMessages) => {
            this._getMatchData(matchID).then((response) => {
                let match = response.match;
                let fields = [
                    messageGenerator._getMessageFieldFromFixture(match)
                ];
                let GoalEmbedJSON = {
                    embed: {
                        color: 2067276,
                        fields: fields
                    }
                };

                if (!!match.goals) {
                    fields.push({
                        name: "⠀",
                        value: "**__Tore im Spiel__**"
                    });

                    match.goals.forEach((goal) => {
                        let assist = "";
                        if (!!goal.assist){
                            assist = " nach Vorbereitung durch " + goal.assist.name;
                        }

                        let type = (goal.type === "OWN" ? "Eigentor" : "Tor");

                        fields.push({
                            name: "MINUTE " + goal.minute,
                            value: type + " durch " + goal.scorer.name + " für " + goal.team.name + assist
                        });
                    });
                }

                resolveGoalsMessages(GoalEmbedJSON);
            });
        });
    }

    getLineUpMessage(matchID){
        let messageGenerator = this;

        return new Promise((resolveLineUpMessages, rejectLineUpMessages) => {
            this._getMatchData(matchID).then((response) => {
                let match = response.match;
                let fields = [
                    messageGenerator._getMessageFieldFromFixture(match)
                ];
                let lineUpEmbedJSON = {
                    embed: {
                        color: 2067276,
                        fields: fields
                    }
                };

                if (!!match.homeTeam.lineup) {
                    fields.push({
                        name: "⠀",
                        value: "⠀"
                    });

                    fields.push({
                        name: "LINEUP " + match.homeTeam.name,
                        value: "⠀"
                    });

                    if (!!match.homeTeam.captain) {
                        fields.push({
                            name: "Coach",
                            value: match.homeTeam.coach.name
                        });
                    }

                    match.homeTeam.lineup.forEach(function (player) {
                        fields.push({
                            name: player.name,
                            value: player.position + " | Nr: " + player.shirtNumber,
                            inline: true
                        });
                    });
                }

                if (!!match.awayTeam.lineup) {
                    fields.push({
                        name: "⠀",
                        value: "⠀"
                    });

                    fields.push({
                        name: "LINEUP " + match.awayTeam.name,
                        value: "⠀"
                    });

                    if (!!match.awayTeam.captain) {
                        fields.push({
                            name: "Coach",
                            value: match.awayTeam.coach.name
                        });
                    }

                    match.awayTeam.lineup.forEach(function (player) {
                        fields.push({
                            name: player.name,
                            value: player.position + " | Nr: " + player.shirtNumber,
                            inline: true
                        });
                    });
                }
                resolveLineUpMessages(lineUpEmbedJSON);
            });
        });
    }


    getTeamMessage(teamID) {
        let messageGenerator = this;
        return new Promise((resolveTeamMessages, rejectTeamMessages) => {
            let api = this.client.fdo.api;


            api.getTeam(teamID).then((team) => {
                let fields = [];
                let matchEmbedJSON = {
                    embed: {
                        title: team.name + " / " + team.tla,
                        description: "Foundet in " + team.founded + " this " + team.clubColors + " team home base is the " + team.venue,
                        color: 2067276,
                        fields: fields
                    }
                };

                /*api.getTeamMatches(teamID).then((response) => {
                    response.matches.forEach((match) => {
                        fields.push(messageGenerator._getMessageFieldFromFixture(match));
                    });
                });*/

                fields.push({
                    "name": "Team is active in these competitions",
                    "value": "⠀"
                });


                Promise.all(messageGenerator.getCompetitionFields(team.activeCompetitions)).catch((competitionFixtures => {
                    //The resource you are looking for is restricted. Please pass a valid API token and check your subscription for permission.
                    return competitionFixtures; //wanna proceed with then()
                })).then(competitionFixtures => {
                    competitionFixtures.forEach((singleComp) => {
                        fields.push(singleComp);
                    })
                }).finally(() => {
                    fields.push({
                        "name": "⠀",
                        "value": "LineUp of " + team.name
                    });

                    team.squad.forEach(function (player) {
                        fields.push({
                            "name": player.name,
                            "value": player.position + "\n Birth: " + dateFormat(new Date(player.dateOfBirth), messageGenerator.client.settings.dateFormat) + "\n From: " + player.countryOfBirth + "",
                            "inline": true
                        });
                    });


                    resolveTeamMessages(matchEmbedJSON);
                });
            });
        });
    }

    /**
     * used to get competition informations from teams
     * promise stack required cause team can has multiple competitions we need informations from
     * @param activeCompetitions
     * @returns {[]}
     */
    getCompetitionFields(activeCompetitions) {
        let messageGenerator = this;
        let promiseStack = [];
        let api = this.client.fdo.api;

        activeCompetitions.forEach(function (comp) {
            promiseStack.push(new Promise((resolveComp, rejectWatcher) => {
                api.getCompetition(comp.id).then((compDetail) => {
                    resolveComp({
                        "name": compDetail.name,
                        "value": messageGenerator.formatDate(compDetail.currentSeason.startDate) + " - " + messageGenerator.formatDate(compDetail.currentSeason.endDate)
                    });
                }).catch(reason => {
                    console.log("api catch", reason.errorMessage);
                    resolveComp({
                        "name": comp.name,
                        "value": "date unknown cause of restricted resource"
                    });
                });
            }));

        });

        return promiseStack;
    }

    /**
     *
     * @param channelID
     * @param timeFrame {String} +1 / -1
     * @param matchStatus
     * @returns {Promise<any>} Resolve array of string messages
     */
    getMatchInfoMessages(channelID, matchStatus = "IN_PLAY", timeFrame = 0) {
        let messageGenerator = this;
        return new Promise((resolveMatchInfoMessages, rejectMatchInfoMessages) => {
            this._getMatches(channelID, matchStatus, timeFrame).then(function (competitionPromises) {
                Promise.all(competitionPromises).then(competitionFixtures => {
                    let messages = [];
                    competitionFixtures.forEach(response => {
                        let competition = response.competition;
                        let messageFields = [];
                        response.fixtures.forEach(function (fixture) {
                            let singleGame = messageGenerator._getMessageFieldFromFixture(fixture);
                            singleGame.value += "`Details: " + messageGenerator.client.settings.prefix + "match " + fixture.id + "`\n\n"
                            messageFields.push(singleGame);
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

    getListMessage(tier) {
        return new Promise((resolve, reject) => {
            let api = this.client.fdo.api;
            let prefix = this.client.settings.prefix;
            if (!tier) {
                tier = "TIER_ONE"
            }

            api.getCompetitions({
                plan: tier
            }).then(function (res) {
                let competitions = "";
                res.competitions.forEach(function (item) {
                    competitions += item.name + " " + "(`" + prefix + "add " + item.id + "`)" + "\n";
                });
                resolve(competitions)
            }).catch(reject);
        });
    }

    getTodayMessages(channelID, timeFrame = 0) {
        let messageGenerator = this;
        return new Promise((resolveTodayMessages, rejectTodayMessages) => {
            this._getMatches(channelID, "ALL", timeFrame).then(function (competitionPromises) {
                Promise.all(competitionPromises).then(competitionFixtures => {
                    let messages = []; //multiple messages allowed
                    competitionFixtures.forEach(response => {
                        let competition = response.competition;
                        let messageFields = [];
                        response.fixtures.forEach(function (fixture) {
                            let singleGame = messageGenerator._getMessageFieldFromFixture(fixture);
                            singleGame.value += "`Details: " + messageGenerator.client.settings.prefix + "match " + fixture.id + "`\n\n"
                            messageFields.push(singleGame);
                        });

                        if (messageFields.length > 0) {
                            let dateFilter = messageGenerator.timeFrameToDate(timeFrame);

                            messages.push({
                                embed: {
                                    color: 3447003,
                                    title: competition.name,
                                    description: messageGenerator.formatDate(new Date(dateFilter.dateFrom), messageGenerator.client.settings.dateFormat),
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
            value: match.status + " - " + this.formatDate(matchDate, this.client.settings.timeFormat) + "\n"
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
    _getMatch(matchID) {
        return new Promise((resolveGetMatch, rejectGetMatch) => {
            let api = this.client.fdo.api;

            if (!!matchID) {
                api.getMatch(matchID).then((response) => {
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
    _getMatches(channelID, runningState = "ALL", timeFrame = 0) {
        let timeFrameObj = this.timeFrameToDate(timeFrame);


        return new Promise((resolveGetMatches, rejectGetMatches) => {
            let api = this.client.fdo.api;
            let storageWorker = this.client.storageWorker;

            storageWorker.getWatcherForChannel(channelID).then(function (watchers) {
                let promiseStack = [];
                watchers.forEach(function (watcher) {
                    promiseStack.push(new Promise((resolveWatcher, rejectWatcher) => {
                        api.getCompetition(watcher.league).then(function (competition) {
                            api.getCompetitionMatches(competition.id, timeFrameObj
                            ).then(function (result) {
                                let retFixtures = [];
                                result.matches.forEach(function (match) {
                                    if (
                                        (runningState === "ALL" || runningState === match.status)
                                    ) {
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

        if (!timeFrame) {
            timeFrame = 0;
        }


        let date = today;
        if (timeFrame.toString().startsWith("+")) {
            let tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + parseInt(timeFrame.replace('+', '')));
            date = tomorrow;
        } else if (timeFrame.toString().startsWith("-")) {
            let today = new Date();
            let yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - parseInt(timeFrame.toString().replace('-', '')));
            date = yesterday;
        }


        //date format is required by api
        let year = date.toLocaleString("en-GB", {year: 'numeric'});
        let month = date.toLocaleString("en-GB", {month: '2-digit'});
        let day = date.toLocaleString("en-GB", {day: '2-digit'});
        let filterDate = year + "-" + month + "-" + day;


        return {
            dateFrom: filterDate,
            dateTo: filterDate
        };
    }


    /**
     * as config option with flexible format
     * @param date
     * @param format
     * @returns {*}
     */
    formatDate(date, format) {
        format = format || this.client.settings.dateFormat;
        return dateFormat(date.toLocaleString(this.client.settings.timezonelang, {timeZone: this.client.settings.timezone}), format)
    }
}

module.exports = {
    MessageGenerator: MessageGenerator
};
