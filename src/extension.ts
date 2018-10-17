'use strict';
import {workspace, window, commands, ExtensionContext} from 'vscode';

const SunCalc = require('suncalc');
const Coordinates = require("coordinate-parser");

var wb_config = workspace.getConfiguration('workbench');
var ns_config = workspace.getConfiguration('nightswitch');
var autoswitch_enabled;
var show_autoswitch_msg_disabled;
var has_shown_fix_settings_once;

export function activate(context: ExtensionContext)
{
	autoswitch_enabled = ns_config.get('autoSwitch');
	show_autoswitch_msg_disabled = ns_config.get('disableAutoSwitchNotifications');
	has_shown_fix_settings_once = false;

	context.subscriptions.push(makeToggle());
	context.subscriptions.push(createCmdswitchThemeDay());
	context.subscriptions.push(createCmdswitchThemeNight());
	context.subscriptions.push(createCmdAutoSwitch());
	
	window.onDidChangeWindowState(recheck);
	window.onDidChangeActiveTextEditor(recheck);
	window.onDidChangeTextEditorViewColumn(recheck);
	workspace.onDidSaveTextDocument(function(d) {
		if(d.fileName.split('\\').pop().split('\/').pop() === 'settings.json')
		{
			reloadNightSwitchConfig();
			recheck();
		}
	});

	// recheck every 5 minutes
	setInterval(recheck, 1000 * 60 * 5);
}


function parseManualTime(time: string): number
{
	const regex = /^(\d{1,2})(?:\:|\s*)(\d{2}|)\s*((?:AM|PM)|)$/;
	const matches = regex.exec(time);
	if(!matches || !matches[1])
	{
		// must be non-empty and must have hour
		return null;
	}

	const today_start = new Date().setHours(0, 0, 0, 0);

	let h = Number(matches[1]);

	if(h < 0 || h >= 24)
	{
		return null;
	}

	if(matches[3].length != 0)
	{
		
		if(h > 12)
		{
			return null;
		}

		h %= 12;
		if(matches[3] === "PM")
		{
			h += 12;
		}
		// else if AM do nothing
	}

	let m = 0;

	if(matches[2].length != 0)
	{
		m = Number(matches[2]);
		if(m < 0 || m >= 60)
		{
			return null;
		}
	}

	let h_mil = h * 60 * 60 * 1000;
	let m_mil = m * 60 * 1000;

	return today_start + h_mil + m_mil;
}


function timeSwitch(currtime: number, srise: number, sset: number)
{
	const time_to_srise = srise - currtime,
		 time_to_sset  = sset  - currtime;

	if(time_to_srise > 0)
	{
		setThemeNight()
	}
	else if(time_to_sset > 0)
	{
		setThemeDay()
	}
	else
	{
		// this means it's after sunset but before midnight
		setThemeNight()
	}
}


function makeToggle()
{
	return commands.registerCommand('extension.toggleTheme', () =>
	{
		reloadConfig();
		var curr_theme = wb_config.get('colorTheme')
		if(curr_theme === ns_config.get('themeDay'))
		{
			showAutoSwitchMsg();
			setThemeNight();
		}
		else if(curr_theme === ns_config.get('themeNight'))
		{
			showAutoSwitchMsg();
			setThemeDay();
		}
		else
		{
			window.showInformationMessage('Your current theme is set to neither your day nor your night theme. Please update your settings.');
		}
	});
}

function switchThemeDay()
{
	showAutoSwitchMsg();
	setThemeDay();
}


function createCmdswitchThemeDay()
{
	return commands.registerCommand('extension.switchThemeDay', () => switchThemeDay());
}

function switchThemeNight()
{
	showAutoSwitchMsg();
	setThemeNight();
}

function createCmdswitchThemeNight()
{
	return commands.registerCommand('extension.switchThemeNight', () => switchThemeNight());
}

function autoSwitch()
{
	autoswitch_enabled = true;
	recheck();
}

