const Sequelize = require('sequelize');

class Database {
    constructor(dbConfig) {
        let db = this;

        return new Promise((resolve, reject) => {
            db.settings = dbConfig;

            db.getModels().then(function(){
                resolve(db);
            });
        });
    }

    getModels(){
        let db = this;
        db.models = require('../models/index');

        return new Promise(function(resolve, reject){
            resolve();
        })
    }
}

module.exports = {
    Database: Database
};