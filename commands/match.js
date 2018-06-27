const { Command } = require('discord-akairo');

class MatchInfoCommand extends Command {
    constructor() {
        super('match', {
            aliases: ['match'],
            args: [
                {
                    id: 'matchID',
                    type: 'string'
                }
            ]
        });
    }

    exec(message, args) {
        let channel = message.channel;
        message.delete();
        this.client.messageGenerator
            .getMatchMessage(args.matchID)
            .then(function(message){
                channel.send(message);
            }).catch(reason => {
                channel.send(reason.message);
            });
    }
}

module.exports = MatchInfoCommand;