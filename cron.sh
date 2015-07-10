#!/bin/bash

# Tell cron to use my local .profile information
source /home/pkontschak/.bash_profile

# change directories into the /lunchbot
cd /home/pkontschak/Documents/Repos/lunchbot

# run the bot itself using node
node lunchbot.js
