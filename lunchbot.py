# Lunch-Bot 2.0

import math
import requests
import slackweb
import slackkeys
import restaurantlist
from bs4 import BeautifulSoup
from datetime import datetime

slack = slackweb.Slack(url=slackkeys.slackKeys['fuf'])  # codinggoat


def weekDay(year, month, day):
    offset = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
    week   = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday',  'Friday', 'Saturday']
    afterFeb = 1
    if month > 2:
        afterFeb = 0
    aux = year - 1700 - afterFeb
    dayOfWeek  = 5
    dayOfWeek += (aux + afterFeb) * 365
    dayOfWeek += aux / 4 - aux / 100 + (aux + 100) / 400
    dayOfWeek += offset[month - 1] + (day - 1)
    dayOfWeek %= 7
    return week[math.floor(dayOfWeek)]

toDay = weekDay(int(str(datetime.now())[:4]), int(str(datetime.now())[5:7].lstrip('0')), int(str(datetime.now())[8:10]))


def restaurants(spots):
  destination = ''
  for x in range(0, len(spots)):
    entry = ''
    if 'dayoff' in spots[x] and spots[x]['dayoff'] == toDay:
      entry = ''
    elif 'vacationFrom' in spots[x] and spots[x]['vacationFrom'] < str(datetime.now()) < spots[x]['vacationTo']:
      entry = ''
    else:
      if 'menu' in spots[x] and 'credit' in spots[x]:  # if lunchspot has payment option other than cash display card emoji
        entry = "<" + spots[x]['location'] + "|:" + spots[x]['number'] + ":> <" + spots[x]['menu'] + "|" + spots[x]['restaurant'] + "> :credit_card:\n"
      elif 'menu' in spots[x]:
        entry = "<" + spots[x]['location'] + "|:" + spots[x]['number'] + ":> <" + spots[x]['menu'] + "|" + spots[x]['restaurant'] + ">\n"
      else:
        entry = "<" + spots[x]['location'] + "|:" + spots[x]['number'] + ":> " + spots[x]['restaurant'] + "\n"
    destination += entry
  return destination

