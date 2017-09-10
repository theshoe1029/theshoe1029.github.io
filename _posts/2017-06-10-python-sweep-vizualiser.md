---
layout: post
title:  "Python Sweep Visualizer"
date:   2017-06-10 
---

For this program I was trying to duplicate the visualization code for the [scanse sweep sensor][scanse-sweep]. The scanse website has a free visualization program that displays all of the objects the sensor detects as points on a screen. In order to better understand the sensor, I set out to clone this program using the sensor's python library. My program uses the pygame library to display all the points the sensor sees on a raspberry pi monitor. It uses several arrays to take readings from the sensor and then store those readings to be drawn on the screen. Below is a comparison of the visualizer program that is written by the manufacturer, and the visualizer that I wrote.  The python visualizer is on the left, and the visualizer written by the manufacturer is on the right.  You can look at the program on my github at the link [here][github-repo]

[github-repo]: https://github.com/theshoe1029/Power-Wheels-Team/blob/86703ed78bdb096a5fb02323ce03b14120ba3899/Python/SweepVisualizer.py
[scanse-sweep]: http://scanse.io
