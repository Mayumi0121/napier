const express = require('express');
const app = express();
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const passport = require('passport');
const multipart = require('connect-multiparty');
const cors = require('cors');
const sprightly = require('sprightly');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const {User, is_authenticated} = require('../libs/user');

global.env = require('../config/server');

const homeRouter = require('./routes/home');
const apiRouter = require('./routes/api');


app.use(logger('dev'));		//	アクセスログを見たい時には有効にする
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({
	origin: ['*']
}));
app.use(multipart());

app.use(session({
	secret: 'napier',
	resave: true,
	saveUninitialized: false,
	name: 'napier',						//	ここの名前は起動するnode.js毎にユニークにする
	store: new FileStore({
		ttl: global.env.session_ttl,	//	default 3600(s)
		reapInterval: global.env.session_ttl,
		path: global.env.session_path	//	default path
	}),

	cookie: {
		httpOnly: true,
		secure: false,
		maxage: null
	}
}));
app.use(passport.initialize());
app.use(passport.session());


app.engine('spy', sprightly);
app.set('views', './web/views');
app.set('view engine', 'spy');

console.log('/public', (path.join(__dirname, './public')));

app.use('/dist', express.static(path.join(__dirname, './dist')));
app.use('/style', express.static(path.join(__dirname, './front/stylesheets')));
app.use('/public', express.static(path.join(__dirname, './public')));

app.use('/api', apiRouter);

app.use('/', homeRouter);

module.exports = app;
