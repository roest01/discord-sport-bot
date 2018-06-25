const { Command } = require('discord-akairo');

class ListCommand extends Command {
    constructor() {
        super('list', {
            aliases: ['list'],
            args: [
                {
                    id: 'season',
                    type: 'string'
                }
            ]
        });
    }

    exec(message, args) {
        let channel = message.channel;
        this.client.messageGenerator.getListMessage(args.season).then(function(message){
            channel.send(message);
        });
    }
}

module.exports = ListCommand;