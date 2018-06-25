'use strict';
module.exports = (sequelize, DataTypes) => {
    let Watcher = sequelize.define('Watcher', {
        serverId: {
            type: DataTypes.BIGINT(33),
            allowNull: true
        },
        channelId: DataTypes.BIGINT(34),
        api: DataTypes.STRING,
        league: DataTypes.STRING
    }, {});
    Watcher.associate = function(models) {
        models.Watcher.belongsTo(models.DiscordServer, {foreignKey: 'serverId', targetKey: 'id'});
    };
    return Watcher;
};