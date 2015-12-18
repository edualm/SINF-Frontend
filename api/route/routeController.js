var Route = require('./routeModel');
var _ = require('lodash');

exports.put = function(req, res, next) {

}

exports.paramId = function(req, res, next, id) {
  Route.findById(id)
    .exec()
    .then(function(route) {
      if (!route) {
        next(new Error('No user with that id'));
      } else {
        req.IdedRoute = route;
        next();
      }
    }, function(err) {
      next(err);
    });
};

exports.put = function(req, res, next) {
  var route = req.IdedRoute;

  var item = req.body.item;
  var picked = req.body.picked;

  if (item != undefined && picked != undefined) {
    // i know, looks dirty, it is! Damn js!
    if (picked.toLowerCase() == "true") {
      picked = true;
    } else {
      picked = false;
    }
    for (var i = 0; i < route.objects.length; i++) {
      if (route.objects[i].item == item) {
        route.objects[i].picked = picked;
        route.markModified("objects");
        route.save(function(err, saved) {
          if (err) {
            next(err);
          } else {
            res.json(saved);
          }
        });
        break;      
      }
    }
  }
};

exports.getOne = function(req, res, next) {
  res.json(req.IdedRoute);
};
