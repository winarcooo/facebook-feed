const express         = require('express')
  , passport          = require('passport')
  , FacebookStrategy  = require('passport-facebook').Strategy
  , session           = require('express-session')
  , cookieParser      = require('cookie-parser')
  , bodyParser        = require('body-parser')
  , config            = require('../configuration/config')
  , request           = require('request-promise')
  , app               = express();

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new FacebookStrategy({
  clientID: config.facebook_api_key,
  clientSecret:config.facebook_api_secret,
  callbackURL: config.callback_url
},
function(accessToken, refreshToken, profile, done) {
  session.access_token = accessToken;
  process.nextTick(function () {
    return done(null, profile);
  });
}));

app.set('views', './views');
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'keyboard cat',
  key: 'sid',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/feed',ensureAuthenticated, (req, res) => {
  const fieldSet = 'name, caption, description, is_popular, created_time';
  const options = {
    method: 'GET',
    uri: `https://graph.facebook.com/v3.3/me/feed`,
    qs: {
      access_token: session.access_token,
      fields: fieldSet,
      limit: '3'
    }
  };
  request(options)
    .then(fbResponse => {
      res.send(fbResponse)
    })
});

app.get('/auth/facebook', passport.authenticate('facebook',{scope:'email'}));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect : '/feed', failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/')
}

module.exports = app.listen(process.env.PORT);
