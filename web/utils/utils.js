var fs = require('fs');
var moment = require('moment');
var Excel = require('exceljs');
var pdf = require('html-pdf');
var log = require('./log');

const DATA_HORA_PADRAO = 'DD/MM/YYYY HH:mm:ss';
const TIME_ZONE_PADRAO = 'America/Sao_Paulo';
const EXPORT_LIMIT = Infinity;

exports.getDateToPattern = function (date, toPattern, fromPattern) {
	var m;
	if (typeof fromPattern === "string")
		m = moment(date,  fromPattern);
	else
		m = moment(date);
	
	return m.format(toPattern);
};

exports.getCurrentDateWithMilliseconds = function () {
	return moment().format("YYYY-MM-DD HH:mm:ss:SSS");
};

function getUnixByDatePattern (date, pattern) {
	if (typeof pattern === "string")
		return moment(date, pattern).unix();
	else
		return moment(date).unix();
}

exports.getUnixByDatePattern = getUnixByDatePattern;

exports.getDateFromOnePatternToAnother = function (date, from, to) {
	return moment(date, from).format(to);
};

exports.appendToFileSync = function (file, data, callback) {
	fs.appendFileSync(file, data);
	if (callback)
		callback();
};

var trataErro = function (e, res) {
	var msg = e.message;
	res.status(500).json({message: msg});
};

exports.trataErro = trataErro;

function isTeste (req) {
	var ambiente = req.headers["ambiente"];
	if (typeof ambiente !== 'undefined')
		return ambiente === 'desenv';
	else
		return false;
}

exports.bypassAuthorization = function (req) {return isTeste(req) && process.env.AMBIENTE === "DESENV";};

/**
 * Recebe um número representando um timestamp posix, converte para um timezone e para um padrão
 */
exports.obterDataFormatadaDePosixParaTimezone = function (posix, padrao, timeZone) {
	if (!timeZone)
		timeZone = TIME_ZONE_PADRAO;
	if (!padrao)
		padrao = DATA_HORA_PADRAO;
	
	var data = getDataFromPosixTime(posix, "YYYY-MM-DD HH:mm:ss");
	var utc = moment.utc(data).toDate();
	var local = moment(utc).tz(timeZone).format(padrao);
	
	return local;
};

exports.isDataEmPadrao = function (date, padrao) {
	return moment(date, padrao).format(padrao) === date;
};

exports.getDataAtual = function () {
	var date = moment(new Date(), "DD/MM/YYYY");
	return date;
};

exports.getDataHoraAtual = function () {
	var date = moment(new Date());
	return date;
};

exports.getHoraAtual = function () {
	var date = moment(new Date(), "HH:mm:ss");
	return exports.getDataFormatadaPorPadrao(date, "HH:mm:ss");
};

exports.getSegundosEntreDuasDatas = function (start, end) {
	var duration = moment.duration(end.diff(start));
	var segundos = duration.asSeconds();
	
	return segundos;
};

exports.getHorasEntreDuasDatas = function (start, end) {
	var duration = moment.duration(end.diff(start));
	var segundos = duration.asHours();
	
	return segundos;
};

exports.getDiasEntreDuasDatas = function (start, end) {
	var duration = moment.duration(end.diff(start));
	var segundos = duration.asDays();
	
	return segundos;
};

exports.getHorasEntreDuasHoras = function (start, end, endNextDay, startNextDay) {
	var start = moment("2017-05-01 " + start);
	var end = moment("2017-05-01 " + end);
	
	if (startNextDay === true)
		start.add(1, 'days');
	
	if (endNextDay === true)
		end.add(1, 'days');
	
	var duration = moment.duration(end.diff(start));
	var hours = duration.asHours();
	return hours;
};

exports.getSegundosEntreDoisPosix = function (start, end) {
	return end - start;
};

function getDataFromPosixTime (posix, padrao) {
	var dateString = moment.unix(posix).tz("UTC").format(padrao ? padrao : DATA_HORA_PADRAO);
	return dateString;
};

