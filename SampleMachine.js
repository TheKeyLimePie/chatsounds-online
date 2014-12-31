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

function SampleMachine ()
{
	this.INPUT = "#search-string";		//DOM ID of text input
	this.AUDIO = "#audio-element";		//DOM ID of audio tag
	this.AUDIOSRC = "#audio-src";		//DOM ID of audio source
	this.CACHE = "#audio-element-cache";
	this.CACHESRC = "#audio-src-cache";
	this.SVNPATH = "https://garrysmod-chatsounds.googlecode.com/svn/trunk/sound/";
	this.URL = "http://chatsounds.3kelv.in/";
	
	this.PLAYPAUSE = "#playerbox_controls_play";
	this.SKIP = "#playerbox_controls_skip";
	this.REPLAY = "#playerbox_controls_replay";
	this.VOLUMESLIDER = "#playerbox_volume_slider";
	this.VOLUME = "#playerbox_volume_volume";
	this.SEEK = "#headbar_seek";
	this.TIMELINE = "#timeline_cardline";
	
	this.OPTIONS = ["#","*"];
	this.OPTIONSWORD = ["#exemplar#","#repeat#"];
	this.OPTIONSVALUES = [];									//not in use, dispensable
	
	this.rawInput = new Array ();								//splitted Input is saved here; array of objects
	this.sampleDB = new Samplebase ();							//object of Samplebase
	this.parameters = new URLParameter ();						//object of URLParameter
	this.jukebox = new Jukebox (this.AUDIO, this.AUDIOSRC, this.SVNPATH, this.PLAYPAUSE, this.SKIP, this.REPLAY, this.VOLUMESLIDER, this.VOLUME, this.SEEK, this.TIMELINE);
	this.topResults = new Array ();								//shown in suggestions list
	this.samples = new Array ();
}

SampleMachine.prototype.clearSamples = function ()
{
	this.samples = [];
}

SampleMachine.prototype.addSample = function (sampleObj)
{
	this.samples.push(sampleObj);
}

//* returns input of form input
SampleMachine.prototype.getInput = function ()
{
	return $(this.INPUT).val().toLowerCase();
}

//* sets input of form input
SampleMachine.prototype.setInput = function (string)
{
	$(this.INPUT).val(string);
}

//* replaces options in a request string like '#' or '*' -> avoid reg. expr.
SampleMachine.prototype.replaceOptions = function (string)
{
	for (var x = 0; x < this.OPTIONS.length; x++)
	{
		string = string.replace(this.OPTIONS[x], this.OPTIONSWORD[x]);
	}
	return string;
}

//* extracts the sample name out of a request string; "hello#exemplar#2#repeat#4" -> "hello"
SampleMachine.prototype.extractName = function (string)
{
	var limit = string.length;
	for (var x = 0; x < this.OPTIONSWORD.length; x++)
	{
		var index = string.search(this.OPTIONSWORD[x]) >= 0 ? string.search(this.OPTIONSWORD[x]) : index;
		limit = limit > index ? index : limit;
	}
	return string.substring(0, limit).trim();
}

//* returns a specific option value of a request string; "hello#exemplar#2#repeat#4", "#exemplar#" -> "2"
SampleMachine.prototype.getOption = function (string, option)
{
	var value = "-1";
	if (string.search(option) > -1)
	{
		value = "";
		for (var x = string.search(option) + option.length; !isNaN(string.charAt(x)) && string.charAt(x) != ""; x++)	//as long as character at y is a number -> implies that options can be numbers only
		{
			value = value.concat(string.charAt(x));
		}
	}
	return value;
}

//* returns matches (array of objects) where input string == results[x].name
SampleMachine.prototype.getMatches = function (input)
{
	var equal = new Array ();
	var results = this.search(input);
	for (var x = 0; x < results.length; x++)
	{
		if (input == results[x].name)
			equal.push(results[x]);
	}
	return equal;
}

