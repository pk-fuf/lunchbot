# Lunch-Bot 2.0

import math
import requests
import slackweb
import slackkeys
from bs4 import BeautifulSoup
from datetime import datetime

slack = slackweb.Slack(url=slackkeys.slackKeys['fuf'])  # codinggoat

weeklySpots = [
  {
    "location": "https://www.google.com/maps/place/Lumen/@48.7723682,9.156562,17z/",
    "restaurant": "Lumen",
    "number": "lumen",
    "menu": "http://lumen-stuttgart.de/tag/tageskarte/"
  },
  {
    "location": "https://www.google.com/maps/place/Wirtshaus+Troll/@48.7717122,9.1588948,17.25z/",
    "restaurant": "Wirtshaus Troll",
    "number": "wirtshaus_troll",
    "menu": "http://www.wirtshaus-troll.de/Tagesessen.pdf",
    "vacationFrom": "2015-07-29",
    "vacationTo": "2015-09-13"
  },
  {
    "location": "https://www.google.com/maps/place/Rote+Kapelle/@48.7717538,9.1595805,17.25z/",
    "restaurant": "Rote Kapelle",
    "number": "rote_kapelle",
    "menu": "http://rote-kapelle.de/cashs/mittags.php"
  },
  {
    "location": "https://www.google.de/maps/place/Roteb%C3%BChlstra%C3%9Fe+121,+70178+Stuttgart/@48.77072,9.15919,17z/",
    "restaurant": "Tavolino",
    "number": "tavolino",
    "menu": "http://www.tavolino.info/Wochenempfehlung/"
  },
  {
    "location": "https://www.google.com/maps/place/Pizzeria+La+Piccola+Napoli/@48.7714401,9.1577603,17z/",
    "restaurant": "Pizzeria La Piccola Napoli",
    "number": "napoli",
    "menu": "http://www.piccola-napoli.de/mittag.html",
    "vacationFrom": "2015-08-02",
    "vacationTo": "2015-09-03"
  },
  {
    "location": "https://www.google.com/maps/place/Rappen/@48.7754963,9.165019,17.75z/",
    "restaurant": "Rappen",
    "number": "rappen",
    "menu": "http://www.rappen-stuttgart.de/",
    "vacationFrom": "2015-08-30",
    "vacationTo": "2015-09-12"
  },
  {
    "location": "https://www.google.com/maps/place/Caf%C3%A9+Chiquil%C3%ADn/@48.7707633,9.1557995,17z/",
    "restaurant": "Café Chiquilín",
    "number": "chiquilin",
    "menu": "http://chiquilin.de/#wochenkarte",
    "credit": "yes",
    "dayoff": 1
  },
  {
    "location": "https://www.google.com/maps/place/Cafe+Moulu/@48.7761901,9.1620446,17z/",
    "restaurant": "Café Moulu",
    "number": "moulu",
    "menu": "https://www.facebook.com/media/set/?set=a.729087223873898.1073741836.397970303652260&type=3"
  },
  {
    "location": "https://www.google.com/maps/place/Gastst%C3%A4tte+Wohnzimmer/@48.7761901,9.1620446,17z/",
    "restaurant": "Wohnzimmer",
    "number": "wohnzimmer",
    "menu": "http://www.unserwohnzimmer.de/sites/wochenkarte.php"
  },
  {
    "location": "https://www.google.com/maps/place/Auszeit/@48.7714981,9.1637756,17.25z/",
    "restaurant": "Auszeit",
    "number": "auszeit"
  }
]

staticSpots = [
  {
    "location": "https://www.google.com/maps/place/STUGGI+Burger/@48.774937,9.1552269,17z/",
    "restaurant": "STUGGI Burger",
    "number": "stuggi",
    "menu": "https://www.facebook.com/StuggiBurger",
    "vacationFrom": "2015-08-17",
    "vacationTo": "2015-08-30"
  },
  {
    "location": "https://www.google.com/maps/place/The+Burger+Republic/@48.7730483,9.1727579,17z/",
    "restaurant": "The Burger Republic",
    "number": "burger_republic",
    "menu": "http://www.theburgerrepublic.de/#!nemu/ccw7",
    "credit": "yes"
  },
  {
    "location": "https://www.google.com/maps/place/Restaurant+Vapiano+Stuttgart+II/@48.7781245,9.1689675,15.75z/",
    "restaurant": "Vapiano",
    "number": "vapiano",
    "menu": "http://de.vapiano.com/de/menue/specials/",
    "credit": "yes"
  },
  {
    "location": "https://www.google.com/maps/place/Ristorante+Regenbogen/@48.773013,9.1627332,17z/",
    "restaurant": "Ristorante Regenbogen",
    "number": "rainbow",
    "menu": "http://ristorante-regenbogen.com/#download"
  },
  {
    "location": "https://www.google.com/maps/place/Joey's+Pizza+Service+Stuttgart+West/@48.7716378,9.1586624,16.5z/",
    "restaurant": "Joey's Pizza",
    "number": "joeys",
    "menu": "http://www.joeys.de/store/stuttgart-west/list/mittagsangebot",
    "credit": "yes"
  },
  {
    "location": "https://encrypted.google.com/maps/place/Mai+%26+Sushi/@48.7725488,9.1566256,17z/",
    "restaurant": "Mai & Sushi",
    "number": "sushi",
    "menu": "https://www.facebook.com/Sushi.and.more/photos/pb.400214640042962.-2207520000.1438589211./941992522531835/?type=3&theater",
    "vacationFrom": "2015-08-17",
    "vacationTo": "2015-08-30"
  },
  {
    "location": "https://www.google.com/maps/place/Bugan/@48.7716675,9.1731329,17z/",
    "restaurant": "Bugan",
    "number": "bugan",
    "menu": "http://imgur.com/a/bRVHg",
    "credit": "yes"
  },
  {
    "location": "https://www.google.com/maps/place/Lemon+Grass/@48.772307,9.1686283,19z/",
    "restaurant": "Lemon Grass",
    "number": "lemon_grass"
  },
  {
    "location": "https://www.google.de/maps/place/Silberburgstra%C3%9Fe+149,+70176+Stuttgart/@48.7736708,9.1666873,18z/",
    "restaurant": "Aras",
    "number": "aras"
  }
]


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


