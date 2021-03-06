const { Command } = require('discord-akairo');

class TodayCommand extends Command {
    constructor() {
        super('today', {
            aliases: ['today']
        });
    }

    exec(message, args) {
        let channel = message.channel;
        message.delete();
        this.client.messageGenerator
            .getTodayMessages(channel.id)
            .then(function(messages){
                messages.forEach(message => {
                    channel.send(message);
                });
            }).catch((reason => {
                channel.send('Sorry there was an error with your request');
                console.error(reason);
            }
        ));
    }
}

module.exports = TodayCommand;