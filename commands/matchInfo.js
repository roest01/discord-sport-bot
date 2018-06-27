const { Command } = require('discord-akairo');

class MatchInfoCommand extends Command {
    constructor() {
        super('matchInfo', {
            aliases: ['matchInfo'],
            args: [
                {
                    id: 'status',
                    type: 'string'
                },
                {
                    id: 'timeFrame',
                    type: 'integer'
                }
            ]
        });
    }

    exec(message, args) {
        let channel = message.channel;
        let params = [channel.id, args.status, args.timeFrame].filter((val) => { if (!!val || val === 0){return true;} });
        let client = this.client;
        client.messageGenerator
            .getMatchInfoMessages(...params)
            .then(function(response){
                if (response.messages.length > 0){
                    response.messages.forEach(message => {
                        channel.send(message);
                    });
                } else {
                    let dateInfo = client.messageGenerator.timeFrameToDate(response.info.timeFrame);
                    channel.send('Sorry no result found for `'+response.info.status+"` at `"+dateInfo.requestedDate.toLocaleDateString('de-DE')+"` \n Try to use `>matchInfo [TIMED, FINISHED]`");
                }
            }).catch(reason => {
                console.error(reason);
                channel.send(reason.message);
            });
    }
}

module.exports = MatchInfoCommand;