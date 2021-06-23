const { Command } = require('discord-akairo');

class GoalsCommand extends Command {
    constructor() {
        super('goals', {
            aliases: ['goals'],
            args: [
                {
                    id: 'matchID',
                    type: 'string'
                }
            ],
            description: {
                content: 'Premium command shows GOALS of a TEAMID or MATCHID'
            }
        });
    }

    exec(message, args) {
        let channel = message.channel;
        this.client.messageGenerator
            .getGoalsMessage(args.matchID)
            .then(function(message){
                channel.send(message);
            }).catch(reason => {
                channel.send(reason.message);
            });
    }
}

module.exports = GoalsCommand;