def restaurants(spots):
  destination = ''
  for x in range(0, len(spots)):
    entry = ''
    if 'vacationFrom' in spots[x] and spots[x]['vacationFrom'] < str(datetime.now()) < spots[x]['vacationTo']:
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

toDay = weekDay(int(str(datetime.now())[:4]), int(str(datetime.now())[5:7].lstrip('0')), int(str(datetime.now())[8:10]))

with requests.Session() as s:
  kapelleUrl = s.get('http://rote-kapelle.de/cashs/mittags.php')
  kapelleSoup = BeautifulSoup(kapelleUrl.content, 'html5lib')
  kapelleFull = kapelleSoup.find_all('span', {'class': 'times12'})
  kapelleToday = "\n:rote_kapelle: " + kapelleFull[4].text

  napoliUrl = s.get('http://www.piccola-napoli.de/datei.html')
  napoliSoup = BeautifulSoup(napoliUrl.content, 'html5lib')
  napoliFull = napoliSoup.find_all('p')
  napoliMonday = str(napoliFull[4].text).splitlines()[1].replace('\t', '').replace('€', '') + "(" + str(napoliFull[5].text).splitlines()[0].replace('\t', '') + ' ' + str(napoliFull[5].text).splitlines()[1].replace('\t', '') + ")"
  napoliTuesday = str(napoliFull[11].text).splitlines()[1].replace('\t', '').replace('€', '') + "(" + str(napoliFull[12].text).splitlines()[0].replace('\t', '') + ' ' + str(napoliFull[12].text).splitlines()[1].replace('\t', '') + ")"
  napoliWednesday = str(napoliFull[18].text).splitlines()[1].replace('\t', '').replace('€', '') + "(" + str(napoliFull[19].text).splitlines()[0].replace('\t', '') + ' ' + str(napoliFull[19].text).splitlines()[1].replace('\t', '') + ")"
  napoliThursday = str(napoliFull[25].text).splitlines()[1].replace('\t', '').replace('€', '') + "(" + str(napoliFull[25].text).splitlines()[0].replace('\t', '') + ' ' + str(napoliFull[25].text).splitlines()[1].replace('\t', '') + ")"
  napoliFriday = str(napoliFull[32].text).splitlines()[1].replace('\t', '').replace('€', '') + "(" + str(napoliFull[33].text).splitlines()[0].replace('\t', '') + ' ' + str(napoliFull[33].text).splitlines()[1].replace('\t', '') + ")"
  napoliToday = ''
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
  rappenFull = rappenSoup.find_all('big', limit=6)
  rappenClean = str(rappenFull[4]).splitlines()
  rappenToday = "\n:rappen: " + rappenClean[3][:-10]

  chiquilinUrl = s.get('http://chiquilin.de/')
  chiquilinSoup = BeautifulSoup(chiquilinUrl.content.decode('utf-8'), 'html5lib')
  chiquilinFull = chiquilinSoup.find('section', {'id': 'wochenkarte'}).find_all('h3')
  chiquilinTuesday = ' '.join(str(chiquilinFull[11].text).splitlines())
  chiquilinWednesday = ' '.join(str(chiquilinFull[14].text).splitlines())
  chiquilinThursday = ' '.join(str(chiquilinFull[19].text).splitlines())
  chiquilinFriday = ' '.join(str(chiquilinFull[25].text).splitlines())
  chiquilinToday = ''
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
  if wohnzimmerHeadline == "Burgerwoche":
    wohnzimmerToday = "\n:wohnzimmer: Burger Woche"
  else:
    wohnzimmerMonday = str(wohnzimmerFull[0].text).splitlines()[0]
    wohnzimmerTuesday = str(wohnzimmerFull[2].text).splitlines()[0]
    wohnzimmerWednesday = str(wohnzimmerFull[4].text).splitlines()[0]
    wohnzimmerThursday = str(wohnzimmerFull[6].text).splitlines()[0]
    wohnzimmerFriday = str(wohnzimmerFull[8].text).splitlines()[0]
    wohnzimmerToday = ''
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


bot_text = 'Mahlzeit, worauf habt ihr heute Lust?\nWählen könnt ihr mit `+:lumen:`, `+:wirtshaus_troll:`, `+:bugan:` etc. oder über das Zahnrad in der rechten Ecke dieser Nachricht bei "Add a reaction".'

weekly_content = restaurants(weeklySpots)
static_content = restaurants(staticSpots)
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
