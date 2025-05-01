# Concept
This code is a simulation of circles that have a gravity effect as well as collision effects with other circles and the surrounding 'walls' or edges of the screen.

[Link for app](https://bwirick-ut.github.io/bouncingCircles/)

## Progressive Web App (PWA)
The app is accessible on mobile to utilize the mobile device's gyroscope with orientations allowing the user to rotate the phone and the circles will fall to the bottom of the orientation.

### PSA for iOS
If the user is on an iOS device, permissions are needed to access the phone's orientation data. The button is located at the bottom left corner of the page. Click that button, grant access and now the app will work as intended.

## Features
- Physics-based circle simulation with gravity and collision effects
- Responsive design that works on both desktop and mobile devices
- Gyroscope integration for mobile devices to control gravity direction
- Circles with random colors, sizes, and initial velocities
- Realistic collision physics between circles and with screen boundaries

## Technical Implementation
- Built with vanilla JavaScript and WebGL for rendering
- Uses device orientation API to detect phone rotation
- Implements custom collision detection and resolution algorithms
- Optimized for performance with efficient rendering techniques

## How to Use
1. On desktop: Watch the circles bounce and interact
2. On mobile: Rotate your device to change the direction of gravity
3. On iOS: Grant permission when prompted to enable gyroscope functionality

## Installation
The app can be installed as a PWA on compatible devices by using the "Add to Home Screen" option in your browser.
