/*var Sequelize = require('sequelize');
var fs = require("fs");
var path = require("path");


var log = process.env.SEQUELIZE_LOGGING ? console.log : false;
var options = {
	host: "checkpoint.czw5vvuqifrc.us-east-1.rds.amazonaws.com",
	timezone: '-02:00',
	dialect: 'mysql',
	logging: log,
	pool: {
		max: 20,
		min: 0,
		evict: 10000,
		idle: 10000
	}
};

// Se houver variável de ambiente do Heroku ou produção...
if (process.env.DATABASE_URL) {
	var sequelize = new Sequelize(process.env.DATABASE_URL, options);
} else {
	var sequelize = new Sequelize("cpwebapp", "checkpoint_adm", "ch3ckpass", options);
}

var db = {};

fs
	.readdirSync(__dirname)
	.filter(function (file) {
		return (file.indexOf(".") !== 0) && (file !== "trendsDB.js");
	})
	.forEach(function (file) {
		var model = sequelize.import(path.join(__dirname, file));
		db[model.name] = model;
	});

Object.keys(db).forEach(function (modelName) {
	if ("associate" in db[modelName]) {
		db[modelName].associate(db);
	}
});

db.db = sequelize;
module.exports = db; */