exports.getDataFromPosixTime = getDataFromPosixTime;

exports.getDataFormatadaPorPadrao = function (d, padrao) {
	var m = moment(d);
	return m.format(padrao);
};

exports.getMomentPorPadrao = function (m, padrao) {
	return moment(m, padrao);
};

exports.parseDataPorPadrao = function (d, padrao) {
	return moment(d, padrao).toDate();
};

exports.getApenasDataFormatada = function (d) {
	var m = moment(d);
	return m.format("DD/MM/YYYY");
};

exports.getApenasDataAtual = function () {
	return moment(new Date(), "DD/MM/YYYY").format("DD/MM/YYYY");
};

exports.getDataFormatada = function (d) {
	var m = moment(d);
	return m.format("DD/MM/YYYY HH:mm:ss");
};

exports.getDateOnlyWithoutTimezone = function (d) {
	if (d) {
		var result = moment(d).format("YYYY-MM-DD HH:mm:ss");
		return result !== "Invalid date" ? result : null;
	} else {
		return null;
	}
};

exports.segundosParaTempo = function (segundos) {
	var time = moment.duration(segundos, "Seconds");
	return formatTime(time.get("Hours")) + ":" + formatTime(time.get("Minutes")) + ":" + formatTime(time.get("Seconds"));
};

exports.getDurationInUnit = function (valor, unit) {
	return moment.duration(valor, unit);
};

function formatTime (num) {
	return num > 9 ? num : "0" + num;
}

exports.formatTime = formatTime;

function getRow (entry, columns, widths) {
	var row = {};
	for (var i = 0; i < columns.length; i++) {
		if (columns[i].cellHandler) {
			var cellHandler;
			eval("cellHandler = " + columns[i].cellHandler);
			row[columns[i].key] = cellHandler ? cellHandler(entry) : null;
		} else {
			row[columns[i].key] = entry[columns[i].key];
		}
		
		// Automatic calculate columns width
		if (!columns[i].width) {
			var size =  row[columns[i].key] ? row[columns[i].key].toString().length + 1 : 0;
			if (widths[columns[i].key] < size)
				widths[columns[i].key] = size;
		}
	}
	
	return row;
}

function createWorkbook () {
	var workbook = new Excel.Workbook();
	workbook.creator = 'MMI';
	workbook.lastModifiedBy = 'MMI';
	workbook.created = new Date();
	workbook.modified = new Date();
	return workbook;
}

function createSheet (wb, name, columns, entries) {
	var sheet = wb ? wb.addWorksheet(name) : null;
	if (sheet) {
		var widths = {};
		columns.forEach(function (c) {
			if (!c.width)
				widths[c.key] = c.header.length + 1;
		});
		
		var rows = [];
		entries.forEach(function (e) {
			rows.push(getRow(e, columns, widths));
		});
		
		columns.forEach(function (c) {
			if (!c.width)
				c.width = widths[c.key] > 5 ? widths[c.key] : 5;
		});
		
		sheet.columns = columns;
		sheet.addRows(rows);
	}
	return sheet;
}

function workbookSendResponse (res, workbook, cb) {
	res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
	res.setHeader('Content-Disposition', 'attachment; filename=Report.xlsx');
	workbook.xlsx.write(res).then(function () {
		res.end();
		if (cb) cb();
	});
}

/**
 * Gera um documento .xlsx (Excel) a partir dos registros
 * @param title <string ou vetor de string> título da(s) planilha(s)
 * @param columns <vetor ou matriz de Coluna> colunas que a(s) planilha(s) deve ter (cabeçalho)
 * @param entries <vetor ou matriz de Registro> registros para preencher a(s) planilha(s)
 * @param res <objeto> resposta da requisição
 * @param cb função chamada após o documento ser gerado (opcional)
 * Coluna = {
 *     header: <string> cabeçalho,
 *     key: <string> chave do registro,
 *     width: <numero> largura da coluna (opcional),
 *     cellHandler: <string> função em forma de string que recebe como parâmetro um Registro e retorna o valor da célula dessa coluna (opcional)
 * }
 * Registro = {
 *     'Coluna.key': valor,
 *     'Coluna.key': valor,
 *     ...
 * }
 */