//* checks if the #exemplar# parameter is valid and returns an index for possible samples
SampleMachine.prototype.getReliableExemplarOption = function (rawInput, possibleObjects)
{
	var exemplar = rawInput[this.OPTIONSWORD[0]];
	
	if ($.isEmptyObject(rawInput[this.OPTIONSWORD[0]]) || exemplar < 1)
		return parseInt(Math.random()*possibleObjects.length);
	else
	{
		if (exemplar <= possibleObjects.length && exemplar > 0)
			return exemplar - 1;
		else if (exemplar > possibleObjects.length)
			return possibleObjects.length - 1;
		else
			return -1;
	}
}

//* returns a random sample name
SampleMachine.prototype.getRandom = function ()
{
	var randomFileFolder = parseInt(Math.random()*this.sampleDB.getDB().length);
	var files = Object.keys(this.sampleDB.getDB()[randomFileFolder]);
	var randomFile = parseInt(Math.random()*files.length);
	
	return files[randomFile];
}

//* gets input, splits it to single sample requests, replaces options, creates an object in this.rawInput for every request string with ordered attributes ("name", "#exemplar#",...)
SampleMachine.prototype.handleInput = function ()
{
	this.rawInput = [];

	var input = this.getInput();

	var splittedInput = input.split(",");
		
	for (var x = 0; x < splittedInput.length; x++)
	{
		splittedInput[x] = this.replaceOptions(splittedInput[x]);
		
		var rawSample = new Object ();
		rawSample.name = this.extractName (splittedInput[x]);
		
		for (var y = 0; y < this.OPTIONSWORD.length; y++)
		{
			rawSample[this.OPTIONSWORD[y]] = this.getOption (splittedInput[x], this.OPTIONSWORD[y]) == -1 ? 1 : this.getOption (splittedInput[x], this.OPTIONSWORD[y]);
		}
		
		this.rawInput[x] = rawSample;
	}
}