function createCmdAutoSwitch()
{
	return commands.registerCommand('extension.autoSwitch', () => autoSwitch());
}


function parseCoordinates(coords: string)
{
	try
	{
		return new Coordinates(coords);
	}
	catch
	{
		window.showWarningMessage("Please set your coordinates in a valid format so that NightSwitch-lite can parse them (example: \"49.89,-97.14\").");
		return null;
	}
}


function setThemeNight()
{
	wb_config.update('colorTheme', ns_config.get('themeNight'), true)
}


function setThemeDay()
{
	wb_config.update('colorTheme', ns_config.get('themeDay'), true)
}

function showAutoSwitchMsg()
{
	if(!show_autoswitch_msg_disabled && autoswitch_enabled)
	{
		window.showInformationMessage('Automatic switching has been disabled for this session. ' +
								'To reenable, use the command "Enable Automatic Theme Switching".', 
								'Click here to reenable', 'Don\'t show this again'
								).then(
								function(str)
								{
									if(str === 'Click here to reenable')
									{
										autoSwitch();
									}
									else if(str === "Don't show this again")
									{
										show_autoswitch_msg_disabled = true;
										ns_config.update('disableAutoSwitchNotifications', true, true);
									}
								});
	}
	autoswitch_enabled = false;
}

function recheck()
{
	if(!autoswitch_enabled)
	{
		return;
	}
	
	reloadConfig();

	const curr_date = new Date();

	const location_str = ns_config.get<string>('location');
	const srise_str = ns_config.get<string>('sunrise');
	const sset_str  = ns_config.get<string>('sunset');

	let srise_time, sset_time;

	if(location_str)
	{

		let coords = parseCoordinates(location_str);

		const tmp_hours = curr_date.getHours();
		curr_date.setHours(12);

		const calc_times = SunCalc.getTimes(curr_date, coords.getLatitude(), coords.getLongitude());

		curr_date.setHours(tmp_hours);

		srise_time = calc_times.sunrise.getTime();
		sset_time = calc_times.sunset.getTime();

	}

	// takes precedence over location-based
	if(srise_str)
	{
		srise_time = parseManualTime(srise_str);
		if(!srise_time || Number.isNaN(srise_time))
		{
			window.showWarningMessage("Something went wrong with your manually set sunrise time. Please ensure you input a valid time.");
			return;
		}
	}

	if(sset_str)
	{
		sset_time = parseManualTime(sset_str);
		if(!sset_time || Number.isNaN(sset_time))
		{
			window.showWarningMessage("Something went wrong with your manually set sunset time. Please ensure you input a valid time.");
			return;
		}
	}

	if(typeof srise_time == "undefined" || typeof sset_time == "undefined")
	{
		if(!has_shown_fix_settings_once)
		{
			window.showInformationMessage("Please edit your settings to specify how NightSwitch-lite will locate you.",
				"Go to settings").then(fulfilled => {commands.executeCommand("workbench.action.openSettings")});
			has_shown_fix_settings_once = true;
		}
		return;
	}
	timeSwitch(curr_date.getTime(), srise_time, sset_time);
}

function reloadWorkbenchConfig()
{
	// get the current workbench configuration
	wb_config = workspace.getConfiguration('workbench');
}

function reloadNightSwitchConfig()
{
	// get the user config for nightswitch
	let new_ns_config = workspace.getConfiguration('nightswitch');
	if(new_ns_config.get('autoSwitch') != ns_config.get('autoSwitch'))
	{
		autoswitch_enabled = new_ns_config.get('autoSwitch');
	}
	if(new_ns_config.get('disableAutoSwitchNotifications') != ns_config.get('disableAutoSwitchNotifications'))
	{
		show_autoswitch_msg_disabled = new_ns_config.get('disableAutoSwitchNotifications');
	}
	ns_config = new_ns_config;
}

function reloadConfig()
{
	reloadWorkbenchConfig();
	reloadNightSwitchConfig();
}
