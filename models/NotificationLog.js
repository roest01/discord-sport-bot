'use strict';
module.exports = (sequelize, DataTypes) => {
    let NotificationLog = sequelize.define('NotificationLog', {
        serverId: {
            type: DataTypes.BIGINT(33),
            allowNull: true
        },
        channelId: DataTypes.BIGINT(34),
        notificationText: DataTypes.TEXT,
        identHash: DataTypes.STRING(255)
    }, {});
    NotificationLog.associate = function(models) {
        models.NotificationLog.belongsTo(models.DiscordServer, {foreignKey: 'serverId', targetKey: 'id'});
    };
    return NotificationLog;
};

