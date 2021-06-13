const { Command } = require('discord-akairo');

class ListCommand extends Command {
    constructor() {
        super('list', {
            aliases: ['list'],
            args: [
                {
                    id: 'tier',
                    type: 'string'
                }
            ],
            description: {
                content: 'Displays a list of competitions in current year.\nAdd tier parameter to search in access tier',
                usage: '[year]',
                examples: ['TIER_ONE', 'TIER_TWO', 'TIER_THREE', 'TIER_FOUR']
            }
        });
    }

    exec(message, args) {
        let channel = message.channel;
        this.client.messageGenerator.getListMessage(args.tier).then(function(message){
            channel.send(message);
        });
    }
}

module.exports = ListCommand;
