var Database = require('../persistence/mongo');
var db = new Database();
var isJson = require('../utils/common').isJson;
var model = require('../models');
var authCheck = require('../auth/basic');
var getAuthInfo = require('./utils/getAuth');

module.exports = function (app) {
  'use strict';
  app.get(/^\/topics\/(.+)$/, function (req, res) {
    if (!req.headers.authorization) {
      res.statusCode = 401;
      res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
      return res.end('Unauthorized');
    }

    var userInfo = getAuthInfo(req);

    var errorCB = function () {
      res.sendStatus(403);
    };

    var successCB = function (user) {
      var options = {name: userInfo.name, token: user.uid};
      db.query(options, function (dbResult) {
        return res.json({username: userInfo.name, topic: dbResult});
      });
    };

    authCheck(userInfo, errorCB, successCB, errorCB);
  });

  function update(req, res) {
    if (!req.headers.authorization) {
      return res.sendStatus(403);
    }
    var userInfo = getAuthInfo(req);

    var errorCB = function () {
      res.sendStatus(403);
    };

    var successCB = function (user) {
      var payload = {name: user.name, token: user.uid, data: req.body};
      db.insert(payload);
      res.sendStatus(204);
    };

    authCheck(userInfo, errorCB, successCB, errorCB);
  }

  app.post(/^\/topics\/(.+)$/, function (req, res) {
    return update(req, res);
  });

  return app.put(/^\/topics\/(.+)$/, function (req, res) {
    return update(req, res);
  });
};
