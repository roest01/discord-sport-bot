'use strict';
module.exports = (sequelize, DataTypes) => {
    let DiscordServer = sequelize.define('DiscordServer', {
        id: {
            allowNull: true,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.BIGINT(32)
        },
        serverName: DataTypes.STRING,
        region: DataTypes.STRING,
        memberCount: DataTypes.BIGINT(32),
        ownerID: DataTypes.BIGINT(32)
    }, {});
    DiscordServer.associate = function(models) {
        models.DiscordServer.hasMany(models.Watcher, {foreignKey: 'serverId', sourceKey: 'id'});
    };
    return DiscordServer;
};