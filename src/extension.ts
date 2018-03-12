'use strict';
import * as vscode from 'vscode';

var stateListener = function(event){
	recheck();
};

var wbconfig = vscode.workspace.getConfiguration('workbench');
var nsconfig = vscode.workspace.getConfiguration('nightswitch');
var SunCalc;
var time;
const unreachable = [644, 105];

export function activate(context: vscode.ExtensionContext) {

	let toggle = makeToggle();
	let switchDay = makeSwitchDay();
	let switchNight = makeSwitchNight();
	let windowStateCheck = vscode.window.onDidChangeActiveTextEditor(recheck);

	context.subscriptions.push(toggle);
	context.subscriptions.push(switchDay);
	context.subscriptions.push(switchNight);
	context.subscriptions.push(windowStateCheck);

	SunCalc = require('suncalc')
	recheck();
	console.info('NSL: NightSwitch-Lite is now active!');
}


function parseManualTime(date: string, time: Date): number {
	const hm = date.split(':')
	const fullTime = time.getTime()
	const currentHours = time.getHours() * 60 * 60 * 1000
	const currentMinutes = time.getMinutes() * 60 * 1000
	const currentSeconds = time.getSeconds() * 1000
	const currentMilliseconds = time.getMilliseconds()

	const todayStart = fullTime - currentHours - currentMinutes - currentSeconds - currentMilliseconds

	const parsedTime = todayStart + (Number(hm[0]) * 60 * 60 * 1000) + (Number(hm[1]) * 60 * 1000)

	return parsedTime
}


function locationSwitch(coords: Number[], manualTimes: number[], forceSwitch: boolean) 
	{

	if (coords != unreachable) {
		var stimes = SunCalc.getTimes(time, coords[0], coords[1]);
	}

	const currtime = time.getTime()

	let srise = manualTimes[0]
	let sset = manualTimes[1]
	let srisetmrw = manualTimes[2]
	let ssettmrw = manualTimes[3]

	if (srise === -1 && coords != unreachable) {
		srise = stimes.sunrise.getTime()
		// set a virtual time 12hrs from now to get sunrise tomorrow
		const virtualtime = currtime + 24 * 60 * 60 * 1000;
		var stimestmrw = SunCalc.getTimes(new Date(virtualtime), coords[0], coords[1]);
		srisetmrw = stimestmrw.sunrise.getTime()
	}

	if (sset === -1 && coords != unreachable) {
		sset = stimes.sunset.getTime();
		//If we have location then we never should need sunset tomorrow
	}

	console.log('NSL: current time: ' + currtime)
	console.log('NSL: sunrise: ' + srise)
	console.log('NSL: sunset: ' + sset)

	timeSwitch(currtime, srise, sset, srisetmrw, ssettmrw, forceSwitch)
}


function timeSwitch(currtime: number, srise: number, sset: number, srisetmrw: number, ssettmrw: number, forceSwitch: boolean) {
	const timeToSunrise = srise - currtime,
		timeToSunset = sset - currtime;

	if (timeToSunrise > 0) {
		// obviously give priority to sunrise
		setThemeNight()
	}
	else if (timeToSunset > 0) {
			setThemeDay()
	}
	else {
		// this means it's after sunset but before midnight
		// if we are using manual time but dont specify one of them without location, then we don't assume anything

		if (!(srise == -1 || sset == -1)) {
			setThemeNight()
		}
	}
}


function makeToggle() {
	return vscode.commands.registerCommand('extension.toggleTheme', () => {
		reload()
		var currentTheme = wbconfig.get<string>('colorTheme'),
			dayTheme = nsconfig.get<string>('dayTheme'),
			nightTheme = nsconfig.get<string>('nightTheme');

		if (currentTheme === dayTheme) {
			setThemeNight()
		}
		else if (currentTheme === nightTheme) {
			setThemeDay()
		}
		else {
			vscode.window.showInformationMessage('Your current theme is not set to either your day or night theme. Please update your settings.');
		}
	});
}


function makeSwitchDay() {
	return vscode.commands.registerCommand('extension.switchDay', () => {
		setThemeDay()
	});
}


function makeSwitchNight() {
	return vscode.commands.registerCommand('extension.switchNight', () => {
		setThemeNight()
	});
}


function parseCoordinates(coords: string): number[] {
	const splcoords = coords.replace(/\(|\)/g, '').split(/,/);
	return new Array(Number(splcoords[0]), Number(splcoords[1]))
}


function setThemeNight() {
	wbconfig.update('colorTheme', nsconfig.get<string>('nightTheme'), true);
}


function setThemeDay() {
	wbconfig.update('colorTheme', nsconfig.get<string>('dayTheme'), true);
}

function recheck()
{
	reload()
	const srisestr = nsconfig.get<string>('sunrise')
	const ssetstr = nsconfig.get<string>('sunset')

	time = new Date();
	let srisemanual = -1
	let ssetmanual = -1
	let srisetmrwmanual = -1
	let ssettmrwmanual = -1

	if (srisestr != null) {
		srisemanual = parseManualTime(srisestr, time)
		srisetmrwmanual = srisemanual + 24 * 60 * 60 * 1000
	}

	if (ssetstr != null) {
		ssetmanual = parseManualTime(ssetstr, time)
		ssettmrwmanual = ssetmanual + 24 * 60 * 60 * 1000
	}

	const manualTimes = [srisemanual, ssetmanual, srisetmrwmanual, ssettmrwmanual]
	const forceSwitch = nsconfig.get<boolean>('forceSwitch')

	if (nsconfig.get('location') != null) {
		const coords = parseCoordinates(nsconfig.get<string>('location'))
		if (Number.isNaN(coords[0]) || Number.isNaN(coords[1])) {
			vscode.window.showWarningMessage('Set your coordinates in the form \"(xxx.xxxx,yyy.yyyy)\" for proper usage of NightSwitch-lite.')
		}
		else {
			console.log('NSL: (' + coords[0] + ',' + coords[1] + ')');
			locationSwitch(coords, manualTimes, forceSwitch)
		}
	}
	else if (nsconfig.get('sunrise') != null || nsconfig.get('sunset') != null) {

		//set coords to unreachable value
		locationSwitch(unreachable, manualTimes, forceSwitch)
	}
}


function reload() {
	// get the current workbench configuration
	wbconfig = vscode.workspace.getConfiguration('workbench');
	// get the user config for nightswitch
	nsconfig = vscode.workspace.getConfiguration('nightswitch');
}