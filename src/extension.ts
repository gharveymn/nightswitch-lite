'use strict';
import {workspace, window, commands, ExtensionContext} from 'vscode';

const SunCalc = require('suncalc');

var wb_config = workspace.getConfiguration('workbench');
var ns_config = workspace.getConfiguration('nightswitch');
var has_shown_fix_settings_once;

export function activate(context: ExtensionContext)
{
	has_shown_fix_settings_once = false;

	recheck();

	context.subscriptions.push(makeToggle());
	context.subscriptions.push(createCmdSwitchDay());
	context.subscriptions.push(createCmdSwitchNight());
	context.subscriptions.push(createCmdAutoSwitch());
	context.subscriptions.push(window.onDidChangeWindowState(recheck));
	context.subscriptions.push(window.onDidChangeActiveTextEditor(recheck));
	context.subscriptions.push(window.onDidChangeTextEditorViewColumn(recheck));

	// recheck every 5 minutes
	setInterval(recheck, 1000 * 60 * 5);
	console.info('NightSwitch-Lite is now active!');
}


function parseManualTime(time: string, date: Date): number
{
	const hm = time.split(':');
	const full_time = date.getTime();
	const curr_hrs = date.getHours() * 60 * 60 * 1000;
	const curr_mins = date.getMinutes() * 60 * 1000;
	const curr_secs = date.getSeconds() * 1000;
	const curr_ms = date.getMilliseconds();

	const today_start = full_time - curr_hrs - curr_mins - curr_secs - curr_ms;

	return today_start + (Number(hm[0]) * 60 * 60 * 1000) + (Number(hm[1]) * 60 * 1000);
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
		var curr_theme = wb_config.get<string>('colorTheme')

		if(curr_theme === ns_config.get<string>('dayTheme'))
		{
			ns_config.update('autoSwitch', false, true);
			setThemeNight();
			showAutoSwitchMsg();
		}
		else if(curr_theme === ns_config.get<string>('nightTheme'))
		{
			ns_config.update('autoSwitch', false, true);
			setThemeDay();
			showAutoSwitchMsg();
		}
		else
		{
			window.showInformationMessage('Your current theme is set to neither your day nor your night theme. Please update your settings.');
		}
	});
}

function switchDay()
{
	ns_config.update('autoSwitch', false, true);
	setThemeDay();
	showAutoSwitchMsg();
}


function createCmdSwitchDay()
{
	return commands.registerCommand('extension.switchDay', () => switchDay());
}

function switchNight()
{
	ns_config.update('autoSwitch', false, true);
	setThemeNight();
	showAutoSwitchMsg();
}

function createCmdSwitchNight()
{
	return commands.registerCommand('extension.switchNight', () => switchNight());
}

function autoSwitch()
{
	ns_config.update('autoSwitch', true, true);
	recheck();
}

function createCmdAutoSwitch()
{
	return commands.registerCommand('extension.autoSwitch', () => autoSwitch());
}


function parseCoordinates(coords: string): number[]
{
	if(coords)
	{
		const splcoords = coords.replace(/\(|\)| /g, '').split(/,/);
		return new Array(Number(splcoords[0]), Number(splcoords[1]))
	}
	else
	{
		return null;
	}
}


function setThemeNight()
{
	wb_config.update('colorTheme', ns_config.get<string>('nightTheme'), true)
}


function setThemeDay()
{
	wb_config.update('colorTheme', ns_config.get<string>('dayTheme'), true)
}

function showAutoSwitchMsg()
{
	if(!ns_config.get<boolean>('disableAutoSwitchNotifications'))
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
										ns_config.update('disableAutoSwitchNotifications', true, true);
									}
								});
	}
}

function recheck()
{

	if(!ns_config.get<boolean>('autoSwitch'))
	{
		return;
	}

	reloadConfig();

	const curr_date = new Date(),
		 coords = parseCoordinates(ns_config.get<string>('location'));

	let srise_str = ns_config.get<string>('sunrise');
	let sset_str = ns_config.get<string>('sunset');

	let srise_time, sset_time;

	if(coords && (Number.isNaN(coords[0]) || Number.isNaN(coords[1])))
	{
		window.showWarningMessage("Please set your coordinates in decimal degrees so that NightSwitch-lite can parse them (example: \"(49.89,-97.14)\").");
		return;
	}

	if(coords)
	{

		const tmp_hours = curr_date.getHours();
		curr_date.setHours(12);

		const calc_times = SunCalc.getTimes(curr_date, coords[0], coords[1]);

		curr_date.setHours(tmp_hours);

		srise_time = calc_times.sunrise.getTime();
		sset_time = calc_times.sunset.getTime();

	}

	// takes precedence over location-based
	if(srise_str)
	{
		srise_time = parseManualTime(srise_str, curr_date);
		if(Number.isNaN(srise_time))
		{
			window.showWarningMessage("Something went wrong with your manually set sunrise time. Please use 24-hour format (HH:MM).");
			return;
		}
	}

	if(sset_str)
	{
		sset_time = parseManualTime(sset_str, curr_date);
		if(Number.isNaN(sset_time))
		{
			window.showWarningMessage("Something went wrong with your manually set sunset time. Please use 24-hour format (HH:MM).");
			return;
		}
	}

	if((typeof srise_time == "undefined") || typeof sset_time == "undefined")
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


function reloadConfig()
{
	// get the current workbench configuration
	wb_config = workspace.getConfiguration('workbench');
	// get the user config for nightswitch
	ns_config = workspace.getConfiguration('nightswitch');
}