function createExcel (title, columns, entries, res, cb) {
	var workbook = createWorkbook();
	
	// Verifica se foi recebido uma matriz de colunas ou um vetor de colunas
	if (Object.prototype.toString.call(columns[0]) === '[object Array]') {
		// Verifica a quantidade de registros
		var total = 0;
		for (var i = 0; i < entries.length; i++)
			total += entries[i].length;
		
		if (entries.length <= EXPORT_LIMIT) {
			// Foi recebido uma matriz, logo cria uma planilha para cada vetor de colunas da matriz
			for (var i = 0; i < columns.length; i++)
				createSheet(workbook, title[i], columns[i], entries[i]);
		} else {
			res.status(413).json({mensagem: "Requisição muito grande!"});
			return;
		}
	} else {
		// Verifica a quantidade de registros
		if (entries.length <= EXPORT_LIMIT) {
			// Cria uma única planilha com o vetor de colunas que foi recebido
			createSheet(workbook, title, columns, entries);
		} else {
			res.status(413).json({mensagem: "Requisição muito grande!"});
			return;
		}
	}
	
	workbookSendResponse(res, workbook, cb);
}

exports.createExcel = createExcel;

/**
 * Rota de download de arquivos Excel
 * @query_param colunas
 * @query_param registros
 * @query_param titulo
 */
exports.downloadExcel = function (req, res) {
	var params = req.body;
	var title;
	try {
		title = JSON.parse(params.titulo);
	} catch (error) {
		title = params.titulo;
	}
	
	createExcel(title, JSON.parse(params.colunas), JSON.parse(params.registros), res);
};

function getCeil (entry, column) {
	if (column.cellHandler) {
		var cellHandler;
		eval("cellHandler = " + column.cellHandler);
		return cellHandler ? cellHandler(entry) : null;
	}
	return entry[column.key];
}

function createTable (title, columns, entries, individualCharts) {
	var header = "<tr>";
	columns.forEach(function (c) {
		header += "<th>" + c.header + "</th>";
	});
	header += "</tr>";
	
	var rows = "";
	entries.forEach(function (e) {
		rows += "<tr>";
		columns.forEach(function (c) {
			rows += "<td>" + getCeil(e, c) + "</td>";
		});
		rows += "</tr>";
	});
	
	var chart = "";
	var numCharts = 0;
	if (individualCharts) {
		chart = "<div class='row'>";
		for (var i = 0; i < individualCharts.length; i++) {
			if (individualCharts[i].association.firstCeil === getCeil(entries[0], individualCharts[i].association.column)) {
				chart += "<img src='" + individualCharts[i].chart.url +
						 "' style='width: " + (individualCharts[i].chart.width / 1.6) +
						 "px; height: " + (individualCharts[i].chart.height / 1.6) + "px;' />";
				numCharts++;
			}
		}
		if (numCharts === 1)
			chart += "<div>";
	}
	
	return chart + "<table><thead><tr><th colspan='" + columns.length + "'>" + title + "</th></tr>" + header + "</thead><tbody>" + rows + "</tbody></table>" + (individualCharts ? "</div>" + (numCharts === 1 ? "</div>" : "") : "") + "<br/>";
}

