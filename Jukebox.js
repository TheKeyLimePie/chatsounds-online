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

function Jukebox(input, audioelem, audiosrc, svnpath, playpause, skip, replay, volumeslider, volume, seek, timeline)
{
	this.input = input;
	this.audioelem = audioelem;
	this.audiosrc = audiosrc;
	this.svnpath = svnpath;
	this.playpause = playpause;
	this.skip = skip;
	this.replay = replay;
	this.volumeslider = volumeslider;
	this.volume = volume;
	this.seek = seek;
	this.timeline = timeline;
	
	this.queue = new Array();		//contains objects of Sample
	this.playing;
	this.repetitions;
}

Jukebox.prototype.clearQueue = function()
{
	this.queue = [];
}

//* adds Sample object to queue
Jukebox.prototype.insert = function (sample)
{
	this.queue.push(sample);
}

//* sets index/repetitions of current sample, sets source path, updates UI and plays sample
Jukebox.prototype.playSample = function(index)
{
		if(index == -1)
		{
			this.playing = -1;
			this.setSrc(new Sample("NULL","NULL","NULL","NULL"));
		}
		else
		{
			this.playing = index;
			this.repetitions = this.queue[index].getRepeat();
			this.setSrc(this.queue[index]);
			this.slideToCard(index);
			this.makeCardActive(index);
			this.play();
		}
}

//* initialises queue to play
Jukebox.prototype.startQueue = function()
{
	if (!this.queue.length)
	{
		console.log("Queue is empty");
		$(this.seek).css("width", "0%");
		this.showTimeline(this.queue);
		this.playSample(-1);
	}
	else
	{
		this.showTimeline(this.queue);
		this.playSample(0);
	}
}

//* sets source path of the audio element and activates loading indicator (headline turns red)
Jukebox.prototype.setSrc = function(sample)
{
	var path = this.svnpath.concat(sample.getPath());
	console.log("Set path: " + sample.getPath());
	$(this.audiosrc).attr("src", path);
	$(this.audioelem).load();
	if (sample.getPath() != "NULL")
	{
		$("h2").stop();
		$("h2").animate({color: "#ff4444"}, 100);
	}
		
}

//* plays audio element
Jukebox.prototype.play = function()
{
	this.setPlayIcon("pause");
	document.getElementById(this.audioelem.substr(1)).play();		//substr(1): ignore #
}

//* pauses audio element
Jukebox.prototype.pause = function()
{
	this.setPlayIcon("play");
	document.getElementById(this.audioelem.substr(1)).pause();		//substr(1): ignore #
	$(this.input).focus();
	
}

//* sets volume of audio element
Jukebox.prototype.setVolume = function(vol)
{
	document.getElementById(this.audioelem.substr(1)).volume = vol; 
}

//* mutes/unmutes audio and sets the volume icon
Jukebox.prototype.toggleMute = function()
{
	if(document.getElementById(this.audioelem.substr(1)).volume == 0)
	{
		var vol = $(this.volumeslider).slider("value");
		this.setVolume(vol / 100);
		if (vol <= 25)
			$(this.volume).css("background-position", "0 -15px");
		else if (vol <= 50)
			$(this.volume).css("background-position", "0 -30px");
		else if (vol <= 75)
			$(this.volume).css("background-position", "0 -45px");
		else if (vol <= 100)
			$(this.volume).css("background-position", "0 -60px");
	}
	else
	{
		this.setVolume(0);
		$(this.volume).css("background-position", "0 0px");
	}
}

//* skips current sample
Jukebox.prototype.skipSample = function()
{
	document.getElementById(this.audioelem.substr(1)).currentTime = document.getElementById(this.audioelem.substr(1)).duration;
}

//* replays queue
Jukebox.prototype.replayQueue = function()
{
	console.log("Replay queue");
	this.playSample(0);
}

//################################################

//* scrolls to current sample card, needs index of Jukebox object
Jukebox.prototype.slideToCard = function(index)
{
	var element = "#card_".concat(index);
	$(this.timeline).mCustomScrollbar("scrollTo", element);
}

//!!!!!!!!!!!!!!!!!! USE CLASSES

//* removes "active effects" (brighter background and different text color) from all cards and sets it to the current one
Jukebox.prototype.makeCardActive = function(index)
{
	$(".card_active").removeClass("card_active", "fast");
	$(".card_active_p").removeClass(".card_active_p", "fast");
	$("#card_".concat(index)).addClass("card_active", "fast");
	$("#card_".concat(index, " p")).addClass("card_active_p", "fast");
}

//* removes cards from timeline and adds new cards, shows/hides timeline
Jukebox.prototype.showTimeline = function(queue)
{
	$(this.timeline).empty();
	if (!queue.length)
		slideTimeline(0);
	else
	{
		for(var x = 0; x < queue.length; x++)
		{
			$(this.timeline).append(queue[x].getCard());
		}
		slideTimeline(1);
	}
}

//* plays/pauses audio
Jukebox.prototype.playToggle = function()
{
	if(document.getElementById(this.audioelem.substr(1)).paused && document.getElementById(this.audioelem.substr(1)).duration > 0)
		this.play();
	else if(!document.getElementById(this.audioelem.substr(1)).paused)
	{
		this.pause();
		$(this.input).focus();
	}
}

//* sets play or pause icon when audio is paused/playing
Jukebox.prototype.setPlayIcon = function(status)
{
	if (status == "play")
		$(this.playpause).css("background-image", "url(icons/play_normal.png)");
	else if (status == "pause")
		$(this.playpause).css("background-image", "url(icons/pause_normal.png)");
	else
		return -1;
}

//* updates the seeker line of audio, recursive
Jukebox.prototype.updateSeek = function()
{
	if(document.getElementById(this.audioelem.substr(1)).ended)
		$(this.seek).css("width","100%");

	else if(document.getElementById(this.audioelem.substr(1)).paused)
		return;		
	else
	{
		var range = (document.getElementById(this.audioelem.substr(1)).currentTime / document.getElementById(this.audioelem.substr(1)).duration) * 100;
		$(this.seek).css("width", range + "%");
		requestAnimationFrame(cs.jukebox.updateSeek.bind(this));	//this is not the best way
	}
}