var request = require("request"),
    moment = require('moment'),
    keys = require('../api_keys/slack_keys');
  
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
    "location": "https://www.google.com/maps/place/Lumen/@48.7723682,9.156562,17z/data=!4m5!1m2!2m1!1srestaurant+near+me!3m1!1s0x0000000000000000:0xf66f1446b4ea8e79",
    "restaurant": "Lumen",
    "number": "lumen",
    "menu": "http://lumen-stuttgart.de/tag/tageskarte/"
  },
  {
    "location": "https://www.google.com/maps/place/Wirtshaus+Troll/@48.7717122,9.1588948,17.25z/data=!4m5!1m2!2m1!1srestaurant+near+me!3m1!1s0x0000000000000000:0x08019b87fa5d0da4",
    "restaurant": "Wirtshaus Troll",
    "number": "wirtshaus_troll",
    "menu": "http://www.wirtshaus-troll.de/Tagesessen.pdf",
    "vacationFrom": "2015-07-30",
    "vacationTo": "2015-09-12"
  },
  {
    "location": "https://www.google.com/maps/place/Rote+Kapelle/@48.7717538,9.1595805,17.25z/data=!4m5!1m2!2m1!1srestaurant+near+me!3m1!1s0x0000000000000000:0x8b0d90e1a74346ec",
    "restaurant": "Rote Kapelle",
    "number": "rote_kapelle",
    "menu": "http://rote-kapelle.de/cashs/mittags.php"
  },
  {
    "location": "https://www.google.de/maps/place/Roteb%C3%BChlstra%C3%9Fe+121,+70178+Stuttgart/@48.77072,9.15919,17z/data=!4m7!1m4!3m3!1s0x4799db43a769e9b9:0x23ff1981c4da8e1e!2sRoteb%C3%BChlstra%C3%9Fe+121,+70178+Stuttgart!3b1!3m1!1s0x4799db43a769e9b9:0x23ff1981c4da8e1e",
    "restaurant": "Tavolino",
    "number": "tavolino",
    "menu": "http://www.tavolino.info/Wochenempfehlung/"
  },
  {
    "location": "https://www.google.com/maps/place/Pizzeria+La+Piccola+Napoli/@48.7714401,9.1577603,17z/data=!4m5!1m2!2m1!1srestaurant+near+me!3m1!1s0x0000000000000000:0xcba2dec193341075",
    "restaurant": "Pizzeria La Piccola Napoli",
    "number": "napoli",
    "menu": "http://www.piccola-napoli.de/mittag.html",
    "vacationFrom": "2015-08-03",
    "vacationTo": "2015-09-02"
  },
  {
    "location": "https://www.google.com/maps/place/Rappen/@48.7754963,9.165019,17.75z/data=!4m5!1m2!2m1!1srestaurant+near+me!3m1!1s0x0000000000000000:0xe2ff17ee3b15b1df",
    "restaurant": "Rappen",
    "number": "rappen",
    "menu": "http://www.rappen-stuttgart.de/",
    "vacationFrom": "2015-08-31",
    "vacationTo": "2015-09-11"
  },
  {
    "location": "https://www.google.com/maps/place/Caf%C3%A9+Chiquil%C3%ADn/@48.7707633,9.1557995,17z/data=!3m1!4b1!4m2!3m1!1s0x4799db4288f4ca6b:0xfe08c435eb4b5390",
    "restaurant": "Café Chiquilín",
    "number": "chiquilin",
    "menu": "http://chiquilin.de/#wochenkarte",
    "credit": "yes",
    "dayoff": 1
  },
  {
    "location": "https://www.google.com/maps/place/Cafe+Moulu/@48.7761901,9.1620446,17z/data=!4m7!1m4!3m3!1s0x4799db40c4c92d15:0xd1022b8a12101e5b!2sGastst%C3%A4tte+Wohnzimmer!3b1!3m1!1s0x0000000000000000:0xa369a06d9813a122",
    "restaurant": "Café Moulu",
    "number": "moulu",
    "menu": "https://www.facebook.com/media/set/?set=a.729087223873898.1073741836.397970303652260&type=3"
  },
  {
    "location": "https://www.google.com/maps/place/Gastst%C3%A4tte+Wohnzimmer/@48.7761901,9.1620446,17z/data=!3m1!4b1!4m2!3m1!1s0x4799db40c4c92d15:0xd1022b8a12101e5b",
    "restaurant": "Wohnzimmer",
    "number": "wohnzimmer",
    "menu": "http://www.unserwohnzimmer.de/sites/wochenkarte.php"
  },
  {
    "location": "https://www.google.com/maps/place/Auszeit/@48.7714981,9.1637756,17.25z/data=!4m5!1m2!2m1!1srestaurant+near+me!3m1!1s0x0000000000000000:0x759e43d3f763c0e0",
    "restaurant": "Auszeit",
    "number": "auszeit"
  }
];