/**
 * Gera um documento .pdf a partir dos registros
 * @param titles <string ou vetor de string> título da(s) tabela(s)
 * @param columns <vetor ou matriz de Coluna> colunas que a(s) planilha(s) deve ter (cabeçalho)
 * @param entries <vetor ou matriz de Registro> registros para preencher a(s) planilha(s)
 * @param comparativeCharts <Grafico ou vetor de Grafico> imagem do(s) gráfico(s) comparativo(s) para o relatório convertida(s) para base64
 * @param individualCharts <GraficoIndividual ou vetor de GraficoIndividual> imagem do(s) gráfico(s) individual(is) para o relatório convertida(s) para base64
 * @param res <objeto> resposta da requisição
 * @param cb função chamada após o documento ser gerado (opcional)
 * Coluna = {
 *     header: <string> cabeçalho,
 *     key: <string> chave do registro,
 *     width: <numero> largura da coluna (opcional),
 *     cellHandler: <string> função em forma de string que recebe como parâmetro um Registro e retorna o valor da célula dessa coluna (opcional)
 * }
 * Registro = {
 *     'Coluna.key': valor,
 *     'Coluna.key': valor,
 *     ...
 * }
 * Grafico = {
 *     url: <string> imagem do gráfico em base64,
 *     width: <numero> largura da imagem,
 *     height: <numero> altura da imagem
 * }
 * GraficoIndividual = {
 *     association: <Associação> utilizado para associar o gráfico individual a uma tabela (caso não seja informado o gráfico não será associado),
 *     chart: <Grafico> o gráfico propriamente dito
 *     title: <string> nome da máquina associada a esse gráfico (utilizado apenas quando a propriedade association não for especificada)
 * }
 * Associação = {
 *     column: <Coluna> uma coluna da tabela a qual esse gráfico deve ser associado,
 *     firstCeil: <string> valor da célula formada pela coluna especificada e a primeira linha da tabela
 * }
 */
function createPDF (titles, columns, entries, comparativeCharts, individualCharts, landscape, res, cb) {
	fs.readFile("./relatorios/templates/consultas.html", "utf-8", function (error, html) {
		if (error) {
			log.error("***ERRO*** ", error);
			res.status(500).json(error);
		} else {
			var tables = "";
			if (columns && entries) {
				// Verifica se foi recebido uma matriz de colunas ou um vetor de colunas
				if (Object.prototype.toString.call(columns[0]) === '[object Array]') {
					// Verifica a quantidade de registros
					var total = 0;
					for (var i = 0; i < entries.length; i++)
						total += entries[i].length;
					
					if (entries.length <= EXPORT_LIMIT) {
						// Foi recebido uma matriz, logo cria uma tabela para cada vetor de colunas da matriz
						for (var i = 0; i < columns.length; i++)
							tables += createTable(titles[i], columns[i], entries[i], individualCharts);
					} else {
						res.status(413).json({mensagem: "Requisição muito grande!"});
						return;
					}
				} else {
					// Verifica a quantidade de registros
					if (entries.length <= EXPORT_LIMIT) {
						// Cria uma única tabela com o vetor de colunas que foi recebido
						tables += createTable(titles, columns, entries, individualCharts);
					} else {
						res.status(413).json({mensagem: "Requisição muito grande!"});
						return;
					}
				}
			}
			
			var comparativeGraphics = "";
			if (comparativeCharts) {
				comparativeGraphics = "<div id='graphics'>";
				
				if (Object.prototype.toString.call(comparativeCharts) === '[object Array]') {
					comparativeCharts.forEach(function (g) {
						comparativeGraphics += (g.title ? "<h2>" + g.title + "</h2>" : "") + "<img src='" + g.url + "' style='width: " + (g.width / 1.5) + "px; height: " + (g.height / 1.5) + "px;' />";
					});
				} else {
					comparativeGraphics += (comparativeCharts.title ? "<h2>" + comparativeCharts.title + "</h2>" : "") +
										   "<img src='" + comparativeCharts.url +
										   "' style='width: " + (comparativeCharts.width / 1.5) +
										   "px; height: " + (comparativeCharts.height / 1.5) + "px;' />";
				}
				
				comparativeGraphics += "</div>";
			}
			
			var individualGraphicsNotAssociated = "";
			if (individualCharts) {
				for (var i = 0; i < individualCharts.length; i++) {
					if (!individualCharts[i].association) {
						individualGraphicsNotAssociated += "<div class='row'><img src='" + individualCharts[i].chart.url +
														   "' style='margin-right: 0; width: " + (individualCharts[i].chart.width / 1.6) +
														   "px; height: " + (individualCharts[i].chart.height / 1.6) + "px;' /><h2>" + individualCharts[i].title + "</h2></div>";
					}
				}
			}
			
			html = html.replace(/{{ MMI_HOST }}/g, process.env.MMI_HOST);
			html = html.replace(/{{ comparativeGraphics }}/g, comparativeGraphics);
			html = html.replace(/{{ individualGraphicsNotAssociated }}/g, individualGraphicsNotAssociated);
			html = html.replace(/{{ tables }}/g, tables);
			
			var options = {
				format: "A4",
				orientation: landscape ? "landscape" : "portrait",
				border: {
					top: "1.25cm",
					right: "1cm",
					bottom: "0.75cm",
					left: "1cm"
				},
				footer: {
					height: "10mm",
					contents: {
						default: '<span style="color: #444; font-size: 8px"><span>Criado em ' + exports.getDataAtual().format("DD/MM/YYYY HH:mm:ss") + '</span><span style="float: right">{{page}}/{{pages}}</span></span>'
					}
				}
			};
			
			pdf.create(html, options).toBuffer(function (err, buffer) {
				res.setHeader('Content-Type', 'application/pdf');
				res.setHeader('Content-Disposition', 'attachment; filename=' + 'Report.pdf');
				res.end(buffer);
				if (cb) cb();
			});
		}
	});
}

