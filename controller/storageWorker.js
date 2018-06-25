class StorageWorker {
    constructor(db){
        this.db = db;
    }

    storeServerInfo(server){
        return new Promise(resolve => {
            this.db.models.DiscordServer.findOrCreate({
                where: {
                    id: server.id
                },
                defaults: {
                    serverName: server.name,
                    region: server.region,
                    memberCount: server.memberCount,
                    ownerID: server.ownerID
                }
            }).spread((discordServer, created) => {
                if (!created){
                    if (discordServer.memberCount !== server.memberCount){
                        discordServer.update({
                            serverName: server.name,
                            region: server.region,
                            memberCount: server.memberCount,
                            ownerID: server.ownerID
                        });
                    }
                }
                resolve();
            });
        })
    }

    getWatcherForChannel(channelId) {
        return new Promise(resolve => {
            this.db.models.Watcher.findAll({
                where: {
                    channelId: channelId
                }
            }).then((watcher) => {
                resolve(watcher);
            })
        });
    }

    addWatcherForServer(league, channel, api){
        return new Promise(resolve => {
            let server = channel.guild;
            this.db.models.Watcher.findOrCreate({
                where: {
                    league: league,
                    channelId: channel.id
                },
                defaults: {
                    serverId: server.id,
                    api: api,
                }
            }).spread((watcher, created) => {
                resolve(created);
            });
        })
    }
}

module.exports = {
    StorageWorker: StorageWorker
};