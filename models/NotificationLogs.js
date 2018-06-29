'use strict';
module.exports = (sequelize, DataTypes) => {
    let NotificationLogs = sequelize.define('NotificationLogs', {
        serverId: {
            type: DataTypes.BIGINT(33),
            allowNull: true
        },
        channelId: DataTypes.BIGINT(34),
        notificationText: DataTypes.TEXT,
        identHash: DataTypes.STRING(255)
    }, {});
    NotificationLogs.associate = function(models) {
        models.NotificationLogs.belongsTo(models.DiscordServer, {foreignKey: 'serverId', targetKey: 'id'});
    };
    return NotificationLogs;
};

