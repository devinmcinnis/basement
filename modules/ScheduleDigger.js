/*jslint indent:2, node:true, nomen:true, unparam: true */
/*global require:false */

(function () {
  "use strict";

  var Promise     = require("bluebird");

  var request     = Promise.promisify(require('request'));

  var parseXML    = require('xml2js');

  var util        = require('util');

  var events      = require("events");

  var urlWeek     = "http://#{leagueType}.myfantasyleague.com/2013/export?JSON=1&TYPE=#{league}Schedule";

  var urlSchedule = "http://www.#{league}.com/ajax/scorestrip?season=2013&seasonType=POST&week=#{week}";

  var ScheduleEvent = function(){};

  var LEAGUE_TYPE = {
    'nfl': 'football'
  };

  util.inherits(ScheduleEvent, events.EventEmitter);

  var schedule = new ScheduleEvent();

  var buildURL = function(url, obj) {
    var result;

    if(obj.league){
      result = url.replace("#{league}", obj.league);
      result = result.replace("#{leagueType}", LEAGUE_TYPE[obj.league]);
    }

    if(obj.week){
      result = result.replace("#{week}", obj.week);
    }

    return result;
  };

  /**
   * getSchedule for a specific league
   * @param  {String} league name (nfl)
   * @return {[type]}        [description]
   */
  var getSchedule = function(league){

    if(!league) return;

    request(
      buildURL(urlWeek, {
        "league": league
      })
    ).then(
      function (res){
        var res = res[0];
        if(res.statusCode == 200){
          var body = JSON.parse(res.body);
          body = body[league + 'Schedule'].matchup;

          // emit for all who are listening for schedule data
          schedule.emit('data', league, body);
        }
      }
    ).catch(
      function(err) {
        console.error(err);
      }
    );
  };

  schedule.getSchedule = getSchedule;

  exports = module.exports = schedule;

}());
