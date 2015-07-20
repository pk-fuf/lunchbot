var request = require("request"),
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
    "number": "bulb",
    "menu": "http://lumen-stuttgart.de/tag/tageskarte/",
  },
  {
    "location": "https://www.google.com/maps/place/Wirtshaus+Troll/@48.7717122,9.1588948,17.25z/data=!4m5!1m2!2m1!1srestaurant+near+me!3m1!1s0x0000000000000000:0x08019b87fa5d0da4",
    "restaurant": "Wirtshaus Troll",
    "number": "japanese_ogre",
    "menu": "http://www.wirtshaus-troll.de/Tagesessen.pdf",
  },
  {
    "location": "https://www.google.com/maps/place/Rote+Kapelle/@48.7717538,9.1595805,17.25z/data=!4m5!1m2!2m1!1srestaurant+near+me!3m1!1s0x0000000000000000:0x8b0d90e1a74346ec",
    "restaurant": "Rote Kapelle",
    "number": "cow",
    "menu": "http://rote-kapelle.de/cashs/mittags.php"
  },
  {
    "location": "https://www.google.com/maps/place/Auszeit/@48.7714981,9.1637756,17.25z/data=!4m5!1m2!2m1!1srestaurant+near+me!3m1!1s0x0000000000000000:0x759e43d3f763c0e0",
    "restaurant": "Auszeit",
    "number": "clock4"
  },
  {
    "location": "https://www.google.com/maps/place/Lemon+Grass/@48.772307,9.1686283,19z/data=!4m5!1m2!2m1!1srestaurant+near+me!3m1!1s0x0000000000000000:0x62810ca38a032f28",
    "restaurant": "Lemon Grass",
    "number": "curry"
  },
  {
    "location": "https://www.google.com/maps/place/Pizzeria+La+Piccola+Napoli/@48.7714401,9.1577603,17z/data=!4m5!1m2!2m1!1srestaurant+near+me!3m1!1s0x0000000000000000:0xcba2dec193341075",
    "restaurant": "Pizzeria La Piccola Napoli",
    "number": "pizza",
    "menu": "http://www.piccola-napoli.de/mittag.html"
  },
  {
    "location": "https://www.google.com/maps/place/Restaurant+Vapiano+Stuttgart+II/@48.7781245,9.1689675,15.75z/data=!4m5!1m2!2m1!1svapiano!3m1!1s0x0000000000000000:0x843d7c274ccf033f",
    "restaurant": "Vapiano",
    "number": "musical_keyboard",
    "menu": "http://de.vapiano.com/de/menue/specials/",
    "credit": "yes"
  },
  {
    "location": "https://www.google.de/maps/place/Silberburgstra%C3%9Fe+149,+70176+Stuttgart/@48.7735647,9.1669166,19.79z/data=!4m15!1m12!4m11!1m6!1m2!1s0x4799db466bf3e87d:0x90a5020f824e2b96!2sSilberburgstra%C3%9Fe+150,+70176+Stuttgart!2m2!1d9.16672!2d48.77357!1m3!2m2!1d9.1670117!2d48.7736244!3m1!1s0x4799db466b4644bd:0x5572f566e6ff8e73",
    "restaurant": "Aras",
    "number": "fries"
  },
  {
    "location": "https://www.google.com/maps/place/Caf%C3%A9+Chiquil%C3%ADn/@48.7707633,9.1557995,17z/data=!3m1!4b1!4m2!3m1!1s0x4799db4288f4ca6b:0xfe08c435eb4b5390",
    "restaurant": "Café Chiquilín",
    "number": "coffee",
    "menu": "http://chiquilin.de/#wochenkarte",
    "dayoff": 1,
  },
  {
    "location": "https://www.google.com/maps/place/Rappen/@48.7754963,9.165019,17.75z/data=!4m5!1m2!2m1!1srestaurant+near+me!3m1!1s0x0000000000000000:0xe2ff17ee3b15b1df",
    "restaurant": "Rappen",
    "number": "cake",
    "menu": "http://www.rappen-stuttgart.de/"
  }
];

var moreLunchSpots = [
  {
    "location": "https://www.google.com/maps/place/STUGGI+Burger/@48.774937,9.1552269,17z/data=!3m1!4b1!4m7!1m4!3m3!1s0x4799db6a6cff51d9:0x5161d09564cb0a09!2sSTUGGI+Burger!3b1!3m1!1s0x4799db6a6cff51d9:0x5161d09564cb0a09",
    "restaurant": "STUGGI Burger",
    "number": "hamburger",
    "menu": "https://www.facebook.com/StuggiBurger"
  },
  {
    "location": "https://www.google.de/maps/place/Roteb%C3%BChlstra%C3%9Fe+121,+70178+Stuttgart/@48.77072,9.15919,17z/data=!4m7!1m4!3m3!1s0x4799db43a769e9b9:0x23ff1981c4da8e1e!2sRoteb%C3%BChlstra%C3%9Fe+121,+70178+Stuttgart!3b1!3m1!1s0x4799db43a769e9b9:0x23ff1981c4da8e1e",
    "restaurant": "Tavolino",
    "number": "spaghetti",
    "menu": "http://www.tavolino.info/Wochenempfehlung/"
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

for (var i = 0; i < lunchSpots.length; i++) { // go through all lunchspots
  var today = new Date(); // get today's date
  if (lunchSpots[i].dayoff == today.getDay()) { // if lunchspot is closed today don't show its entry
    var entry = ""
  } else {
    var entry = ":" + lunchSpots[i].number + ": <" + lunchSpots[i].location + "|" +  lunchSpots[i].restaurant + ">\n";
  }
  restaurants = restaurants + entry; // add restaurant names with google maps link to restaurants

  if (lunchSpots[i].dayoff == today.getDay()) { // if lunchspot is closed today don't show its emoji
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

for (var i = 0; i < moreLunchSpots.length; i++) { // go through all secondary lunchspots
  var entry = ":" + moreLunchSpots[i].number + ": <" + moreLunchSpots[i].location + "|" +  moreLunchSpots[i].restaurant + ">\n";
  moreRestaurants = moreRestaurants + entry; // add restaurant names with google maps link to moreRestaurants

  if(moreLunchSpots[i].menu && moreLunchSpots[i].credit) { // if lunchspot has payment option other than cash display card emoji
    var emojis = "<" + moreLunchSpots[i].menu + "|:fork_and_knife:> :credit_card:\n"
  } else if(moreLunchSpots[i].menu) { // if lunchspot only has menu only display menu emoji
    var emojis = "<" + moreLunchSpots[i].menu + "|:fork_and_knife:>\n"
  } else { // if lunchspot doesnt have a menu display questionmark to avoid display issue on trailing entries
    var emojis = ":grey_question:\n"
  }

  moreDetails = moreDetails + emojis;  // add emojis to moreDetails
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

bot_text = 'Mahlzeit, worauf habt ihr heute Lust?\nWählen könnt ihr mit `+:bulb:`, `+:cow:` etc. oder über das Zahnrad in der rechten Ecke dieser Nachricht bei "Reaktionen".';

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
          title: "Restaurants",
          value: restaurants,
          short: true

        },
        {
          title: "Details",
          value: details,
          short: true
        },
        {
          title: "Weitere Restaurants",
          value: moreRestaurants,
          short: true

        },
        {
          title: "Details",
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