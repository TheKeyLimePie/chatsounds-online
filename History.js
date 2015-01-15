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

function History()
{
	this.past = new Array();
	this.future = new Array();
	this.current;
}

History.prototype.push = function(object)
{
	if(!$.isEmptyObject(this.current))
	{
		this.past = this.past.concat(this.future.reverse());
		this.past.push(this.current);
	}
	
	this.current = object;
}

History.prototype.getPrev = function()
{
	if(!$.isEmptyObject(this.current) && !$.isEmptyObject(this.past))
	{
		this.future.push(this.current);
		this.current = this.past.pop();
		
		return this.current;
	}

	return -1;
}

History.prototype.getFollowing = function()
{
	if(!$.isEmptyObject(this.current) && !$.isEmptyObject(this.future))
	{
		this.past.push(this.current);
		this.current = this.future.pop();
		
		return this.current;
	}
	
	return -1;
}

History.prototype.getHistory = function()
{
	return this.past.concat(this.future.reverse());
}