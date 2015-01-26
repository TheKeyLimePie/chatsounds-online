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

function Card(name, exemplar, repeat, index)
{
	this.title = name;
	this.exemplar = exemplar;
	this.repeat = repeat;
	this.index = index;
		
	this.card;
}

//* takes objects' attributes and merges them with pattern
Card.prototype.assembleCard = function()
{
	this.card = document.createElement("div");
	var title = document.createElement("div");
	var name = document.createElement("p");
	var meta = document.createElement("div");
	var table = document.createElement("table");
	var tbody = document.createElement("tbody");
	var tr = document.createElement("tr");
	var td1 = document.createElement("td");
	var td2 = document.createElement("td");
	
	this.card.setAttribute("class", "card");
	this.card.setAttribute("id", "card_".concat(this.index));
	title.setAttribute("class", "card_title");
	name.setAttribute("class", "card_name");
	name.innerHTML = this.title;
	meta.setAttribute("class", "card_meta");
	td1.setAttribute("class", "card_exemplar");
	td1.innerHTML = "#".concat(this.exemplar);
	td2.setAttribute("class", "card_repeat");
	td2.innerHTML = this.repeat.toString().concat("x");
	
	this.card.appendChild(title);
	title.appendChild(name);
	this.card.appendChild(meta);
	meta.appendChild(table);
	table.appendChild(tbody);
	tbody.appendChild(tr);
	tr.appendChild(td1);
	tr.appendChild(td2);
}

//* returns card as String
Card.prototype.getCard = function()
{
	return this.card;
}