with requests.Session() as s:
  kapelleUrl = s.get('http://rote-kapelle.de/cashs/mittags.php')
  kapelleSoup = BeautifulSoup(kapelleUrl.content, 'html5lib')
  kapelleFull = kapelleSoup.find_all('span', {'class': 'times12'})
  kapelleToday = ''
  if len(kapelleFull) > 3:
    kapelleToday = "\n:rote_kapelle: " + kapelleFull[4].text

  napoliUrl = s.get('http://www.piccola-napoli.de/datei.html')
  napoliSoup = BeautifulSoup(napoliUrl.content, 'html5lib')
  napoliFull = napoliSoup.find_all('p')
  napoliToday = ''
  if len(napoliFull) > 3:
    napoliMonday = str(napoliFull[4].text).splitlines()[1].replace('\t', '').replace('€', '') + " (" + str(napoliFull[5].text).splitlines()[0].replace('\t', '') + ' ' + str(napoliFull[5].text).splitlines()[1].replace('\t', '') + ")"
    napoliTuesday = str(napoliFull[11].text).splitlines()[1].replace('\t', '').replace('€', '') + " (" + str(napoliFull[12].text).splitlines()[0].replace('\t', '') + ' ' + str(napoliFull[12].text).splitlines()[1].replace('\t', '') + ")"
    napoliWednesday = str(napoliFull[18].text).splitlines()[1].replace('\t', '').replace('€', '') + " (" + str(napoliFull[19].text).splitlines()[0].replace('\t', '') + ' ' + str(napoliFull[19].text).splitlines()[1].replace('\t', '') + ")"
    napoliThursday = str(napoliFull[25].text).splitlines()[1].replace('\t', '').replace('€', '') + " (" + str(napoliFull[25].text).splitlines()[0].replace('\t', '') + ' ' + str(napoliFull[25].text).splitlines()[1].replace('\t', '') + ")"
    napoliFriday = str(napoliFull[32].text).splitlines()[1].replace('\t', '').replace('€', '') + " (" + str(napoliFull[33].text).splitlines()[0].replace('\t', '') + ' ' + str(napoliFull[33].text).splitlines()[1].replace('\t', '') + ")"
    if toDay == 'Monday':
      napoliToday = "\n:napoli: " + napoliMonday
    elif toDay == 'Tuesday':
      napoliToday = "\n:napoli: " + napoliTuesday
    elif toDay == 'Wednesday':
      napoliToday = "\n:napoli: " + napoliWednesday
    elif toDay == 'Thursday':
      napoliToday = "\n:napoli: " + napoliThursday
    else:
      napoliToday = "\n:napoli: " + napoliFriday

  rappenUrl = s.get('http://www.rappen-stuttgart.de/')
  rappenSoup = BeautifulSoup(rappenUrl.content, 'html5lib')
  rappenFull = rappenSoup.find_all('big', limit=10)
  rappenToday = ''
  if len(rappenFull) > 3:
    rappenClean = str(rappenFull[6]).splitlines()
    rappenToday = "\n:rappen: " + rappenClean[2][:-17]

  chiquilinUrl = s.get('http://chiquilin.de/')
  chiquilinSoup = BeautifulSoup(chiquilinUrl.content.decode('utf-8'), 'html5lib')
  chiquilinFull = chiquilinSoup.find('section', {'id': 'wochenkarte'}).find_all('h3')
  chiquilinToday = ''
  if len(chiquilinFull) > 10:
    chiquilinTuesday = ' '.join(str(chiquilinFull[11].text).splitlines())
    chiquilinWednesday = ' '.join(str(chiquilinFull[14].text).splitlines())
    chiquilinThursday = ' '.join(str(chiquilinFull[19].text).splitlines())
    chiquilinFriday = ' '.join(str(chiquilinFull[25].text).splitlines())
    if toDay == 'Tuesday':
      chiquilinToday = "\n:chiquilin: " + chiquilinTuesday
    elif toDay == 'Wednesday':
      chiquilinToday = "\n:chiquilin: " + chiquilinWednesday
    elif toDay == 'Thursday':
      chiquilinToday = "\n:chiquilin: " + chiquilinThursday
    elif toDay == 'Friday':
      chiquilinToday = "\n:chiquilin: " + chiquilinFriday

  wohnzimmerUrl = s.get('http://www.unserwohnzimmer.de/sites/wochenkarte.php')
  wohnzimmerSoup = BeautifulSoup(wohnzimmerUrl.content, 'html5lib')
  wohnzimmerFull = wohnzimmerSoup.find('div', {'id': 'tagesessen'}).find_all('p')
  wohnzimmerHeadline = str(wohnzimmerSoup.find('div', {'id': 'weekly_content'}).find_all('h2')[0].text)[:11]
  wohnzimmerToday = ''
  if wohnzimmerHeadline == "Burgerwoche":
    wohnzimmerToday = "\n:wohnzimmer: Burger Woche"
  else:
    if len(wohnzimmerFull) > 0:
      wohnzimmerMonday = str(wohnzimmerFull[0].text).splitlines()[0]
      wohnzimmerTuesday = str(wohnzimmerFull[2].text).splitlines()[0]
      wohnzimmerWednesday = str(wohnzimmerFull[4].text).splitlines()[0]
      wohnzimmerThursday = str(wohnzimmerFull[6].text).splitlines()[0]
      wohnzimmerFriday = str(wohnzimmerFull[8].text).splitlines()[0]
      if toDay == 'Monday':
        wohnzimmerToday = "\n:wohnzimmer: " + wohnzimmerMonday
      elif toDay == 'Tuesday':
        wohnzimmerToday = "\n:wohnzimmer: " + wohnzimmerTuesday
      elif toDay == 'Wednesday':
        wohnzimmerToday = "\n:wohnzimmer: " + wohnzimmerWednesday
      elif toDay == 'Thursday':
        wohnzimmerToday = "\n:wohnzimmer: " + wohnzimmerThursday
      else:
        wohnzimmerToday = "\n:wohnzimmer: " + wohnzimmerFriday


bot_text = 'Mahlzeit, worauf habt ihr heute Lust?\nWählen könnt ihr mit `+:lumen:`, `+:wirtshaus_troll:`, `+:bugan:` etc. oder über das Zahnrad in der rechten Ecke dieser Nachricht bei "Add a reaction".\n*Das Wochenmenü vom Troll funktioniert momentan nicht.*'

weekly_content = restaurants(restaurantlist.weeklySpots)
static_content = restaurants(restaurantlist.staticSpots)
additional_content = ":new: Ich will woanders hin (bitte etwas vorschlagen)\n:x: Ich will nicht/hab mein eigenes Essen dabei"
legend_content = "<https://127.0.0.1|Txt> `Speisekarte`\n:wirtshaus_troll: `Google Maps Link`\n:credit_card: `Kartenzahlung möglich`"
feedback_content = "Version: 2.0 (<https://github.com/pk-fuf/lunchbot/commit/9cb247a1c3bc150e3ec647528f3324d781321c50|Changelog>)\nPatrick Kontschak\npk@fuf.de"

weekly = {"title": "Restaurants (mit wechselnden Wochengerichten)", "value": weekly_content, "short": True}
static = {"title": "Restaurants (mit festgelegtem Menü)", "value": static_content, "short": True}
additional = {"title": "Zusätzliche Optionen", "value": additional_content, "short": False}
legend = {"title": "Legende", "value": legend_content, "short": True}
feedback = {"title": "Über Lunch-Bot:", "value": feedback_content, "short": True}
pretext = "*Vorschläge:*" + kapelleToday + napoliToday + rappenToday + chiquilinToday + wohnzimmerToday

attachments = []
attachment = {"pretext": pretext, "color": "#FC4934", "fields": [weekly, static, additional, legend, feedback], "mrkdwn_in": ["fields", "pretext"]}
attachments.append(attachment)

slack.notify(text=bot_text, channel="#general", username="Lunch Bot", icon_emoji=":fork_and_knife:", attachments=attachments)
