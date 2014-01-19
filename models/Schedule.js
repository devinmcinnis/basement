/*jslint indent:2, node:true, nomen:true, unparam: true */
/*global require:false */

(function () {
  "use strict";

  var SCHEDULE = {};
  var leagues = ['nfl'];
  var scheduleDigger = require('../modules/ScheduleDigger');
  var StreamsDigger = require('../modules/StreamsDigger');
  var DIGGER_INTERVAL = 1000 * 60 * 15; // 15min

  var formatSchedule = function(league, json){
    var games = {}, dateNow = new Date(), dateString, dateStringId, gId, game, gameDate, mNum, minDiff, months, newGame, time, xmlGames, _i, _len, streamGame;

    // Only months left in this NFL season
    months = ['January', 'February'];

    // Ridiculous XML from NFL.com converted to JSON
    xmlGames = json.ss.gms[0].g;

    for (_i = 0, _len = xmlGames.length; _i < _len; _i++) {
      game = xmlGames[_i];
      game = game.$;

      // Month number with leading zero (01, 02, etc)
      mNum = game.eid.substring(4, 6);

      // Game ID - starting at 00, 01, etc. based on day number
      gId = game.eid.substring(8, 10);

      newGame = {
        gMonth: months[parseInt(mNum, 10) - 1],
        gDay: game.eid.substring(6, 8),
        time: game.t,
        hTeam: game.hnn,
        hScore: game.hs,
        vTeam: game.vnn,
        vScore: game.vs,
        sTime: game.t
      };

      dateString = '2014-' + mNum + '-' + newGame.gDay;
      dateStringId = dateNow.getFullYear() + mNum + newGame.gDay + gId;

      // Game start time in EST/EDT
      time = game.t.split('pm');

      // Create new date based off of game time
      gameDate = new Date(dateString + ' ' + time);

      // Add +12 hours for 24-hour clock, and 5 more for ET (GMT-5)
      gameDate.setHours(parseInt(gameDate.getHours(), 10) + 17);

      // Minute difference between the current time and game start time
      minDiff = Math.floor(((Math.abs(gameDate - dateNow)) / 1000) / 60);
      console.log("minDiff: " + minDiff);

      // Info to pass when digging stream
      streamGame = {
        data: newGame,
        date: dateString,
        id: dateStringId
      };

      // If the gameTime is before now
      if (gameDate < dateNow) {

        // And within 15 minutes of the game
        if (minDiff < 15) {
          newGame.active = true;

          // Get the stream URL if we don't already have it
          StreamsDigger.getStream(streamGame);

        // If the game is further than 15 minutes away, set to "inactive"
        } else {
          newGame.active = false;
        }

      // If the game has already started
      } else {

        // If the game is within 3 hours of start time,
        // set game to "active" and find the stream URL
        if (minDiff < 180) {
          newGame.active = true;

          // Get the stream URL if we don't already have it
          StreamsDigger.getStream(streamGame);

        } else {
          newGame.active = false;
        }
      }

      // If games for the specified game day doesn't exist, create it
      if (!games[dateString]) {
        games[dateString] = {};
      }

      // Store game info based on the date and game ID
      if (!games[dateString][dateStringId]) {
        games[dateString][dateStringId] = newGame;
      }

    }

    SCHEDULE[league] = games;

    console.log(SCHEDULE);

    return;
  };

  // loop through the available leagues and get all schedule
  var getAllSchedule = function(){
    leagues.forEach(function(league, i){
      scheduleDigger.getSchedule(league);
    });
  };

  // once we hear about the data, make the game list available right away
  // while we look for stream url
  scheduleDigger.on('data', function(league, json){
    SCHEDULE[league] = json.ss.gms[0].g;
  });

  // format and look for the stream urls
  scheduleDigger.once('data', formatSchedule);

  // get schedule for each league every DIGGER_INTERVAL
  setInterval(getAllSchedule, DIGGER_INTERVAL);

  // init the schedule
  getAllSchedule();

  exports = module.exports = SCHEDULE;
}());
