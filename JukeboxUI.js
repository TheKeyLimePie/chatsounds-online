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

function JukeboxUI (input, audioelem, playpause, skip, replay, volumeslider, volume, seek, timeline)
{
	this.audioelem = audioelem;
	this.playpause = playpause;
	this.skip = skip;
	this.replay = replay;
	this.volumeslider = volumeslider;
	this.volume = volume;
	this.seek = seek;
	this.timeline = timeline;
}

JukeboxUI.prototype.getTimeline = function ()
{
	return this.timeline;
}

//* scrolls to current sample card, needs index of Jukebox object
JukeboxUI.prototype.slideToCard = function (index)
{
	var element = "#card_".concat(index);
	$(this.timeline).mCustomScrollbar("scrollTo", element);
}

//* removes "active effects" (brighter background and different text color) from all cards and sets it to the current one
JukeboxUI.prototype.makeCardActive = function (index)
{
	$(".card").css("background", "");
	$(".card p").css("color", "");
	$("#card_".concat(index)).animate({background: "#fff"}, "fast");
	$("#card_".concat(index, " p")).animate({color: "#33b5e5"}, "fast");
}

//* removes cards from timeline and adds new cards, shows/hides timeline
JukeboxUI.prototype.showTimeline = function (queue)
{
	$(this.timeline).empty();
	if (queue.length == 0)
		slideTimeline(0);
	else
	{
		for (var x = 0; x < queue.length; x++)
		{
			$(this.timeline).append(queue[x].getCard());
		}
		slideTimeline(1);
	}
}

//* plays/pauses audio
JukeboxUI.prototype.playToggle = function ()
{
	if (document.getElementById(this.audioelem.substr(1)).paused && document.getElementById(this.audioelem.substr(1)).duration > 0)
	{
		Jukebox.prototype.play.call(this);			//access method of Jukebox (parent object)
		this.playIcon("pause");
	}
	else if (!document.getElementById(this.audioelem.substr(1)).paused)
	{
		Jukebox.prototype.pause.call(this);			//access method of Jukebox (parent object)
		this.playIcon("play");
		$(this.input).focus();
	}
	else
		return;
}

//* sets play or pause icon when audio is paused/playing
JukeboxUI.prototype.playIcon = function (status)
{
	if (status == "play")
		$(this.playpause).css("background-image", "url(icons/play_normal.png)");
	else if (status == "pause")
		$(this.playpause).css("background-image", "url(icons/pause_normal.png)");
	else
		return -1;
}

//* updates the seeker line of audio, recursive
JukeboxUI.prototype.updateSeek = function ()
{
	if (document.getElementById(this.audioelem.substr(1)).ended)
		$(this.seek).css("width","100%");

	else if (document.getElementById(this.audioelem.substr(1)).paused)
		return;		
	else
	{
		var range = (document.getElementById(this.audioelem.substr(1)).currentTime / document.getElementById(this.audioelem.substr(1)).duration) * 100;
		$(this.seek).css("width", range + "%");
		requestAnimationFrame(cs.jukebox.ui.updateSeek.bind(this));
	}
}