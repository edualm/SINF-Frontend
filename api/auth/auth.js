var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var config = require('../../config/config');
var checkJwt = expressJwt({ secret: config.secrets.jwt });
var User = require('../user/userModel');

exports.decodeToken = function() {
  return function(req, res, next) {
    if (req.query && req.query.hasOwnProperty('access_token')) {
      req.headers.authorization = 'Bearer ' + req.query.access_token;
    } else if (req.params && req.params.hasOwnProperty('access_token')) {
      req.headers.authorization = 'Bearer ' + req.params.access_token;
    }
    // this will call next if token is valid
    // and send error 401 if its not. It will attach
    // the decoded token to req.user
    checkJwt(req, res, next);
  };
};

exports.checkToken = function() {
  return function(req, res, next) {
    // look for a token in cookies
    if (Object.getOwnPropertyNames(req.cookies).length > 0 && req.cookies.hasOwnProperty('access_token')) {
      req.headers.authorization = 'Bearer ' + req.cookies.access_token;
    } else {
      console.log("no cookie");
      //next(new Error("error").status(401));
      //next(e);
      //res.status(401).send('Unauthorized');
    }
    // check token. If invalid, send 401
    try {
      checkJwt(req, res, next);
    } catch(e) {
      res.status(401).send('Unauthorized');
    }
  }
}

exports.getFreshUser = function() {
  return function(req, res, next) {
    User.findById(req.user._id)
      .then(function(user) {
        if (!user) {
          // valid JWT but didn't decode
          // to a real user in our DB. Either the user was deleted
          // since the client got the JWT, or
          // it was a JWT from some other source
          res.status(401).send('Unauthorized');
        } else {
          // update req.user with fresh user from
          // stale token data
          req.user = user;
          next();
        }
      }, function(err) {
        next(err);
      });
  }
};

exports.verifyUser = function() {
  return function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    // if no username or password then send err
    if (!username || !password) {
      res.status(400).send('You need a username and password');
      return;
    }

    // look user up in the DB so we can check
    // if password match the username
    User.findOne({username: username})
      .then(function(user) {
        if (!user) {
          res.status(401).send('No user with the given username');
        } else {
          if (!user.authenticate(password)) {
            res.status(401).send('Wrong password');
          } else {
            // if everything is good,
            // then attach to req.user
            // and call next so the controller
            // can sign a token from the req.user._id
            req.user = user;
            next();
          }
        }
      }, function(err) {
        next(err);
      });
  };

};

// util method to sign tokens on signup
exports.signToken = function(id, level) {
  return jwt.sign(
    {_id: id, level: level},
    config.secrets.jwt,
    {expiresIn: config.expireTime}
  );
};
