schedule = require './schedule'

parseDate = (date) ->
  year = date.getFullYear()
  month = date.getMonth() + 1
  dayNum = date.getDate()

  if month < 10
    month = '0' + month
  if dayNum < 10
    dayNum = '0' + dayNum

  dateParsed = year + '-' + month + '-' + dayNum
  return dateParsed

module.exports =
  findGamesByDate: (date) ->
    return schedule[parseDate(date)]

  findGamesByTime: (date) ->
    todaysGames = schedule[parseDate(date)]


    for game of todaysGames
      gameTime = new Date(parseDate(new Date()) + ' ' + todaysGames[game].sTime)
      gameTime.setHours(parseInt(gameTime.getHours(),10) + 12)
      dateNow = new Date()

      minDiff = Math.floor(((Math.abs(gameTime - dateNow))/1000)/60)

      # Can refactor this with new schedule with includes "time remaining"
      if gameTime < dateNow
        # If game start time is within 15 minutes from now
        if minDiff < 15
          todaysGames[game].active = true
          return todaysGames[game]
        else
            todaysGames[game].active = false
      else
        # If game is currently is progress
        if minDiff < 180
          todaysGames[game].active = true
          return todaysGames[game]
        else
            todaysGames[game].active = false
