const { Command } = require('discord-akairo');

class AddCommand extends Command {
    constructor() {
        super('add', {
            aliases: ['add'],
            args: [
                {
                    id: 'leagueID',
                    type: 'string'
                }
            ],
            userPermissions: ['MANAGE_CHANNELS']
        });
    }

    exec(message, args) {
        if (!!args.leagueID){
            let apiIdent = "fdo";
            let api = this.client[apiIdent].api;
            let storageWorker = this.client.storageWorker;
            storageWorker.storeServerInfo(message.channel.guild);

            api.getCompetition(args.leagueID).then(function(competition) {
                storageWorker
                    .addWatcherForServer(args.leagueID, message.channel, apiIdent)
                    .then(function (created) {
                        if (created){
                            message.channel.send('Okay, will start to send updates within `'+competition.name+'` into channel');
                        } else {
                            message.channel.send('There is already a watcher for `'+competition.name+'` in this channel');
                        }
                    });
            }).catch(function(){
                message.channel.send('Sorry :/ no competition with id `'+args.leagueID+'` found');
            });
            return true;
        }

        return false;
    }
}

module.exports = AddCommand;
