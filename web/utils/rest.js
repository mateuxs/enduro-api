exports.getDefaultUpsert = function (model, trataResultado) {
	return function (req, res) {
		var params = req.body;
		if (!params.ID && !params.id) {
			// Inserção
			model.create(params).then(function (ret) {
				res.json(ret);
			}).catch(function (e) {
				trataErro(e, res);
			});
		} else {
			// Atualização
			model.upsert(params).then(function (ret) {
				if (trataResultado)
					ret = trataResultado(params, req);
				
				res.json(params);
			}).catch(function (e) {
				trataErro(e, res);
			});
		}
	};
};

exports.getDefaultGet = function (model, order, include, trataResultado) {
	return function (req, res) {
		var param = req.query.id ? {where: {id: req.query.id}} : {where: {}};
		param = req.query.wh ? {where: JSON.parse(req.query.wh)} : param;
		if (order)
			param.order = order;
		if (include)
			param.include = include;
		if (req.query.limit)
			param.limit = req.query.limit;
		
		model.findAll(param).then(function (ret) {
			if (trataResultado)
				ret = trataResultado(ret);
			
			res.json(ret);
		}).catch(function (e) {
			trataErro(e, res);
		});
	};
};

var trataErro = function (e, res) {
	var msg = e;
	if (typeof e === "object") {
		msg = e.message;
		console.log(msg);
		console.log(e.stack);
	}
	
	res.status(500).json({message: msg});
};

exports.trataErro = trataErro;