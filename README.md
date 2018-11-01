# NightSwitch-Lite

This is a lighter version of [NightSwitch](https://marketplace.visualstudio.com/items?itemName=gharveymn.nightswitch) without geolocation. It is much, much smaller because of that. You probably don't want to install both but I'm not your mom.

## Quickstart

Install the extension. After reloading you should be greeted with a popup asking if you want to run the setup. From there you can set the theme you want to see during the day/night and then your location. You can also do this by editing your settings.

## Extension Settings

- `"nightswitch.themeDay"`
	- Sets the theme to be used during the day (eg. `'Solarized Light'`)
- `"nightswitch.themeNight"`
	- Sets the theme to be used at night (eg. `'Default Dark+'`)
- `"nightswitch.location"`
	- Specifies a user defined geographic location. Most coordinate systems are supported (eg. `'49.89,-97.14'`, `'49°53'24" N, 97°8'24" W'`, etc.).
- `"nightswitch.sunrise"`
	- Manually sets the time to switch theme to day, overriding location. Most time formats are supported (eg. `'06:00'`, `'6AM'`, etc.).
- `"nightswitch.sunset"`
	- Manually sets the time to switch theme to night, overriding location. Most time formats are supported  (eg. `'18:00'`, `'6PM'`, etc.).
- `"nightswitch.autoSwitch"`
	- Automatically switches the theme to day or night based on location or sunrise/sunset settings. (default: `true`).

## Extension Commands

- `Toggle Day/Night Theme`
	- toggles the theme between day and night
- `Switch to Day Theme`
	- switches the theme to `nightswitch.themeDay`
- `Switch to Night Theme`
	- switches the theme to `nightswitch.themeNight`
- `Toggle Automatic Theme Switching`
	- turns on automatic switching based on the time
- `Run Setup`
	- runs the first time setup prompts
- `Set Location`
	- set the location
- `Set Day Theme`
	- set the day theme
- `Set Night Theme`
	- set the night theme
- `Set Time of Sunrise`
	- set the time of sunrise
- `Set Time of Sunset`
	- set the time of sunset

## Changelog

### 2.2.1
Various code cleanup, better error notifications, upgrades settings so they appear with new VSCode settings page, add support for other coordinate systems and time formats

### 2.1.4
Fixes bug where the sunrise and sunset calculations would be for the wrong day.

### 2.1.3
Updates to remove a security vulnerability in one of the dependencies.

### 2.1.2
Adds code to automatically check in the background every 5 minutes so your eyeballs aren't seared after returning.

### 2.1.1
Updates dependencies to patch security issue with one of them.

### 2.1.0
Fixes issue where theme would not consistently update after system sleep.

### 2.0.2
Mistake in manual time settings, probably fixed now.

### 2.0.1
I guess I need to be on this version since I messed up the first time.

### 1.0.2
Still fixing settings.

### 1.0.1
Changes published background color.

### 2.0.0
Initial commit. Everything should be the same as with NightSwitch, but without geolocation.