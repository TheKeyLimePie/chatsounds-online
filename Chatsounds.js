/*
  Chatsounds Online - A web service to access MetaConstruct's Chatsounds on the internet
  Copyright (C) 2014 KeyLimePie (https://github.com/TheKeyLimePie)

  This program is free software; you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation; either version 3 of the License, or
  (at your option) any later version.
  
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.
  
  You should have received a copy of the GNU General Public License
  along with this program; if not, write to the Free Software Foundation,
  Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301  USA
*/

function Chatsounds()
{
	this.INPUT = "#search-string";			//DOM ID of text input
	this.AUDIO = "#audio-element";			//DOM ID of audio tag
	this.AUDIOSRC = "#audio-src";			//DOM ID of audio source
	this.SVNPATH = "https://garrysmod-chatsounds.googlecode.com/svn/trunk/sound/";
	this.URL = "http://cs.3kv.in/";
	
	var audio = document.createElement("audio");
	audio.setAttribute("id", this.AUDIO.substr(1,this.AUDIO.length));
	var src = document.createElement("source");
	src.setAttribute("id", this.AUDIOSRC.substr(1,this.AUDIOSRC.length));
	src.setAttribute("type", "audio/ogg");
	src.setAttribute("src", "");
	audio.appendChild(src);
	document.body.appendChild(audio);
	
	this.PARAMETER = ["#","*"];				
	this.PARAMETERWORD = ["#xItem#","#repeat#"];
	
	//UI REFERENCES
	this.PLAYPAUSE = "#playerbox_controls_play";
	this.SKIP = "#playerbox_controls_skip";
	this.REPLAY = "#playerbox_controls_replay";
	this.BACK = "#playerbox_controls_back";
	this.FORTH = "#playerbox_controls_forth";
	this.VOLUMESLIDER = "#playerbox_volume_slider";
	this.VOLUME = "#playerbox_volume_volume";
	this.SEEK = "#headbar_seek";
	this.TIMELINE = "#timeline_cardline";
	this.BACKTXT = "#playerbox_history_back";
	this.FORTHTXT = "#playerbox_history_forth";
	
	this.history = new History();
	this.handledInput = new Array();							//handled input is saved here; array of objects
	this.sampleDB = new Samplebase();							//object of Samplebase
	this.parameters = new URLParameter();						//object of URLParameter
	//Note: Use Decorator pattern in future
	this.jukebox = new Jukebox(this.INPUT, this.AUDIO, this.AUDIOSRC, this.SVNPATH, this.PLAYPAUSE, this.SKIP, this.REPLAY, this.BACK, this.FORTH, this.VOLUMESLIDER, this.VOLUME, this.SEEK, this.TIMELINE);
	this.topResults = new Array();								//shown in suggestions list
	this.samples = new Array();									//Sample objects are saved here
	this.liveSearchPointer = new Array();
}

//* centre of chatsounds
Chatsounds.prototype.action = function()
{
	this.jukebox.clearQueue();
	this.clearLiveSearchPointer();
	this.clearSamples();
	showSugg([]);
	showLink(0);
	this.handleInput();
	this.makeQueue();
	this.setInput("");
	if(this.samples.length > 0)
	{
		showLink(1, this.generateLink());
		this.saveToHistory();
	}
		
	this.jukebox.startQueue();
	$(this.INPUT).blur();
}

Chatsounds.prototype.clearSamples = function()
{
	this.samples = [];
}

Chatsounds.prototype.addSample = function(sampleObj)
{
	this.samples.push(sampleObj);
}

//* returns input of form input
Chatsounds.prototype.getInput = function()
{
	return $(this.INPUT).val().toLowerCase();
}

//* sets input of form input
Chatsounds.prototype.setInput = function(string)
{
	$(this.INPUT).val(string);
}

Chatsounds.prototype.getLiveSearchPointer = function()
{
	return this.liveSearchPointer.length == 0 ? 0 : this.liveSearchPointer[this.liveSearchPointer.length - 1];
}

Chatsounds.prototype.addLiveSearchPointer = function(val)
{
	this.liveSearchPointer.push(val);
}

Chatsounds.prototype.revLiveSearchPointer = function()
{
	this.liveSearchPointer.pop();
}

Chatsounds.prototype.clearLiveSearchPointer = function()
{
	this.liveSearchPointer = new Array();
}

