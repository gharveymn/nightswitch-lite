# nightswitch-lite README

This is a lighter version of [NightSwitch](https://marketplace.visualstudio.com/items?itemName=gharveymn.nightswitch) without geolocation. It is much, much smaller because of that. You probably don't want to install both but I'm not your mom.

Note for GitHub: This extension requires the node module `suncalc`. Install it with 
~~~
npm install suncalc
~~~
in this folder.

## Extension Settings


- `"nightswitch.dayTheme"` 
	- sets the theme to be shown during the day (eg. "Solarized Light")
- `"nightswitch.nightTheme"` 
	- sets the theme to be shown at night (eg. "Default Dark+")
- `"nightswitch.location"`
	- specifies a user defined GPS location in decimal degrees (eg. \"(49.89,-97.14)\")
- `"nightswitch.sunrise"`
	- manually sets the time to switch theme to day
- `"nightswitch.sunset"`
	- manually sets the time to switch theme to night
- `"nightswitch.forceSwitch"`
	- forces the theme to switch to currently canonical theme, ie. if it is day and you have your theme set to something other than `nightswitch.dayTheme`, resets the theme to `nightswitch.dayTheme`.


## Extension Commands

- `Toggle Day/Night`
	- toggles the theme between day and night
- `Switch to Day Theme`
	- switches the theme to `nightswitch.dayTheme`
- `Switch to Night Theme`
	- switches the theme to `nightswitch.nightTheme`


## Changelog

### 2.0.1
I guess I need to be on this version since I messed up the first time

### 1.0.2
Still fixing settings

### 1.0.1
Changes published background color. Whoops!

### 2.0.0
Initial commit. Everything should be the same as with NightSwitch, but without geolocation.