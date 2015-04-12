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

function Settings()
{
	this.INPUT = "#search-string";			//DOM ID of text input
	this.AUDIO = "#audio-element";			//DOM ID of audio tag
	this.AUDIOSRC = "#audio-src";			//DOM ID of audio source
	this.SVNPATH = "https://raw.githubusercontent.com/Metastruct/garrysmod-chatsounds/master/sound/";
	this.URL = "http://cs.3kv.in/";
	
	this.PLAYPAUSE = "#playerbox_controls_play";
	this.SKIP = "#playerbox_controls_skip";
	this.REPLAY = "#playerbox_controls_replay";
	this.BACK = "#playerbox_controls_back";
	this.FORTH = "#playerbox_controls_forth";
	this.VOLUMESLIDER = "#playerbox_volume_slider";
	this.VOLUME = "#playerbox_volume_volume";
	this.SEEK = "#headbar_seek";
	this.TIMELINE = "#timeline_cardline";
	this.BACKTXT = "#playerbox_history_back";
	this.FORTHTXT = "#playerbox_history_forth";
}