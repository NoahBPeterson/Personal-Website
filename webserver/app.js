var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cors = require('cors');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const fs = require("fs");
const { exec	} = require("child_process");


var indexRouter = require('./routes/index');
const { response } = require('express');

var app = express();
var corsOptions = {origin:true}
app.use(cors(corsOptions));
app.disable('etag');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

var counter = 0;
var exampleFiles = [];
fs.readdir('./LoxPrograms', (err, files) => {
	counter = files.length;
});

fs.readdir('./LoxExamplePrograms', (err, files) => {
	exampleFiles = files;
})

app.get('/loxExamples', cors(), function(req, res) {
	res.header('Access-Control-Allow-Origin', '*');
	if(exampleFiles != null)
	{
		var filesModified = [];
		for(var i = 0; i < exampleFiles.length; i++)
		{
			var change = exampleFiles[i].replace(/_/g, " ");
			change = change.replace(/(\.lox)/g, "")
			filesModified.push(change);
		}
		res.send(filesModified).json();	
	}else {
		res.send("");
	}
});

app.post('/loxExamples', cors(), function(req, res) {
	res.header('Access-Control-Allow-Origin', '*');
	const exampleProgram = parseInt(req.body.text);

	fs.readFile('./LoxExamplePrograms/'+exampleFiles[exampleProgram], 'utf8' , (err, data) => {
		if (err) {
			res.json(err);
			return;
		}
		res.json(data);
	});
});



app.post('/loxOutput', cors(), function(req, res) {
	res.header('Access-Control-Allow-Origin', '*');

	var threadSafeCounter = counter++;
	var location = './LoxPrograms/lox'+threadSafeCounter+'.lox';
	var execute = 'Lox '+location+' timeout=5';

	fs.writeFileSync(location, req.body.text, err => {
		if(err) throw err;
	});

	exec(execute, function(err, data, stderr) {
		if(err) {
			res.json(data.toString());
		} else 
			res.json(data.toString());											 
	});
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;
