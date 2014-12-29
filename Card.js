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

function Card (name, exemplar, repeat, index)
{
	this.title = name;
	this.exemplar = exemplar;
	this.repeat = repeat;
	this.index = index;
	
	this.pattern =
		["<div class=\"card\" id=\"card_",
			"\">",
			"<div class=\"card_title\">",
				"<p class=\"card_name\">",
				"</p>",
			"</div>",
			"<div class=\"card_meta\">",
				"<table><tbody><tr><td class=\"card_exemplar\">#",
				"</td><td class=\"card_repeat\">",
				"x</td></tr></tbody></table>",
			"</div>",
		"</div>"];
		
	this.card = "";
}

//* takes objects' attributes and merges them with pattern
Card.prototype.assembleCard = function ()
{
	this.card = this.card.concat(this.pattern[0], this.index);
	for (var x = 1; x < 4; x++)
	{
		this.card = this.card.concat(this.pattern[x]);
	}
	this.card = this.card.concat(this.title);
	for (var x = 4; x < 8; x++)
	{
		this.card = this.card.concat(this.pattern[x]);
	}
	this.card = this.card.concat(this.exemplar);
	this.card = this.card.concat(this.pattern[8]);
	this.card = this.card.concat(this.repeat);
	for (var x = 9; x < this.pattern.length; x++)
	{
		this.card = this.card.concat(this.pattern[x]);
	}
}

//* returns card as String
Card.prototype.getCard = function ()
{
	return this.card;
}