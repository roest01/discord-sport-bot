const { Command } = require('discord-akairo');

class LineUpCommand extends Command {
    constructor() {
        super('lineup', {
            aliases: ['lineup'],
            args: [
                {
                    id: 'matchID',
                    type: 'string'
                }
            ],
            description: {
                content: 'Premium command shows LINEUP of a TEAMID or MATCHID'
            }
        });
    }

    exec(message, args) {
        let channel = message.channel;
        message.delete();
        this.client.messageGenerator
            .getLineUpMessage(args.matchID)
            .then(function(message){
                channel.send(message);
            }).catch(reason => {
                channel.send(reason.message);
            });
    }
}

module.exports = LineUpCommand;
