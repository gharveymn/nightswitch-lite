# NightSwitch-Lite

This is a lighter version of [NightSwitch](https://marketplace.visualstudio.com/items?itemName=gharveymn.nightswitch) without geolocation. It is much, much smaller because of that. You probably don't want to install both but I'm not your mom.

## Quickstart

Install the extension and go to your preferences. Add the settings 
~~~
"nightswitch.themeDay": "[YourDayTheme]"
"nightswitch.themeNight": "[YourNightTheme]"
"nightswitch.location": "[YourLatitude],[YourLongitude]"
~~~

## Extension Settings

- `"nightswitch.themeDay"` 
	- Sets the theme to be shown during the day (eg. `'Solarized Light'`)
- `"nightswitch.themeNight"` 
	- Sets the theme to be shown at night (eg. `'Default Dark+'`)
- `"nightswitch.location"`
	- Specifies a user defined geographic location. Support for most coordinate systems (eg. `'49.89,-97.14'`, `'49°53'24" N, 97°8'24" W'`, etc.).
- `"nightswitch.sunrise"`
	- Manually sets the time to switch theme to day, overriding location. Support for most time formats (eg. `'06:00'`, `'6AM'`, etc.).
- `"nightswitch.sunset"`
	- Manually sets the time to switch theme to night, overriding location. Support for most time formats  (eg. `'18:00'`, `'6PM'`, etc.).
- `"nightswitch.autoSwitch"`
	- Forces the theme to switch to currently canonical theme, ie. if it is day and you have your theme set to something other than `nightswitch.themeDay`, resets the theme to `nightswitch.themeDay` (default `true`).


## Extension Commands

- `Toggle Day/Night`
	- toggles the theme between day and night
- `Switch to Day Theme`
	- switches the theme to `nightswitch.themeDay`
- `Switch to Night Theme`
	- switches the theme to `nightswitch.themeNight`

## Changelog

### 2.2.1
Various code cleanup, better error notifications, upgrades settings so they appear with new VSCode settings page, add support for other coordinate systems and date formats

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