var moreLunchSpots = [
  {
    "location": "https://www.google.com/maps/place/STUGGI+Burger/@48.774937,9.1552269,17z/data=!3m1!4b1!4m7!1m4!3m3!1s0x4799db6a6cff51d9:0x5161d09564cb0a09!2sSTUGGI+Burger!3b1!3m1!1s0x4799db6a6cff51d9:0x5161d09564cb0a09",
    "restaurant": "STUGGI Burger",
    "number": "stuggi",
    "menu": "https://www.facebook.com/StuggiBurger",
    "vacationFrom": "2015-08-17",
    "vacationTo": "2015-08-30"
  },
  {
    "location": "https://www.google.com/maps/place/The+Burger+Republic/@48.7730483,9.1727579,17z/data=!3m1!4b1!4m2!3m1!1s0x4799db493b8917bb:0x36fa5ed2a450cf52",
    "restaurant": "The Burger Republic",
    "number": "burger_republic",
    "menu": "http://www.theburgerrepublic.de/#!nemu/ccw7"
  },
  {
    "location": "https://www.google.com/maps/place/Restaurant+Vapiano+Stuttgart+II/@48.7781245,9.1689675,15.75z/data=!4m5!1m2!2m1!1svapiano!3m1!1s0x0000000000000000:0x843d7c274ccf033f",
    "restaurant": "Vapiano",
    "number": "vapiano",
    "menu": "http://de.vapiano.com/de/menue/specials/",
    "credit": "yes"
  },
  {
    "location": "https://www.google.com/maps/place/The+Burger+Republic/@48.7730483,9.1727579,17z/data=!3m1!4b1!4m2!3m1!1s0x4799db493b8917bb:0x36fa5ed2a450cf52",
    "restaurant": "Ristorante Regenbogen",
    "number": "rainbow",
    "menu": "http://ristorante-regenbogen.com/#download"
  },
  {
    "location": "https://www.google.com/maps/place/Joey's+Pizza+Service+Stuttgart+West/@48.7716378,9.1586624,16.5z/data=!4m5!1m2!2m1!1sjoey's+Pizza!3m1!1s0x4799db43ba9b4ce1:0xd61fd8b73784bc98",
    "restaurant": "Joey's Pizza",
    "number": "joeys",
    "menu": "http://www.joeys.de/store/stuttgart-west/list/mittagsangebot"
  },
  {
    "location": "https://encrypted.google.com/maps/place/Mai+%26+Sushi/@48.7725488,9.1566256,17z/data=!4m2!3m1!1s0x0:0xffc4719f7c4108df",
    "restaurant": "Mai & Sushi",
    "number": "sushi",
    "menu": "https://www.facebook.com/Sushi.and.more/photos/pb.400214640042962.-2207520000.1438589211./941992522531835/?type=3&theater",
    "vacationFrom": "2015-08-17",
    "vacationTo": "2015-08-30"
  },
  {
    "location": "https://www.google.com/maps/place/Bugan/@48.7716675,9.1731329,17z/data=!3m1!4b1!4m2!3m1!1s0x4799db4eb6ea2a63:0x83b10e463dab09b6",
    "restaurant": "Bugan",
    "number": "bugan",
    "menu": "http://imgur.com/a/bRVHg"
  },
  {
    "location": "https://www.google.com/maps/place/Lemon+Grass/@48.772307,9.1686283,19z/data=!4m5!1m2!2m1!1srestaurant+near+me!3m1!1s0x0000000000000000:0x62810ca38a032f28",
    "restaurant": "Lemon Grass",
    "number": "lemon_grass"
  },
  {
    "location": "https://www.google.de/maps/place/Silberburgstra%C3%9Fe+149,+70176+Stuttgart/@48.7735647,9.1669166,19.79z/data=!4m15!1m12!4m11!1m6!1m2!1s0x4799db466bf3e87d:0x90a5020f824e2b96!2sSilberburgstra%C3%9Fe+150,+70176+Stuttgart!2m2!1d9.16672!2d48.77357!1m3!2m2!1d9.1670117!2d48.7736244!3m1!1s0x4799db466b4644bd:0x5572f566e6ff8e73",
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
var details = ''; // menu and payment info for restaurants
var moreDetails = ''; // menu and payment info for moreRestaurants
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
  console.log(onVacation);
}

for (var i = 0; i < lunchSpots.length; i++) { // go through all lunchspots
  var today = new Date(); // get today's date
  if (lunchSpots[i].dayoff == today.getDay() || moment().isBetween(lunchSpots[i].vacationFrom, lunchSpots[i].vacationTo) == 1) { // if lunchspot is closed today don't show its entry
    var entry = ""
  } else {
    var entry = ":" + lunchSpots[i].number + ": <" + lunchSpots[i].location + "|" +  lunchSpots[i].restaurant + ">\n";
  }
  restaurants = restaurants + entry; // add restaurant names with google maps link to restaurants

  if (lunchSpots[i].dayoff == today.getDay() || moment().isBetween(lunchSpots[i].vacationFrom, lunchSpots[i].vacationTo) == 1) { // if lunchspot is closed today don't show its emoji
    var emojis = ""
  } else if(lunchSpots[i].menu && lunchSpots[i].credit) { // if lunchspot has payment option other than cash display card emoji
    var emojis = "<" + lunchSpots[i].menu + "|:fork_and_knife:> :credit_card:\n"
  } else if(lunchSpots[i].menu) { // if lunchspot only has menu only display menu emoji
    var emojis = "<" + lunchSpots[i].menu + "|:fork_and_knife:>\n"
  } else { // if lunchspot doesnt have a menu display questionmark to avoid display issue on trailing entries
    var emojis = ":grey_question:\n"
  }

  details = details + emojis; // add emojis to details
};

for (var i = 0; i < moreLunchSpots.length; i++) { // go through all lunchspots
  var today = new Date(); // get today's date
  if (moreLunchSpots[i].dayoff == today.getDay() || moment().isBetween(moreLunchSpots[i].vacationFrom, moreLunchSpots[i].vacationTo) == 1) { // if lunchspot is closed today don't show its entry
    var entry = ""
  } else {
    var entry = ":" + moreLunchSpots[i].number + ": <" + moreLunchSpots[i].location + "|" +  moreLunchSpots[i].restaurant + ">\n";
  }
  moreRestaurants = moreRestaurants + entry; // add restaurant names with google maps link to restaurants

  if (moreLunchSpots[i].dayoff == today.getDay() || moment().isBetween(moreLunchSpots[i].vacationFrom, moreLunchSpots[i].vacationTo) == 1) { // if lunchspot is closed today don't show its emoji
    var emojis = ""
  } else if(moreLunchSpots[i].menu && moreLunchSpots[i].credit) { // if lunchspot has payment option other than cash display card emoji
    var emojis = "<" + moreLunchSpots[i].menu + "|:fork_and_knife:> :credit_card:\n"
  } else if(moreLunchSpots[i].menu) { // if lunchspot only has menu only display menu emoji
    var emojis = "<" + moreLunchSpots[i].menu + "|:fork_and_knife:>\n"
  } else { // if lunchspot doesnt have a menu display questionmark to avoid display issue on trailing entries
    var emojis = ":grey_question:\n"
  }

  moreDetails = moreDetails + emojis; // add emojis to details
};

for (var i = 0; i < moreOptions.length; i++) { // go through all special options
  var entry = ":" + moreOptions[i].number + ": "+ moreOptions[i].text + "\n";
  specials = specials + entry; // add special options without google maps link to specials
};

// Don't Repeat Yourself!
// The function below will eventually replace the repetitive stuff above.
// At this point in time it's not quite working yet though.

// function lunchEntries(spots, drop, options) {
//   for (var i = 0; i < spots.length; i++) { // go through all spots
//     var today = new Date(); // get today's date
//     if (lunchSpots[i].dayoff == today.getDay()) { // if lunchspot is closed today don't show its entry
//       var entry = ""
//     } else {
//       var entry = ":" + spots[i].number + ": <" + spots[i].location + "|" +  spots[i].restaurant + ">\n";
//     }
//     drop = drop + entry; // add restaurant names with google maps link to drop

//     if (lunchSpots[i].dayoff == today.getDay()) { // if lunchspot is closed today don't show its emoji
//       var emojis = ""
//     } else if(spots[i].menu && spots[i].credit) { // if spot has payment option other than cash display card emoji
//       var emojis = "<" + spots[i].menu + "|:fork_and_knife:> :credit_card:\n"
//     } else if(spots[i].menu) { // if spot only has menu only display menu emoji
//       var emojis = "<" + spots[i].menu + "|:fork_and_knife:>\n"
//     } else { // if spot doesnt have a menu display questionmark to avoid display issue on trailing entries
//       var emojis = ":grey_question:\n"
//     }

//     options = options + emojis; // add emojis to options
//   };
// }

// lunchEntries(lunchSpots, restaurants, details);
// lunchEntries(moreLunchSpots, moreRestaurants, moreDetails);

bot_text = 'Mahlzeit, worauf habt ihr heute Lust?\nWählen könnt ihr mit `+:lumen:`, `+:wirtshaus_troll:`, `+:bugan:` etc. oder über das Zahnrad in der rechten Ecke dieser Nachricht bei "Reaktionen".';

console.log(bot_text);

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
        {
          title: "Restaurants (mit wechselnden Wochengerichten)",
          value: restaurants,
          short: true

        },
        {
          title: "Details",
          value: details,
          short: true
        },
        {
          title: "Restaurants (mit festgelegtem Menü)",
          value: moreRestaurants,
          short: true

        },
        {
          title: "",
          value: moreDetails,
          short: true
        },
        {
          title: "Zusätzliche Optionen",
          value: specials,
          short: false
        },
        {
          title: "Legende",
          value: "<https://www.google.com/maps|Txt> `Google Maps Link`\n:fork_and_knife: `Speisekarte`\n:grey_question: `Keine Speisekarte gefunden`\n:credit_card: `Kartenzahlung möglich`",
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

// Send the webhook
request(options, function (error, response, body){
  if (!error && response.statusCode == 200) {
    console.log(body);
  } else {
    console.log(error);
  }
});