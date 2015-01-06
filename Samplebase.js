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

function Samplebase()
{
	this.db = new Array();
	this.rev = [-1];
}

//* requests .json containing sample data from server (and sets revision), also calls URLParameter.useParameters() on success
Samplebase.prototype.updateDB = function()
{
	var notiJSON = new Notification("Updating local database", "Please wait</br></br><span id=\"json_progress\"></span>", false, Notification.status.LOADING);
	notiJSON.init();
	var thisDB = this.db;
	var thisRev = this.rev;
	var setRev = this.setRev;
	
	window.JSONDB = $.ajax({
		type: "GET",
		dataType: "json",
		url: "soundlist.json",
		xhr: function()
		{
			var xhr = new window.XMLHttpRequest();
			xhr.addEventListener("progress", function(e)
			{
				if(e.lengthComputable)
				{
					var p = Math.round(e.loaded/e.total*100);
					$("#json_progress").html(p.toString().concat(" %"));
				}
			}, false);
			return xhr;
		}})
		.done(function(data)
		{
			$.each(data, function(key, value)
			{
				thisDB.push(value);
			});
		})
		.always(function()
		{
			if (thisDB.length == 0)
			{
				var notiJSONError = new Notification("Got no samples" , "Try to reload this site.<br />If this error persists please contact <a href='http://threekelv.in/keylimepie/'>KeyLimePie</a>.", false, Notification.status.ERROR);
				notiJSONError.init();
			}
			else
				notiJSON.deleteIt();
		}
	);
	
	$.get("revision", function(svn)
	{
		thisRev[0] = svn;
		$("#footer_revision").empty();
		$("#footer_revision").append("Chatsounds SVN Revision ");
		if (thisRev[0] == -1)
			$("#footer_revision").append("-Google messed it up-");
		else
			$("#footer_revision").append(thisRev[0]);
	});
};

Samplebase.prototype.getDB = function()
{
	return this.db;
};

Samplebase.prototype.getRev = function()
{
	return this.rev[0];
};