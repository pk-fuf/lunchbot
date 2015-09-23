var moment  = require('moment'),
    request = require('request'),
    keys    = require('../api_keys/slack_keys');
  
var bot_text;

/* 
  Based on John Keefe's lunchbot. Heavily modified by Patrick Kontschak
  See http://johnkeefe.net/make-every-week-lunch-bot

  The Slack webook URL used below is something you can get from inside the Slack app
  to send messages into a Slack channel. Since it's secret, I keep it 
  in a file outside of this directory structure so I don't accidentally 
  publish it on Github. I bring it above as "keys" from a file
  called slack_keys.js. The structure of that file is:
  
  var SLACK_WEBHOOK_URL = 'your_incoming_webhook_url_goes_here';

      module.exports.SLACK_WEBHOOK_URL = SLACK_WEBHOOK_URL;
  
  If your code is going to stay private, you can skip this by deleting line 2
  and editing the first part of the options variable below like so:
  
  var options = {
    url: 'https://your-webhook-url-goes-here',
    ...
  
*/

// List of restaurants and Google Maps urls as JSON 
var lunchSpots = [
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
];

var moreLunchSpots = [
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

var moreOptions = [
  {
    "special": "more",
    "text": "Ich will woanders hin (bitte etwas vorschlagen)",
    "number": "new"
  },
  {
    "special": "rejected",
    "text": "Ich will nicht/hab mein eigenes Essen dabei",
    "number": "x"
  }
]

var restaurants = ''; // first 10 restaurants
var moreRestaurants = ''; // 10 more restaurants
var specials = ''; // more and rejected options

function isOnVacation(from, to) {
  var dateFrom = from;
  var dateTo = to;
  var rightNow = new Date();
  var dateCheck = rightNow

  var d1 = dateFrom.split("/");
  var d2 = dateTo.split("/");
  var c = dateCheck.split("/");

  var from = new Date(d1[2], d1[1]-1, d1[0]);  // -1 because months are from 0 to 11
  var to   = new Date(d2[2], d2[1]-1, d2[0]);
  var check = new Date(c[2], c[1]-1, c[0]);

  var onVacation = check > from && check < to;
}

for (var i = 0; i < lunchSpots.length; i++) { // go through all lunchspots
  var today = new Date(); // get today's date
  if (lunchSpots[i].dayoff == today.getDay() || moment().isBetween(lunchSpots[i].vacationFrom, lunchSpots[i].vacationTo) == 1) { // if lunchspot is closed today don't show its entry
    var entry = ""
  } else {
    if(lunchSpots[i].menu && lunchSpots[i].credit) { // if lunchspot has payment option other than cash display card emoji
      var entry = "<" + lunchSpots[i].location + "|:" + lunchSpots[i].number + ":> <" + lunchSpots[i].menu + "|" +  lunchSpots[i].restaurant + "> :credit_card:\n"
    } else if(lunchSpots[i].menu) { // if lunchspot only has menu only display menu emoji
      var entry = "<" + lunchSpots[i].location + "|:" + lunchSpots[i].number + ":> <" + lunchSpots[i].menu + "|" +  lunchSpots[i].restaurant + ">\n"
    } else {
      var entry = "<" + lunchSpots[i].location + "|:" + lunchSpots[i].number + ":> " +  lunchSpots[i].restaurant + "\n"
    }
  }
  restaurants = restaurants + entry; // add restaurant names with google maps link to restaurants
};

for (var i = 0; i < moreLunchSpots.length; i++) { // go through all lunchspots
  var today = new Date(); // get today's date
  if (moreLunchSpots[i].dayoff == today.getDay() || moment().isBetween(moreLunchSpots[i].vacationFrom, moreLunchSpots[i].vacationTo) == 1) { // if lunchspot is closed today don't show its entry
    var entry = ""
  } else if(moreLunchSpots[i].menu && moreLunchSpots[i].credit) { // if lunchspot has payment option other than cash display card emoji
    var entry = "<" + moreLunchSpots[i].location + "|:" + moreLunchSpots[i].number + ":> <" + moreLunchSpots[i].menu + "|" +  moreLunchSpots[i].restaurant + "> :credit_card:\n"
  } else if(moreLunchSpots[i].menu) { // if lunchspot only has menu only display menu emoji
    var entry = "<" + moreLunchSpots[i].location + "|:" + moreLunchSpots[i].number + ":> <" + moreLunchSpots[i].menu + "|" +  moreLunchSpots[i].restaurant + ">\n"
  } else {
    var entry = "<" + moreLunchSpots[i].location + "|:" + moreLunchSpots[i].number + ":> " +  moreLunchSpots[i].restaurant + "\n"
  }
  moreRestaurants = moreRestaurants + entry; // add restaurant names with google maps link to restaurants
};

for (var i = 0; i < moreOptions.length; i++) { // go through all special options
  var entry = ":" + moreOptions[i].number + ": "+ moreOptions[i].text + "\n";
  specials = specials + entry; // add special options without google maps link to specials
};

bot_text = 'Mahlzeit, worauf habt ihr heute Lust?\nWählen könnt ihr mit `+:lumen:`, `+:wirtshaus_troll:`, `+:bugan:` etc. oder über das Zahnrad in der rechten Ecke dieser Nachricht bei "Add a reaction".';

// console.log(bot_text);

// Compose the message and other details to send to Slack 
var payload = {
  text: bot_text,
  icon_emoji: ":fork_and_knife:",
  username: "Lunch Bot",
  channel: "#general",
  mrkdwn: true,
  attachments: [
    {
      fields: [
        // {
        //   title: "Heute neu:",
        //   value: highlights,
        //   short: false

        // },
        {
          title: "Restaurants (mit wechselnden Wochengerichten)",
          value: restaurants,
          short: true

        },
        {
          title: "Restaurants (mit festgelegtem Menü)",
          value: moreRestaurants,
          short: true

        },
        {
          title: "Zusätzliche Optionen",
          value: specials,
          short: false
        },
        {
          title: "Legende",
          value: "<https://127.0.0.1|Txt> `Speisekarte`\n:wirtshaus_troll: `Google Maps Link`\n:credit_card: `Kartenzahlung möglich`",
          short: true
        },
        {
          title: "Ideen? Anregungen?",
          value: "pk@fuf.de",
          short: true
        }
      ],
      mrkdwn_in: ["fields"]
    }
  ]
};


// Autofill reactions [TO DO]

// Set up the sending options for the request function.
// See note about the SLACK_WEBHOOK_URL above.
var options = {
  url: keys.SLACK_WEBHOOK_URL,
  method: 'POST',
  body: payload,
  json: true
};

// // Send the webhook
request(options, function (error, response, body){
  if (!error && response.statusCode == 200) {
    console.log(body);
  } else {
    console.log(error);
  }
});