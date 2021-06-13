const { AkairoClient, CommandHandler } = require('discord-akairo');
const { Database } = require('./controller/database');
const { StorageWorker } = require('./controller/storageWorker');
const { MessageGenerator } = require('./controller/messageGenerator');
const { FootballDataOrg } = require('./controller/footballDataOrg');

class Bot {
    constructor(){
        let bot = this;
        try {
            bot.settings = require("./data/config.json");
            bot.init();
        } catch (e) {
            console.error(e);
            console.error("config.json not found. Please copy data/config.json.example to config.json");
        }
    }

    init(){
        let bot = this;
        bot.client = new AkairoClient({
        }, {
            disableEveryone: true
        });

        bot.client.login(bot.settings.botToken);

        this.commandHandler = new CommandHandler(bot.client, {
            directory: './commands/',
            prefix: this.settings.prefix
        });

        this.commandHandler.loadAll();

        console.log("loadet commands");

        bot.client.settings = this.settings;
        bot.client.fdo = new FootballDataOrg();

        new Database(bot.settings.database).then(function(db){
            bot.client.db = db;

            require('./models').sequelize.sync().then(function(){
                bot.client.storageWorker = new StorageWorker(bot.client.db);
                bot.client.messageGenerator = new MessageGenerator(bot);

                bot.client.login(bot.settings.botToken).then(() => {
                    console.log('Started up!');
                    bot.client.generateInvite().then(link => {
                        console.info("Prefix: " + bot.settings.prefix,link);
                    });
                });
            });
        });
    }
}


class SportBot extends AkairoClient {
    constructor() {
        super({
        }, {
            disableMentions: 'everyone'
        });
    }
}

new Bot();

