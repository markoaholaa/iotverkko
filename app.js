require('dotenv').config();
const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const flash = require('connect-flash');
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
global.io = new Server(server);
const path = require('path');
const db = require('./db/connect');
const router = require('./router/router');
const mqttClient = require('./mqtt');
const ioClient = require('./io');
const findInactive = require('./methods/findInactiveDevices');

app.use(session({
	resave: false,
	saveUninitialized: false,
	secret: process.env.SECRET
}));

app.use(fileUpload());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const User = require('./db/models/user');

app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());

app.use(function (req, res, next) {
	res.locals.message = req.flash('message');
	res.locals.error = req.flash('error');
	res.locals.user = req.user;
	next();
});

app.use('/static', express.static(path.join(__dirname, '/static')));
app.use(router);
app.set('view engine', 'ejs');

server.listen(3000, () => {
	console.log('listening on *:3000');
});

findInactive();