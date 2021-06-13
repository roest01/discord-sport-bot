const { Command } = require('discord-akairo');

class HelpCommand extends Command {
    constructor() {
        super('help', {
            aliases: ['help'],
            category: 'default',
            quoted: false,
            args: [
                {
                    id: 'command',
                    type: 'commandAlias',
                    prompt: {
                        start: 'Which command do you need help with?',
                        retry: 'Please provide a valid command.',
                        optional: true
                    }
                }
            ],
            description: {
                content: 'Displays a list of commands or information about a command.',
                usage: '[command]',
                examples: ['', 'star', 'remove-rep']
            }
        });
    }

    exec(message, { command }) {
        if (!command) return this.execCommandList(message);

        const prefix = this.client.settings.prefix;
        const description = Object.assign({
            content: 'No description available.',
            usage: '',
            examples: [],
            fields: []
        }, command.description);

        const embed = this.client.util.embed()
            .setColor(0xFFAC33)
            .setTitle(`\`${prefix}${command.aliases[0]} ${description.usage}\``)
            .addField('Description', description.content);

        for (const field of description.fields) embed.addField(field.name, field.value);

        if (description.examples.length) {
            const text = `${prefix}${command.aliases[0]}`;
            embed.addField('Examples', `\`${text} ${description.examples.join(`\`\n\`${text} `)}\``, true);
        }

        if (command.aliases.length > 1) {
            embed.addField('Aliases', `\`${command.aliases.join('` `')}\``, true);
        }

        return message.channel.send({ embed });
    }

    async execCommandList(message) {
        const embed = this.client.util.embed()
            .setColor(0xFFAC33)
            .addField('Command List',
                [
                    'This is a list of commands.',
                    'To view details for a command, do `'+this.client.settings.prefix+'help <command>`.'
                ]
            );

        for (const category of this.handler.categories.values()) {
            const title = {
                default: '📝\u2000Commands',
            }[category.id];

            if (title) embed.addField(title, `\`${category.map(cmd => cmd.aliases[0]).join('`\n `'+this.client.settings.prefix)+'\n'}\``);
        }

        message.channel.send({ embed });
        return undefined;
    }
}

module.exports = HelpCommand;
