//var models = require('../models/trendsDB');
var utils = require('../utils/utils');
var getDefaultGet = require('../utils/rest').getDefaultGet;
var getDefaultUpsert = require('../utils/rest').getDefaultUpsert;	


//exports.get = getDefaultGet(models.Medicao, '"id" ASC');
//exports.upsert = getDefaultUpsert(models.Medicao);

function obterDados (req, res) {
	//var inicio = utils.getDateFromOnePatternToAnother(i, "DD/MM/YYYY HH:mm:ss", "YYYY-MM-DD HH:mm:ss");
//	var fim = utils.getDateFromOnePatternToAnother(f, "DD/MM/YYYY HH:mm:ss", "YYYY-MM-DD HH:mm:ss");

/*	models.enduro.findAll({
		where: {
			datahora: {
				$gte: inicio,
				$lte: fim
			}
		}
	}).then(function (medicoes) {
		res.status(200).json(medicoes);
	});*/

	var dados = {
		"versao": "vbeta",
		"nome": "Enduro à pé",
		"tempo": "12:32",
		"iniciou": "true",
		"acabou": "false",
		"equipes": [
			{
				"id": "1",
				"nome": "alface",
				"checkpoints": "4",
				"pontos": "22"
			},
			{
				"id": "2",
				"nome": "pomba",
				"checkpoints": "4",
				"pontos": "28"
			},
			{
				"id": "3",
				"nome": "curucucus",
				"checkpoints": "3",
				"pontos": "22"
			},
			{
				"id": "4",
				"nome": "info",
				"checkpoints": "7",
				"pontos": "20"
			}
		]
	};
	res.status(200).json(dados);
}

exports.obterDados = obterDados;
