const passport = require('koa-passport');
const bcrypt = require('bcrypt');
const session = require('koa-session');
const LocalStrategy = require('passport-local').Strategy;
const { User } = require('./routes/api');

module.exports = (app) => {
  app.keys = [process.env.INV360_SESSION_SECRET];

  app.use(session({
    key: 'inv360:sess',
  }, app));

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser(function(user, done) {
    done(null, user.id)
  });

  passport.deserializeUser(async function(id, done) {
    try {
      const user = await User.findById(id);
      done(null, user)
    } catch(err) {
      done(err)
    }
  });

  passport.use(new LocalStrategy(
    async (username, password, done) => {
      try {
        const user = await User.findOne({ where: { email: username, password: password }});
        if (!user) {
          
          return done(null, false, { message: 'Incorrect email.' });
        }

        // NOTE - password is being stored as plaintext so it can be viewed in admin UI
        // const passwordValid = await bcrypt.compare(password, user.password);
        //
        // if (!passwordValid) {
        //   return done(null, false, { message: 'Incorrect password.' });
        // }

        return done(null, user);
      }
      catch(err) {
        return done(err);
      }
    }
  ));

  return passport;
}
