// Generated by CoffeeScript 1.4.0
(function() {
  var IO, PORT, app, express, fs, http, nib, path, routes, server, stylus;

  express = require("express");

  http = require("http");

  path = require("path");

  fs = require("fs");

  routes = require("./routes");

  stylus = require('stylus');

  nib = require('nib');

  app = express();

  server = http.createServer(app);

  IO = require("socket.io").listen(server);

  PORT = process.env.PORT || 3000;

  app.configure(function() {
    app.set("port", process.env.PORT || PORT);
    app.set("views", "" + __dirname + "/views");
    app.set("view engine", "jade");
    app.use(express.favicon());
    app.use(express.logger("dev"));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(stylus.middleware({
      debug: true,
      src: "" + __dirname + "/stylus",
      dest: "" + __dirname + "/public/css"
    }));
    return app.use(express["static"](path.join(__dirname, "public/")));
  });

  app.configure("development", function() {
    app.use(express.errorHandler({
      dumpExceptions: true,
      showStack: true
    }));
    return app.locals.pretty = true;
  });

  app.configure("production", function() {
    return app.use(express.errorHandler());
  });

  app.get("/", routes.index);

  if (!module.parent) {
    server.listen(app.get("port"), function() {
      return console.log("Express server listening on port " + (app.get("port")));
    });
  }

  IO.configure("development", function() {
    return IO.set("log level", 2);
  });

  IO.configure("production", function() {
    IO.set("transports", ["websocket", "flashsocket", "htmlfile", "xhr-polling", "jsonp-polling"]);
    IO.set("polling duration", 10);
    IO.enable("browser client minification");
    IO.enable("browser client etag");
    IO.enable("browser client gzip");
    return IO.set("log level", 1);
  });

  IO.sockets.on("connection", function(socket) {
    return socket.on("hello", function() {
      return socket.emit("hello-back", {
        data: "the basement"
      });
    });
  });

}).call(this);
