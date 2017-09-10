---
layout: post
title:  "Two State Autonomous Power Wheels Car"
date:   2017-07-27 
---

In this video we used an extremely basic two state program to follow a cardboard wall. This program checks the distance value of each data point that comes in from the lidar sensor. It then turns left or right based on where the majority of the points are. The program also uses a filter to throw out all of the readings that are on the right side of the car. 

At present the car's throttle is controlled using a remote, however all the steering is done autonomously through an arduino. The arduino has been programmed to accept serial communication values for steering. The python program then sends serial commands based on the lidar sensor readings. One of the most glaring problems with this program in its current state is that it has had trouble with correcting at the proper rate. This is what caused the car to crash into the back cardboard wall at the end, as the car is unable to perform tight turns. In the future we will try to implement a PID algorithm to control the car's movements.

<iframe width="560" height="315" src="https://www.youtube.com/embed/6O3Oha024Ik" frameborder="0" allowfullscreen></iframe>
