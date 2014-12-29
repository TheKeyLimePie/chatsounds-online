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

var msaObj = new Object ();
msaObj.OVERLAY = "#msa_overlay";
msaObj.CONSOLE = "#msa_overlay_console";
msaObj.AUDIODIAL = "#msa_dialer";
msaObj.AUDIODIALSRC = "#msa_dialer_src";
msaObj.AUDIOSPEAKER = "#msa_speaker";
msaObj.AUDIOSPEAKERSRC = "#msa_speaker_src";
msaObj.AUDIO = "msaSamples/";
msaObj.SAMPLES = 5;
msaObj.MSGS = ["DETECTED: VALUABLE USER INFORMATION","START SENDING COLLECTED DATA...","CONNECTING VIA 2 ATTEMPTS","HANDSHAKE SUCCESS","SESSION KEYS VALIDATED","SAVE USER DATA IN CONTAINER","TRANSMISSION STARTED...","THE CAKE IS A LIE","HAX","6865792062616E6E6921","4D5341206973207761746368696E6720796F7521","SENDING PASSWORDS","INITIALISING SEQUENCE EPSILON...","7768792061726520796F752072656164696E6720746869733F","7265616C6C792E2E2E207768793F","746865204D5341206A7573742077616E747320796F75722064617461","6E6F7468696E67206D6F7265","536368696E6B656E21","INITIALISING SEQUENCE ZETA...","SENDING LOCATION DATA","POSITION FIXED","SENDING DNA SAMPLE VIA GPS TO THE IT LABORATORY","DECRYPT DATA WITH ALGORITHMIC DECOMPRESSION METHOD","USING RANDOM IT WORDS","CALLING NOTHING MAKES SENSE"];
msaObj.playing = 0;
msaObj.FRAGS = [0, 5, 11, 18, msaObj.MSGS.length - 1];	//messages for sample 1, 2, 3, 4, 5 (exlcusive)

msaObj.appear = function ()
{
	$(msaObj.OVERLAY).css("display", "block");
	
	document.getElementById(msaObj.AUDIODIAL.substr(1)).currentTime = 0;
	document.getElementById(msaObj.AUDIODIAL.substr(1)).play();
	msaObj.playMsg (1);
	$(msaObj.OVERLAY).animate({opacity: 1}, 750, "easeInOutBounce", function ()
	{
	});
}

msaObj.disappear = function ()
{
	$(msaObj.OVERLAY).animate({opacity: 0}, 750, "easeInOutBounce", function ()
	{
		document.getElementById(msaObj.AUDIODIAL.substr(1)).pause();
		document.getElementById(msaObj.AUDIOSPEAKER.substr(1)).pause();
		$(msaObj.OVERLAY).css("display", "none");
		var notiMSA = new Notification ("Oops", "The MSA \"borrowed\" your data.<br />We're sorry.", true, 3);
		notiMSA.init ();
	});
}

msaObj.showMsgs = function (from, to)
{
	if (from >= to)
		return;
	$(msaObj.CONSOLE).append(" > ".concat(msaObj.MSGS[from], "<br />"));
	var next = Math.random()*1000+1;
	window.setTimeout(function () {msaObj.showMsgs(from + 1, to)}, next);
}

msaObj.showRandomMsgs = function ()
{
	if ($(msaObj.OVERLAY).css("display") != "block")
		return;
	
	var values = new Array ();	
	for (var x = 0; x < 12; x++)
	{
		var number = new Number (Math.random()*65535);
		values[x] = parseInt(number).toString (16);
	}
	var textOut = values.join("").concat("<br />").toUpperCase();
	$(msaObj.CONSOLE).append(" > ".concat(textOut));
	var console = document.getElementById(msaObj.CONSOLE.substr(1));
	console.scrollTop = console.scrollHeight;
	window.setTimeout(function () {msaObj.showRandomMsgs()}, parseInt(Math.random()*450+1));
}

msaObj.playMsg = function (index)
{
	msaObj.playing = index;
	$(msaObj.AUDIOSPEAKERSRC).attr("src", msaObj.AUDIO.concat(index, ".ogg"));
	document.getElementById(msaObj.AUDIOSPEAKER.substr(1)).load();
	document.getElementById(msaObj.AUDIOSPEAKER.substr(1)).play();
}

$(msaObj.AUDIODIAL).on("ended", function ()
{
	document.getElementById(msaObj.AUDIODIAL.substr(1)).play();
});

$(msaObj.AUDIOSPEAKER).on("ended", function ()
{
	if (msaObj.playing < msaObj.SAMPLES)
	{
		msaObj.playMsg (++msaObj.playing);
		msaObj.showMsgs(msaObj.FRAGS[msaObj.playing - 2], msaObj.FRAGS[msaObj.playing - 1]);
	}
	else
		msaObj.showRandomMsgs();
});