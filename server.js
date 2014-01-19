/*jslint indent:2, node:true*/
/*global require:false*/


(function () {
  "use strict";

  require('coffee-script');
  require('colors');
  var express = require("express");
  var http = require("http");
  var path = require("path");
  var fs = require("fs");
  var routes = require("./routes");
  var mongoose = require("mongoose");
  var app = express();
  var server = http.createServer(app);
  var io = require('./app-socket')(server);
  var PORT = process.env.PORT || 5000;
  var schedule = require('./models/Schedule.js');

  app.configure(function () {
    app.set("port", process.env.PORT || PORT);
    app.set("views", "" + __dirname + "/views");
    app.set("view engine", "jade");
    app.use(express.favicon());
    app.use(express.logger("dev"));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express["static"](path.join(__dirname, "public/")));
  });

  app.configure("development", function () {
    app.use(express.errorHandler({
      dumpExceptions: true,
      showStack: true
    }));
    app.locals.pretty = true;
  });

  app.configure("production", function () {
    return app.use(express.errorHandler());
  });

  app.get("/", routes.index);

  if (!module.parent) {
    server.listen(app.get("port"), function () {
      return console.log(("\n\n==================================================\nExpress server running on: http://localhost:" + (app.get("port")) + "\n==================================================").green);
    });
  }

}).call(this);
