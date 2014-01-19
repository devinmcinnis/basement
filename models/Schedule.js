/*jslint indent:2, node:true, nomen:true, unparam: true */
/*global require:false */

(function () {
  "use strict";

  var SCHEDULE = {};
  var leagues = ['nfl'];
  var scheduleDigger = require('../modules/ScheduleDigger');
  var StreamsDigger = require('../modules/StreamsDigger');
  var abbrs = require('../modules/TeamAbbr');

  var formatSchedule = function(league, json){
    var games = {}, dateNow = Date.now(), dateString, dateStringId, gId, game, gameDate, gameTime, mNum, minDiff, months, newGame, time, json, _i, _len, streamGame;

    // Only months left in this NFL season
    months = ['January', 'February'];

    for (_i = 0, _len = json.length; _i < _len; _i++) {
      game = json[_i];

      // Convert time to UTC
      gameTime = game.kickoff * 1000 - (1000 * 60 * 60 * 5);
      gameDate = new Date(gameTime);

      newGame = {
        hTeam: abbrs[game.team[1].id],
        vTeam: abbrs[game.team[0].id],
        sTime: gameTime
      };

      // Minute difference between the current time and game start time
      minDiff = Math.floor((gameTime - dateNow) / (1000 * 60));

      // If the game hasn't started
      if (gameTime > dateNow ) {

        // And within 15 minutes of the game
        if (minDiff < 15) {
          // Get the stream URL if we don't already have it
          StreamsDigger.getStream(newGame);

        // If the game is further than 15 minutes away, set to "inactive"
        } else {
          newGame.active = false;
        }

      // If the game has already started
      } else {

        // If the game is within 3 hours of start time,
        // set game to "active" and find the stream URL
        if (minDiff < 180) {
          // Get the stream URL if we don't already have it
          StreamsDigger.getStream(streamGame);

        } else {
          newGame.active = false;
        }
      }

      var gt = new Date(gameTime);
      dateString = '' + (gt.getMonth() + 1) + gt.getDate() + gt.getFullYear();
      newGame.date = gt;

      // If games for the specified game day doesn't exist, create it
      if (!games[dateString]) {
        games[dateString] = {};
      }

      // Store game info based on the date and game ID
      if (!games[dateString][gameTime]) {
        games[dateString][gameTime] = newGame;
      }

    }

    SCHEDULE[league] = games;

    console.log(SCHEDULE);

    return;
  };

  // once we hear about the data, make the game list available right away
  // while we look for stream url
  scheduleDigger.on('data', function(league, json){
    SCHEDULE[league] = json;
  });

  // format and look for the stream urls
  scheduleDigger.once('data', formatSchedule);

  // get schedule for each league
  // TODO: run this once every hour to update schedule
  leagues.forEach(function(league, i){
    scheduleDigger.getSchedule(league);
  });

  exports = module.exports = SCHEDULE;
}());
