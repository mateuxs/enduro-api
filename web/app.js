require('console-stamp')(console, '[HH:MM:ss.l]');

var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var configRouter = require('./routes/routes');
var app = express();
var router = express.Router();


app.set('port', (process.env.PORT || 3000));

app.use('/api', router);
app.use(express.static('./frontend'));

router.use(bodyParser.json({limit: '10mb'}));

configRouter.configura(router);

// Configura diretórios de logs
if (!fs.existsSync("logs"))
	fs.mkdirSync("logs");

app.listen(app.get('port'), function () {
	console.log('Node app is running on port', app.get('port'));
});