var utils = require('../utils/utils');
var dadosApi = require ('./dados');
var appendToFileSync = require('../utils/utils').appendToFileSync;
var moment = require('moment');

exports.configura = function (router) {
	var rotas = [
	];    
	
	// Configuração padrão (CRUD) para todas as rotas!
	// TODO: verificar se esses CRUDs estarão disponíveis na versão final ou apenas durante o desenvolvimento
	rotas.forEach(function (rota) {
		router.get(rota.url, function (req, res) {
			rota.api.get(req, res);
		});
		
		router.post(rota.url + '/:ID?', function (req, res) {
			rota.api.upsert(req, res);
		});
	});
	
	router.get('/', function (req, res) {
		res.json({message: 'Enduro'});
	});

	router.get('/vbeta/dados', function (req, res) {
		dadosApi.obterDados(req, res);
	});
	
};