//* replaces parameters in a request string like '#' or '*' -> avoid reg. expr.
Chatsounds.prototype.replaceParameters = function(string)
{
	for(var x = 0; x < this.PARAMETER.length; x++)
	{
		string = string.replace(this.PARAMETER[x], this.PARAMETERWORD[x]);
	}
	return string;
}

//* extracts the sample name out of a request string; "hello#xItem#2#repeat#4" -> "hello"
Chatsounds.prototype.getName = function(string)
{
	var limit = string.length;
	for(var x = 0; x < this.PARAMETERWORD.length; x++)
	{
		var index = string.search(this.PARAMETERWORD[x]) >= 0 ? string.search(this.PARAMETERWORD[x]) : index;
		limit = limit > index ? index : limit;
	}
	return string.substring(0, limit).trim();
}

//* returns a specific parameter value of a request string; "hello#xItem#2#repeat#4", "#xItem#" -> "2"
Chatsounds.prototype.getParameter = function(string, param)
{
	var value = "-1";
	if(string.search(param) > -1)
	{
		value = "";
		for(var x = string.search(param) + param.length; !isNaN(string.charAt(x)) && string.charAt(x) != ""; x++)	//as long as character at y is a number -> implies that params can be numbers only
		{
			value = value.concat(string.charAt(x));
		}
	}
	return value;
}

