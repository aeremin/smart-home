#!/bin/bash
scp lircd.conf pi@raspberrypi:~
SCRIPT="sudo cp ~/lircd.conf /etc/lirc/lircd.conf; sudo /etc/init.d/lirc restart"
ssh pi@raspberrypi "${SCRIPT}"
