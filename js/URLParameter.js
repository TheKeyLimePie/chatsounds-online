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

function URLParameter ()
{
	this.PARAMETERS = ["s","v"];		//supported URL parameters
	this.parameters = new Array ();		//extracted URL parameters
}

//* takes all valid URL parameteres behind '?', splits them into [0] parameter-name, [1] parameter value
URLParameter.prototype.updateParameters = function ()
{
	this.parameters = [];
	var param = window.location.search.substring(1);
	param = param.split("&");
	for (var x = 0; x < param.length; x++)
	{
		var p = param[x].split("=");
		for (var y = 0; y < this.PARAMETERS.length; y++)
		{
			if (p[0] == this.PARAMETERS[y])
			{
				this.parameters.push(p); 
			}
		}
	}
}

//* returns requested parameter
URLParameter.prototype.getParameter = function (string)
{
	for (var x = 0; x < this.parameters.length; x++)
	{
		if (this.parameters[x][0] == string)
			return this.parameters[x][1];
	}
	return -1;
}

//* checks if the volume value is valid and sets audio volume/slider
URLParameter.prototype.handleVolume = function ()
{
	var vol = this.getParameter(this.PARAMETERS[1]);
	
	if (!isNaN(vol) && vol > 0 && vol <= 1)
	{
		cs.jukebox.setVolume (vol);
		var slider = cs.VOLUMESLIDER;
		$(slider).slider("option", "value", vol*100);
		console.log("URL: Volume set to " + vol);
	}
	else if (vol == 0)
	{
		cs.jukebox.toggleMute ();
		console.log("URL: Sound muted");
	}
	else
	{
		console.log("URL: No valid volume value found");
	}
}

//* looks for an input string, decodes it, puts it into the input and starts Samplecs.action() via form
URLParameter.prototype.handleString = function ()
{
	var string = this.getParameter(this.PARAMETERS[0]);
	if (string == -1)
	{
		console.log("URL: No input in URL found");
		return;
	}
	var decodedString = decodeURIComponent(string);
	console.log("URL: Input set to: " + decodedString);
	cs.setInput (decodedString);
	document.getElementById("search-form").submit();	
}

//* calls functions for different URL parameters
URLParameter.prototype.useParameters = function ()
{
	for (var x = 0; x < this.PARAMETERS.length; x++)
	{
		switch (this.PARAMETERS[x])
		{
			case 'v': URLParameter.prototype.handleVolume.call(this); break;
			
			case 's': URLParameter.prototype.handleString.call(this); break;
		}
	}
}