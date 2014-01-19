/*jslint indent:2, node:true, nomen:true, unparam: true */
/*global require:false */

(function () {
  "use strict";

  var request = require('request');

  var SCHEDULE = require('../models/Schedule');

  exports = module.exports = {
    getStream: function(stream) {
      console.log('getting stream url');

      var getURL, team, i = 1;

      team = stream.hTeam;

      if (!team) {
        return;
      }

      getURL = function() {
        var streamURL, game;
        streamURL = "http://nlds" + i + ".cdnak.neulion.com/nlds/nfl/" + team + "/as/live/" + team + "_hd_800.m3u8";

        console.log('checking stream url', streamURL);

        return request(streamURL, function(err, resp, body) {
          if (err !== null && resp !== 'undefined') {
            console.log(team + ' stream is ' + streamURL);
            game = SCHEDULE[stream.date][stream.sTime];
            game.streamURL = streamURL;
            game.active = true;
            return;
          } else if (i > 200) {
            return;
          } else {
            setTimeout(getURL, 300);
          }
          return i++;
        });
      };

      getURL();
    }
  };

}());
