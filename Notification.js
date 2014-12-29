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

//* "Class" attributes
Notification.registered = new Array ();
Notification.made = 0;
Notification.OVERLAY = "#overlay_notification";


function Notification (head, details, closeable, icon)
{
	this.head = head;
	this.details = details;
	this.closeable = closeable;
	this.icon = icon;

	this.id = ++Notification.made;
	
	this.struct = ["<div class=\"notification\" id=\"not_","\">",
					"<div class=\"overlay_exit\" title=\"Close this notification\"></div>",
					"<div class=\"notification_textfield\">",
						"<p class=\"notification_message\">",
						"</p>",
						"<p class=\"notification_detail\">",
						"</p>",
					"</div>",
					"<div class=\"notification_footerbanner\"></div>",
				"</div>"];
}

//* assembles HTML string with the object's attributes
Notification.prototype.makeNot = function ()
{
	string = this.struct[0].concat(this.id,this.struct[1]);
	if (this.closeable)
		string = string.concat(this.struct[2]);
	
	for (var x = 3; x < 5; x++)
	{
		string = string.concat(this.struct[x]);
	}
	
	string = string.concat(this.head, this.struct[5], this.struct[6], this.details);
	
	for (var x = 7; x < this.struct.length; x++)
	{
		string = string.concat(this.struct[x]);
	}
	
	return string;
}

//* sets the icon for the notification footer
Notification.prototype.setIcon = function ()
{
	var jqID = "#not_".concat(this.id, " > .notification_footerbanner");
	switch (this.icon)
	{
		case 0: $(jqID).css("background-image", "url(icons/blank.png)"); break;
		
		case 1: $(jqID).css("background-image", "url(icons/error.png)"); break;
		
		case 2: $(jqID).css("background-image", "url(icons/gcast/cast_icon_active.png)"); break;
		
		case 3: $(jqID).css("background-image", "url(icons/MSA.png)"); break;
		
		case 4: $(jqID).css("background-image", "url(icons/keylimepie_small.png)"); break;
		
		default: $(jqID).css("background-image", "url(icons/loading.GIF)"); break;	
	}
}

//* places assembled notification into document, sets the icon and registeres the new notificatiob
Notification.prototype.placeNot = function ()
{
	$(Notification.OVERLAY).append( this.makeNot () );
	this.setIcon ();
	Notification.registered.push(this);
}

//* displays the overlay when necessary and displays the notification
Notification.prototype.showNot = function ()
{
	if ($(Notification.OVERLAY).css("display") != "block")
		$(Notification.OVERLAY).css("display","block").show().animate({opacity:1},100);
	if (!this.closable)
		$("#not_" + this.id + "> notification_textfield:before").css("display", "none");
	$("#not_" + this.id).css("display", "inline-block");
}

//* use this method to display your notification after new Notification (...)
Notification.prototype.init = function ()
{
	this.placeNot ();
	this.showNot ();
}

//* deletes the object and hides the overlay when no more notifications are shown
Notification.prototype.deleteIt = function ()
{
	var item = Notification.registered.indexOf(this);
	if (item != -1)
		Notification.registered.splice(item, 1);
	
	$("#not_".concat(this.id)).animate({opacity:0},100, function ()
	{
		$(this).remove();
		if (!Notification.registered.length)
			$(Notification.OVERLAY).animate({opacity:0},100, function () {$(Notification.OVERLAY).hide()})
	});
}