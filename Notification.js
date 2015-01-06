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
Notification.registered = new Array();
Notification.made = 0;
Notification.OVERLAY = "#overlay_notification";

Notification.status = new Object();
Notification.status.BLANK = 0;
Notification.status.ERROR = 1;
Notification.status.MSA = 2;
Notification.status.KLP = 3;
Notification.status.LOADING = 4;

function Notification(head, details, closeable, icon)
{
	this.head = head;
	this.details = details;
	this.closeable = closeable;
	this.icon = icon;

	this.id = ++Notification.made;
}

//* assembles HTML object with the object's attributes
Notification.prototype.makeNot = function()
{
	var main = document.createElement("div");
		main.setAttribute("class", "notification");
		main.setAttribute("id", "not_".concat(this.id));
	if(this.closeable)
	{
		var exit = document.createElement("div");
		exit.setAttribute("class", "overlay_exit");
		exit.setAttribute("title", "Close this notification");
	}
	var field = document.createElement("div");
		field.setAttribute("class", "notification_textfield");
	var msg = document.createElement("p");
		msg.setAttribute("class", "notification_message");
		msg.innerHTML = this.head;
	var details = document.createElement("p");
		details.setAttribute("class", "notification_detail");
		details.innerHTML = this.details;
	var footer = document.createElement("div");
		footer.setAttribute("class", "notification_footerbanner");
	
	if(this.closeable)	
		main.appendChild(exit);
	field.appendChild(msg);
	field.appendChild(details);
	main.appendChild(field);
	main.appendChild(footer);
	
	document.getElementById(Notification.OVERLAY.substr(1, Notification.OVERLAY.length)).appendChild(main);
}

//* sets the icon for the notification footer
Notification.prototype.setIcon = function()
{
	var jqID = "#not_".concat(this.id, " > .notification_footerbanner");
	switch(this.icon)
	{
		case 0: $(jqID).css("background-image", "url(icons/blank.png)"); break;
		
		case 1: $(jqID).css("background-image", "url(icons/error.png)"); break;
		
		case 2: $(jqID).css("background-image", "url(icons/MSA.png)"); break;
		
		case 3: $(jqID).css("background-image", "url(icons/keylimepie_small.png)"); break;
		
		case 4: $(jqID).css("background-image", "url(icons/loading.GIF)"); break;
		
		default: $(jqID).css("background-image", "url(icons/loading.GIF)"); break;	
	}
}

//* places notification into document, sets the icon and registeres the new notification
Notification.prototype.placeNot = function()
{
	this.makeNot();
	this.setIcon();
	Notification.registered.push(this);
}

//* displays the overlay when necessary and displays the notification
Notification.prototype.showNot = function()
{
	if ($(Notification.OVERLAY).css("display") != "block")
		$(Notification.OVERLAY).css("display","block").show().animate({opacity:1},100);
	if (!this.closable)
		$("#not_" + this.id + "> notification_textfield:before").css("display", "none");
	$("#not_" + this.id).css("display", "inline-block");
}

//* use this method to display your notification after new Notification (...)
Notification.prototype.init = function()
{
	this.placeNot();
	this.showNot();
}

//* deletes the object and hides the overlay when no more notifications are shown
Notification.prototype.deleteIt = function()
{
	var item = Notification.registered.indexOf(this);
	if (item != -1)
		Notification.registered.splice(item, 1);
	
	$("#not_".concat(this.id)).animate({opacity:0},100, function()
	{
		$(this).remove();
		if (!Notification.registered.length)
			$(Notification.OVERLAY).animate({opacity:0},100, function() {$(Notification.OVERLAY).hide()})
	});
}