//* gets input, splits it to single sample requests, replaces options, creates an object in this.handledInput for every request string with ordered attributes ("name", "#xItem#",...)
Chatsounds.prototype.handleInput = function()
{
	this.handledInput = [];

	var input = this.getInput();
	console.log("Read input: \"" + input + "\"");
	//insert a comma after each possible parameter -> avoids that validate "forgets" the rest after a parameter (validate gets handledInput)
	var pattern = /((#)[0-9]+|(\*)[0-9]+)(?!\2\3)(#[0-9]+|\*[0-9]+)?/g;
	var repl = "$&,";
	input = input.replace(pattern, repl);
	
	var splittedInput = input.split(",");
		
	for(var x = 0; x < splittedInput.length; x++)
	{
		splittedInput[x] = this.replaceParameters(splittedInput[x]);
		
		var inputObject = new Object ();
		inputObject.name = this.getName(splittedInput[x]);
		
		for(var y = 0; y < this.PARAMETERWORD.length; y++)
		{
			inputObject[this.PARAMETERWORD[y]] = this.getParameter(splittedInput[x], this.PARAMETERWORD[y]) == -1 ? 1 : this.getParameter(splittedInput[x], this.PARAMETERWORD[y]);
		}
		
		this.handledInput[x] = inputObject;
	}
	
	var validatedInput = new Array();
	for(var x = 0; x < this.handledInput.length; x++)
	{
		var validated = this.validate(this.handledInput[x]);
		for(var y = 0; y < validated.length; y++)
		{
			validatedInput.push(validated[y]);
		}
	}
	
	this.handledInput = validatedInput;
	var s = "";
	for(var x = 0; x < this.handledInput.length; x++)
	{
		s = s.concat(x + ":" + this.handledInput[x].name, "|");
	}
	console.log("Validated input: " + s);
}

//* returns matches (array of objects) where input string == results[x].name
Chatsounds.prototype.getMatches = function(input)
{
	var equal = new Array ();
	var results = this.search(input);
	for(var x = 0; x < results.length; x++)
	{
		if(input == results[x].name)
			equal.push(results[x]);
	}
	return equal;
}

//* checks if the #xItem# parameter is valid and returns an index for possible samples
Chatsounds.prototype.checkItem = function(handledInput, matches, prevPath)
{
	var xItem = handledInput[this.PARAMETERWORD[0]];
	
	if ($.isEmptyObject(handledInput[this.PARAMETERWORD[0]]) || xItem < 1)
	{
		//check if there is a sample in the same (previous) folder -> consistency of sample queues
		if(prevPath)
		{
			prevPath = prevPath.substring(19, prevPath.length); //remove "chatsounds/autoadd/"
			prevPath = prevPath.match(/.*\//g)[0]; //get folder name with "/" -> e.g. "gabe/"
			for(var x = 0; x < matches.length; x++)
			{
				var testPath = matches[x].path.substring(19, matches[x].path.length);
				if(testPath.search(prevPath) == 0)
					return x;
			}
		}
		
		return parseInt(Math.random()*matches.length);
	}	
	else
	{
		if(xItem <= matches.length && xItem > 0)
			return xItem - 1;
		else if(xItem > matches.length)
			return matches.length - 1;
		else
			return -1;
	}
}

//* returns a random sample name
Chatsounds.prototype.getRandomSample = function()
{
	var randomFileFolder = parseInt(Math.random()*this.sampleDB.getDB().length);
	var files = Object.keys(this.sampleDB.getDB()[randomFileFolder]);
	var randomFile = parseInt(Math.random()*files.length);
	
	return files[randomFile];
}

//* gets string and saves the name, duration and path of matches; string can be substring of results.sample.name; string:"youtube" -> "hello youtube" is a 'match'
//* returns an array with simple objects containing matches
Chatsounds.prototype.search = function(string)
{
	var samples = this.sampleDB.getDB();
	var results = new Array();
	for(var x = 0; x < samples.length; x++)
	{
		$.each(samples[x], function(key, value)
		{
			if(key.search(string) > -1)
			{
				for(var y = 0; y < value.length; y++)
				{	
					var sample = new Object();
					sample.name = key;
					sample.path = value[y]["path"];
					sample.length = value[y]["length"];
					results.push(sample);
				}
			}
		});
	}
	
	return results;
}

//* it works like longest-matching prefix: it looks for the longest possible sample name; "hello my name is gaben" -> "hello my name is" -> "hello my name" -> ...; stops with shortening when a matching sample was found and starts a recursion with the rest term
Chatsounds.prototype.validate = function(handledInput)
{
	var input = handledInput.name;
	var rest = "";
	var words = input.split(" ");
	
	//starts with full length, shortens the string
	for(var x = words.length; x > 0; x--)
	{
		var mergedString = "";
		//"fills up" the string until limit is reached
		for(var y = 0; y < x; y++)
		{
			mergedString = mergedString.concat(words[y], " ");
		}
		var mergedString = mergedString.trim();
		
		//random feature
		if(mergedString == "random")
			mergedString = this.getRandomSample();
			
		var matches = this.getMatches(mergedString);
		
		rest = "";
		
		//remaining string - "this is a test" -> "this is" => "a test"
		for(var a = 0; a < words.length - x; a++)
		{
			rest = rest.concat(words[x+a], " ");
		}
		rest = rest.trim();		
		
		var value = new Object();
		var restValue = new Object();
		value.name = mergedString;
		restValue.name = rest;
		
		//assign parameters (e.g. item number, repetitions,...) to the remaining string
		for(var z = 0; z < this.PARAMETERWORD.length; z++)
		{
			value[this.PARAMETERWORD[z]] = 1;
			restValue[this.PARAMETERWORD[z]] = handledInput[this.PARAMETERWORD[z]];
		}
		
		if(!$.isEmptyObject(matches))
		{
			var ret = new Array();
			ret.push(value);
			var restRet = this.validate(restValue);
			
			//if the remaining string doesn't give any results then return the merged string only
			if($.isEmptyObject(restRet))
			{
				for(var a = 0; a < this.PARAMETERWORD.length; a++)
				{
					ret[ret.length-1][this.PARAMETERWORD[a]] = handledInput[this.PARAMETERWORD[a]];
				}
				return ret;
			}
			ret = ret.concat(restRet);
			return ret;
		}
	}
	
	return (rest == "" ? new Object() : this.validate(restValue));
}

//* takes every handledInput, looks for matching samples and creates a Sample object in jukebox
Chatsounds.prototype.makeQueue = function()
{
	for(var x = 0; x < this.handledInput.length; x++)
	{
		var matches = this.getMatches(this.handledInput[x].name);
		if(!$.isEmptyObject(matches))
		{
			var prevPath = x == 0 ? "" : this.samples[x-1].path;
			var index = this.checkItem(this.handledInput[x], matches, prevPath);
			var repetitions = this.handledInput[x][this.PARAMETERWORD[1]] == "" ? 1 : this.handledInput[x][this.PARAMETERWORD[1]];
			
			this.addSample(new Sample(matches[index]["name"], matches[index]["path"], index + 1, repetitions, x));
			this.jukebox.insert(this.samples[this.samples.length - 1]);
		}
	}
}

//* adds current queue to history
Chatsounds.prototype.saveToHistory = function()
{
	this.history.push(this.samples);
	this.applyHistoryLength();
}

//* plays the previous queue
Chatsounds.prototype.historyBack = function()
{
	this.samples = this.history.getPrev();
	this.jukebox.clearQueue();
	for(var x = 0; x < this.samples.length; x++)
	{
		this.jukebox.insert(this.samples[x]);
	}
	this.applyHistoryLength();
	showLink(1, this.generateLink());
	this.jukebox.startQueue(0);
}

//* plays the following queue
Chatsounds.prototype.historyForth = function()
{
	this.samples = this.history.getFollowing();
	this.jukebox.clearQueue();
	for(var x = 0; x < this.samples.length; x++)
	{
		this.jukebox.insert(this.samples[x]);
	}
	this.applyHistoryLength();
	showLink(1, this.generateLink());
	this.jukebox.startQueue(0);
}

//* updates stack size infos to UI
Chatsounds.prototype.applyHistoryLength = function()
{
	var sizes = this.history.getSizes();
	if(sizes[0] != 0 || sizes[1] != 0) //you don't need this info as long as you haven't saved any history
	{
		$(this.BACKTXT).html(sizes[0]);
		$(this.FORTHTXT).html(sizes[1]);
	}
	else
	{
		$(this.BACKTXT).html("");
		$(this.FORTHTXT).html("");
	}
}

//################################# UI STUFF #################################

//* receives input string, requests matches with input string ( this.search() ) and saves found names in this.topResults
Chatsounds.prototype.liveSearch = function(string)
{
	if(string.trim() == "")
	{
		showSugg([]);
		return;
	}
	
	this.topResults = [];
	var results = this.search(string.trim());
	results.sort(function(a, b){return a.name.length - b.name.length});
	
	var added = 0;
	for(var x = 0; x < results.length; x++)
	{
		//* if the result is already in the list (e.g. same sample names from different folders can cause this) do not push it to topResults again
		var doppelganger = 0;
		for(var y = 0; y < this.topResults.length; y++)
		{
			if (this.topResults[y] == results[x].name)
				doppelganger++;
		}
		if (!doppelganger)
		{
			this.topResults.push(results[x].name);
			added++;
		}
		if (added == LIST_LENGTH)
			break;
	}
		
	showSugg(this.topResults);
}

//* generates a link to share with the sample queue
Chatsounds.prototype.generateLink = function()
{
	var stringParam = this.URL.concat("?s=");
	for(var x = 0; x < this.samples.length; x++)
	{
		stringParam = stringParam.concat(encodeURIComponent(this.samples[x].name));
		for (var y = 0; y < this.PARAMETERWORD.length; y++)
		{
			stringParam = stringParam.concat(encodeURIComponent(this.PARAMETER[y]));
			var param = this.PARAMETERWORD[y].substring(1,this.PARAMETERWORD[y].length - 1);
			stringParam = stringParam.concat(encodeURIComponent(this.samples[x][param]));
		}
		stringParam = stringParam.concat(",");
	}
	return stringParam.substring(0, stringParam.length - 1);
}

//* requests a shortened link from bit.ly over getShorty.php for a given link, needs a handle function
Chatsounds.prototype.getShorty = function(longUrl, handleFunction)
{
	$.post("getShorty.php", {url: longUrl}, function(data)
	{
		if(data.substr(0, 5) == "ERROR")
		{
			var error = new Notification("Oops", "We had a problem with bit.ly<br /><br />".concat(data.slice(6)), true, Notification.status.ERROR);
			error.init();
		}
		else
			handleFunction(data);
	});
}

//* starts a requests to bit.ly with current custom link and shows it in a textbox
Chatsounds.prototype.setShorty = function()
{
	this.getShorty(this.generateLink(), function(url)
	{
		showLink(1, url);
	});
}

//* returns a cookie, -1 when no cookie was found
Chatsounds.prototype.getCookie = function(string)
{
	var cookies = document.cookie;
	var cookies = cookies.split(";");
	for(var x = 0; x < cookies.length; x++)
	{
		cookies[x] = cookies[x].trim();
		var index = cookies[x].search(string);
		if(index == 0)
		{
			return cookies[x].substring(string.length + 1);
		}
	}
	return -1;
}

//* creates a cookie, duration in minutes
Chatsounds.prototype.setCookie = function(name, value, duration)
{
	var d = new Date ();
	d.setMinutes(d.getMinutes() + duration);
	var cookie = name.concat("=",value,"; expires=", d.toUTCString());
	document.cookie = cookie;
}