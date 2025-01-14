const models = require('../models');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

const passport = require('passport');
const Local = require('passport-local').Strategy;

passport.use(new Local(
	{
		usernameField: 'user_name',
		passwordField: 'password',
		passReqToCallback: true,
		session: true,
	}, (req, user_name, password, done) => {
		//console.log('user_name', user_name);
		//console.log('password', password);
		//console.log('done', done);

		process.nextTick(() => {
			auth_user(user_name, password).then(() => {
				return done(null, {
					user_name: user_name
				});
			}).catch(() => {
				console.log('login error');
				return done(null, false, {
					message: 'fail'
				});
			});
		});
	}));

passport.serializeUser((user, done) => {
	//console.log('serialize:', user);
	done(null, user);
});

passport.deserializeUser((user, done) => {
	//console.log('deserialize:', user);
	done(null, user);
});

/* GET users listing. */
/*
router.get('/login', (req, res, next) => {
	res.render('login', { title: 'Login',
						  msg_type: '',
						  message: '',
						});
});
*/

function is_authenticated(req, res, next) {
	console.log(req.session);

	if ( req.isAuthenticated() ) {
		return (next());
	} else {
		res.redirect('/manage');
		//return (next());
	}
}

function auth_user(name, password) {
	return new Promise((done, fail) => {
		try {
			models.User.findOne({
				where: {
					name: name
				}
			}).then((user) => {
				//console.log(user);
				if ( user ) {
					if  (( password ) &&
						 ( bcrypt.compareSync(password, user.hash_password) )) {
						console.log("auth ok");
						this.user = user;
						done(user);
					} else {
						console.log("auth fail");
						fail(user);
					}
				} else {
					console.log("user none");
					fail(null);
				}
			});
		} catch (e) {
			fail(null);
		}
	});
}

class User {
	constructor (name, user_info) {
		if ( !user_info ) {
			user_info = {
				name: name
			}
		}
		Object.keys(user_info).forEach((key) => {
			this[key] = user_info[key];
		});
	}
	static auth(name, password)	{
		return	auth_user(name, password);
	}
	static get(name) {
		return models.User.findOne({
				where: {
					name: name
				}
			});
	}
	static current(req) {
		let user;
		if (( req.session ) &&
			( req.session.passport )) {
			user = req.session.passport.user.user_name;
		} else {
			user = null;
		}
		return (user);
	}
	create() {
		return new Promise((done, fail) => {
			models.User.create({
				name: this.name,
				hash_password: this.hash_password
			}).then((user) => {
				console.log(user);
				this.user = user;
				done(user);
			}).catch((err) => {
				console.log(err);
			});
		});
	}
	save()	{
		console.log('save', this.user);
		return new Promise((done, fail) => {
			if	( this.user )	{
				this.user.save().then((user) => {
					console.log(user);
					done(user);
				}).catch((err) => {
					console.log(err);
				});
			}
		});
	}
	set password(p) {
		if	( p )
			this.hash_password = bcrypt.hashSync(p, SALT_ROUNDS);
	}
	get password() {
		return (this.hash_password);
	}
	static check(name) {
		return	models.User.findOne({
			where: {
				name: name },
		});
	}
}

module.exports = {
    Passport: passport,
	is_authenticated: is_authenticated,
	auth_user: auth_user,
	User: User,
};
