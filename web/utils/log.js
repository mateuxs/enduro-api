var winston = require('winston');
var commons = require('./utils');

function formatter (args) {
	var data = commons.getDataFormatada(new Date());
	var logMessage = "[" + data + '] ' + args.level + ': ' + args.message;
	return logMessage;
}

var info = new winston.Logger({
	levels: {info: 1},
	transports: [
		new (winston.transports.File)({
			filename: "logs/info.log",
			level: 'info',
			color: 'blue',
			formatter: formatter,
			json: false
		})
	]
});

var warn = new winston.Logger({
	levels: {warn: 2},
	transports: [
		new (winston.transports.File)({
			filename: "logs/warn.log",
			level: 'warn',
			color: 'yellow',
			formatter: formatter,
			json: false
		})
	]
});

var error = new winston.Logger({
	levels: {error: 3},
	transports: [
		new (winston.transports.File)({
			filename: "logs/error.log",
			level: 'error',
			color: 'red',
			formatter: formatter,
			json: false
		})
	]
});

var stringInvalida = new winston.Logger({
	levels: {warn: 2},
	transports: [
		new (winston.transports.File)({
			filename: "logs/stringInvalida.log",
			level: 'warn',
			color: 'yellow',
			formatter: formatter,
			json: false
		})
	]
});

var exports = {
	info: function (msg) {
		var mensagem = "";
		for (var i = 0; i < arguments.length; ++i)
			mensagem = mensagem === "" ? arguments[i] : mensagem + " " + arguments[i];
		
		info.info(mensagem);
	},
	stringInvalida: function (msg) {
		var mensagem = "";
		for (var i = 0; i < arguments.length; ++i)
			mensagem = mensagem === "" ? arguments[i] : mensagem + " " + arguments[i];
		
		stringInvalida.warn(mensagem);
	},
	warn: function (msg) {
		var mensagem = "";
		for (var i = 0; i < arguments.length; ++i)
			mensagem = mensagem === "" ? arguments[i] : mensagem + " " + arguments[i];
		
		warn.warn(mensagem);
	},
	error: function (msg) {
		var mensagem = "";
		for (var i = 0; i < arguments.length; ++i) {
			var valor = arguments[i] instanceof Error ? arguments[i].message + " - " + arguments[i].stack : arguments[i];
			mensagem = mensagem === "" ? valor : mensagem + " " + valor;
		}
		
		error.error(mensagem);
	},
	log: function (level, msg) {
		var lvl = exports[level];
		lvl(msg);
	}
};

module.exports = exports;