//* receives input string, requests matches with input string ( this.search() ) and saves found names in this.topResults
SampleMachine.prototype.liveSearch = function (string)
{
	if (string.trim() == "")
	{
		showSugg ([]);
		return;
	}
	
	this.topResults = [];
	var results = this.search(string.trim());
	
	var added = 0;
	for (var x = 0; x < results.length; x++)
	{
		//* if the result is already in the list (e.g. same sample names from different folders can cause this) do not push it to topResults again
		var doppelganger = 0;
		for (var y = 0; y < this.topResults.length; y++)
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
		
	showSugg (this.topResults);
}

//* gets string and saves the name and path of matches; string can be substring of results.sample.name !; string:"youtube" -> "hello youtube" is a 'match'
//* returns an array with simple objects containing matches
SampleMachine.prototype.search = function (string)
{
	var samples = this.sampleDB.getDB();
	var results = new Array ();
	for (var x = 0; x < samples.length; x++)
	{
		$.each(samples[x], function (key, value)
		{
			if (key.search(string) > -1)
			{
				for (var y = 0; y < value.length; y++)
				{	
					var sample = new Object();
					sample.name = key;
					sample.path = value[y]["path"];
					results.push(sample);
				}
			}
		});
	}
	
	return results;
}

//* takes every rawInput, looks for matching samples and creates a Sample object in jukebox
SampleMachine.prototype.makeQueue = function ()
{
	for(var x = 0; x < this.rawInput.length; x++)
	{
		if(this.rawInput[x].name == "random")
			this.rawInput[x].name = this.getRandom ();

		var input = rawInput[x].name;
		var rest = "";


			var splitted = input.split(" ");
			//it kinda works like longest-matching prefix
			for(var a = splitted.length; a > 0; a--)
			{
				var assembledString = "";
				for(var b = 0; b < a; b++)
				{
					assembledString.concat(splitted[b]," ");
				}
				assembledString = assembledString.trim();
				
				var matches = this.getMatches(assembledString);
				
				if(!$.isEmptyObject(matches))
				{
					var index = this.getReliableExemplarOption(this.rawInput[x], matches);
					var repetitions = this.rawInput[x][this.OPTIONSWORD[1]] == "" ? 1 : this.rawInput[x][this.OPTIONSWORD[1]];
					
					this.addSample(new Sample(matches[index]["name"], matches[index]["path"], index + 1, repetitions, x));
					this.jukebox.insert(this.samples[this.samples.length - 1]);
					
					//!!!!!!!!!!
					if(a == splitted.length)
						break;
				}
				
				rest = "";
				for(var b = 0; b < splitted.length - a; b++)
				{
					rest.concat(splitted[splitted.length - b]," ");
				}
				rest = rest.trim();
				// Problem: rest muss wieder abgesucht werden wie "splitted" -> wie aufrufen?; außerdem: Attribute wie Wiederholungen müssen neu zugeordnet werden
			}

	}
}

//* generates a link to share with the sample queue
SampleMachine.prototype.generateLink = function ()
{
	var stringParam = this.URL.concat("?s=");
	for (var x = 0; x < this.samples.length; x++)
	{
		stringParam = stringParam.concat(encodeURIComponent(this.samples[x].name));
		for (var y = 0; y < this.OPTIONSWORD.length; y++)
		{
			stringParam = stringParam.concat(encodeURIComponent(this.OPTIONS[y]));
			var param = this.OPTIONSWORD[y].substring(1,this.OPTIONSWORD[y].length - 1);
			stringParam = stringParam.concat(encodeURIComponent(this.samples[x][param]));
		}
		stringParam = stringParam.concat(",");
	}
	return stringParam.substring(0, stringParam.length - 1);
}

//* requests a shortened link from bit.ly over getShorty.php for a given link, needs a handle function
SampleMachine.prototype.shorty = function (longUrl, handleFunction)
{
	$.post("getShorty.php", {url: longUrl}, function(data)
	{
		if(data.substr(0, 5) == "ERROR")
		{
			var error = new Notification("Oops", "We had a problem with bit.ly<br /><br />".concat(data.slice(6)), true, 1);
			error.init();
		}
		else
			handleFunction(data);
	});
}

//* starts a requests to bit.ly with current custom link and shows it in a textbox
SampleMachine.prototype.setShorty = function ()
{
	this.shorty (this.generateLink (), function (url)
	{
		showLink (1, url);
	});
}

//* returns a cookie, -1 when no cookie was found
SampleMachine.prototype.getCookie = function (string)
{
	var cookies = document.cookie;
	var cookies = cookies.split(";");
	for (var x = 0; x < cookies.length; x++)
	{
		cookies[x] = cookies[x].trim();
		var index = cookies[x].search(string);
		if (index == 0)
		{
			return cookies[x].substring(string.length + 1);
		}
	}
	return -1;
}

//* creates a cookie, duration in minutes
SampleMachine.prototype.setCookie = function (name, value, duration)
{
	var d = new Date ();
	d.setMinutes (d.getMinutes() + duration);
	var cookie = name.concat("=",value,"; expires=", d.toUTCString());
	document.cookie = cookie;
}

//* caches all the sample files before playing it - use it recursively
//SampleMachine.prototype.cacheSample = function (x, callback)
//{
//	if (x >= this.samples.length)
//	{
//		console.log("Caching completed!");
//		callback().call(this);
//		return true;
//	}
//	var bindThis = this;
//	$(this.CACHESRC).attr("src", this.SVNPATH.concat(this.samples[x].path));
//	$(this.CACHE).load();
//	console.log("Cache file: " + this.samples[x].path);
//	$(this.CACHE).one("canplaythrough", function (e)
//	{
//		bindThis.cacheSample(x + 1, callback).bind(bindThis);
//	});
//}

//* centre of chatsounds
SampleMachine.prototype.action = function ()
{
	this.jukebox.clearQueue ();
	this.clearSamples ();
	showSugg ([]);
	showLink (0);
	this.handleInput ();
	this.makeQueue ();
	this.setInput ("");
	if (this.samples.length > 0)
		showLink (1, this.generateLink ());
	this.jukebox.startQueue ();
//	this.cacheSample (0, this.jukebox.startQueue ());
}