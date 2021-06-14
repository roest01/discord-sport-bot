const { Command } = require('discord-akairo');

class TeamInfoCommand extends Command {
    constructor() {
        super('team', {
            aliases: ['team'],
            args: [
                {
                    id: 'teamID',
                    type: 'string'
                }
            ]
        });
    }

    exec(message, args) {
        let channel = message.channel;
        //message.delete();
        this.client.messageGenerator
            .getTeamMessage(args.teamID)
            .then(function(message){
                channel.send(message);
            }).catch(reason => {
                channel.send(reason.message);
            });
    }
}

module.exports = TeamInfoCommand;
