var db = require('../models/trendsDB').db;
var utils = require('./utils');

exports.limpaBanco = function (res) {
	if (process.env.AMBIENTE !== "DESENV")
		return;
	
	var tabelas = ["medicao"];
	
	// Desabilitar constraints.
	var sql = "ALTER TABLE \"";
	sql += tabelas.join("\" DISABLE TRIGGER ALL; \nALTER TABLE \"");
	
	// Deletar registros.
	sql += "\" DISABLE TRIGGER ALL; DELETE FROM \"";
	sql += tabelas.join("\"; \nDELETE FROM \"");
	
	// Habilitar constraints.
	sql += "\"; ALTER TABLE \"";
	sql += tabelas.join("\" ENABLE TRIGGER ALL; \nALTER TABLE \"");
	sql += "\" ENABLE TRIGGER ALL; COMMIT;";
	db.query(sql).spread(function (results, metadata) {
		if (res)
			res.json(results);
	}).catch(function (e) {
		utils.trataErro(e, res);
	});
};