exports.createPDF = createPDF;

/**
 * Rota de download de arquivos PDF
 * @query_param titulo
 * @query_param colunas
 * @query_param registros
 * @query_param graficosComparativos
 * @query_param graficosIndividuais
 * @query_param landscape
 */
exports.downloadPDF = function (req, res) {
	var params = req.body;
	var title, colunas, registros, graficosComparativos, graficosIndividuais;
	
	try {
		title = JSON.parse(params.titulo);
	} catch (error) {
		title = params.titulo;
	}
	
	try {
		colunas = JSON.parse(params.colunas);
	} catch (error) {
		colunas = params.colunas;
	}
	
	try {
		registros = JSON.parse(params.registros);
	} catch (error) {
		registros = params.registros;
	}
	
	try {
		graficosComparativos = JSON.parse(params.graficosComparativos);
	} catch (error) {
		graficosComparativos = params.graficosComparativos ? params.graficosComparativos : "";
	}
	
	try {
		graficosIndividuais = JSON.parse(params.graficosIndividuais);
	} catch (error) {
		graficosIndividuais = params.graficosComparativos ? params.graficosIndividuais : "";
	}
	
	createPDF(title, colunas, registros, graficosComparativos, graficosIndividuais, params.landscape, res);
};

/**
 * Valida as datas de início e fim, e o vetor de variáveis recebidos pela requisição
 * @param req: objeto de requisição
 * @param res: objeto de resposta
 * @returns {boolean} false (caso de erro) | {Array<number>} vetor com as ids das variáveis (caso de sucesso)
 */
exports.validateFormDatesAndVars = function (req, res) {
	var i, f, result;
	try {
		i = getUnixByDatePattern(req.query.inicio, "DD/MM/YYYY HH:mm:ss");
		f = getUnixByDatePattern(req.query.fim, "DD/MM/YYYY HH:mm:ss");
		if (isNaN(i) || isNaN(f))
			throw new Error("Not A Number");
	} catch (error) {
		log.error("***ERRO*** ", error);
		console.log("***ERRO*** ", error);
		res.status(400).json({message: "Data inicial e/ou final inválida(s)!"});
		return false;
	}
	
	if (i > f) {
		res.status(400).json({message: "A data inicial deve ser anterior a final!"});
		return false;
	} else if (!req.query.variaveis || (result = req.query.variaveis.split(",")).length === 0) {
		res.status(400).json({message: "Vetor de variáveis inválido!"});
		return false;
	}
	
	return result.map(function (item) {
		return parseInt(item);
	});
};
