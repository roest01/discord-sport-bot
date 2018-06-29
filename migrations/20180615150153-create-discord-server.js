'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('DiscordServers', {
            id: {
                allowNull: true,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.BIGINT(32)
            },
            serverName: {
                type: Sequelize.STRING
            },
            region: {
                type: Sequelize.STRING
            },
            memberCount: {
                type: Sequelize.BIGINT(32)
            },
            ownerID: {
                type: Sequelize.BIGINT(32)
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('DiscordServers');
    }
};