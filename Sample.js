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

function Sample (name, path, exemplar, repeat, index)
{
	this.name = name;
	this.path = path;
	this.exemplar = exemplar;
	this.repeat = repeat;
	this.index = index;
	this.card = new Card (this.name, this.exemplar, this.repeat, this.index);
}

Sample.prototype.getName = function ()
{
	return this.name;
}

Sample.prototype.getPath = function ()
{
	return this.path;
}

Sample.prototype.getExemplar = function ()
{
	return this.exemplar;
}

Sample.prototype.getRepeat = function ()
{
	return this.repeat;
}

//* assembles card via method of Card object and returns a html code string
Sample.prototype.getCard = function ()
{
	this.card.assembleCard();
	return this.card.getCard();
}