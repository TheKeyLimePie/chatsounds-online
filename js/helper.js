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

//* max. shown suggestions
var LIST_LENGTH = 9;
//* strings for credits (another one gets added for background image -> changeFooter(0))
var names = ["Project by <a href=\"http://3kv.in/~keylimepie/\" target=\"_blank\"><b>KeyLimePie</b></a>",".lua to .json converter: <b>PotcFdk</b>","Server hosting: <b>Techbot</b>"];

//* shows the box where the sample cards are shown
function slideTimeline(slideOut)	// true:= slide in, false:= slide out
{
	if (slideOut)
	{
		$("#timeline").css("display", "block");
		$("#timeline_cardline").mCustomScrollbar({
			horizontalScroll:true,
			theme:"light-thin",
			mouseWheelPixels: 300 
	  	});
		$("#timeline").animate({height: "150px", opacity: "1"}, 400);
	}
	else
	{
		$("#timeline").animate({height: "0", opacity: "0"}, 400, function()
		{
			$("#timeline").css("display", "none");
		});
	}
}

//* continously changes footer credits
function changeFooter(x)
{
	//* if called for the first time -> load bg credits
	if(!x)
	{
		$.get("bgcredits.txt", function(data)
		{
			var credits = data.split("\n");
			var string = "Background image: <a href=\"".concat(credits[1], "\" target=\"_blank\"><b>", credits[0], "</b></a>");
			names.push(string);
		});
	}
	
	$("#footer_table_names").animate({opacity: "0"}, 400, function(){
		$("#footer_table_names").empty();
		$("#footer_table_names").append(names[x%names.length]);
	});
	$("#footer_table_names").animate({opacity: "1"}, 400);
	
	window.setTimeout(function(){changeFooter(x+1)}, 3500);
}

//* initiates volume slider (jQueryUI)
function volumeSliderInit()
{
	var slider = $("#playerbox_volume_slider");
	var tooltip = $("#playerbox_volume_tooltip");
	tooltip.hide();

	function checkPercent(ui)
	{
		var tooltip_value = slider.slider('value');
		var tooltip_value_percent = $("#playerbox_volume_slider").innerWidth() / 100;
		cs.jukebox.setVolume(tooltip_value/100);
		
		var volume = $("#playerbox_volume_volume");
		tooltip.css("left", tooltip_value*tooltip_value_percent).text(ui.value);
	
		if (tooltip_value <= 25)
			volume.css("background-position", "0 -15px");
		else if (tooltip_value <= 50)
			volume.css("background-position", "0 -30px");
		else if (tooltip_value <= 75)
			volume.css("background-position", "0 -45px");
		else if (tooltip_value <= 100)
			volume.css("background-position", "0 -60px");
	}
	
	slider.slider({
		range: "min",
		value: 50,
		min: 1,
		max: 100,
		
		start: function(event, ui)
		{
			tooltip.stop();
			tooltip.fadeIn("fast");
		},
		
		slide: function(event, ui)
		{
			checkPercent(ui);
		},
		
		stop: function(event, ui)
		{
			checkPercent(ui);
			
			tooltip.stop();
			tooltip.fadeOut("fast");
		}
	});
}

//* shows a list with suggestions based on input
function showSugg(sampleNames)
{	
	$(".td-entry").stop();
	$(".td-entry").hide();
	$(".td-entry").empty();

	if(sampleNames.length == 0)
	{
		$("#suggestions").css("display", "none");
		return;
	}
	else
		$("#suggestions").css("display", "table");
		
	for(var x = 0; x < LIST_LENGTH; x++)
	{
		var refer = "#td-" + x;
		if (x < sampleNames.length)
			$(refer).append(sampleNames[x]);
	}
	
	showItems(0, sampleNames.length);
}

//* shows table data elements, recursive
function showItems(x, MAX)
{
	var refer = "#td-" + x;
	if (x >= MAX || $(refer).text() == "")
		return;

	$(refer).show(50, function showNext(){showItems(x+1, MAX)});
}

//* manages <input> input for live search
function liveSearchManager(e)
{
	if ((e.which == 8) || (e.which == 46) || (e.which >= 48 && e.which <= 90) || (e.which >= 96 && e.which <=105)) //8: backspace, 46: delete, 48-90: abc...123..., 96-105: keypad 0-9
	{
		if(cs.getLiveSearchPointer() > cs.getInput().length)
		{
			cs.revLiveSearchPointer();
		}
		
		var string = cs.getInput().substring(cs.getLiveSearchPointer(), cs.getInput().length);
		cs.liveSearch(string);
	}
	else if(e.which == 188) //188: comma
	{
		cs.setInput(cs.getInput().concat(" "));
		cs.addLiveSearchPointer(cs.getInput().length);
		showSugg([]);
	}	
}

//* manages <input> input related to arrow key navigation
function listNavigator(e)
{
	if(e.which == 40 && cs.getInput().length) //40: arrow key down
	{
		if($(".selected").length > 0)
		{
			var current = $(".selected");
			if (current.next().children().css("display") == "none")
			{
				current.removeClass("selected");
				return;
			}
			current.next().addClass("selected");
			current.removeClass("selected");
		}
		else
			$("#suggestions tr").first().addClass("selected");
	}
	else if(e.which == 39 || e.which == 9 && cs.getInput().length) //39: arrow key right, 9: TAB key
	{
		if ($(".selected").length > 0)
			takeSugg ($(".selected"));
	}
	else if(e.which == 38 && cs.getInput().length) //38: arrow key up
	{
		if($(".selected").length > 0)
		{
			var current = $(".selected");
			if(current.prev().children().css("display") == "none")
			{
				current.removeClass("selected");
				return;
			}
			current.prev().addClass("selected");
			current.removeClass("selected");
		}
		else
		{
			var current = $("#suggestions tr").last();
			
			var hasVisible = false;
			var tds = $("#suggestions tr td");
			for(var x = 0; x < tds.length; x++)
			{
				hasVisible = $(tds).css("display") != "none" | hasVisible;
			}
			
			do
			{
				if (current.children().css("display") != "none")
					current.addClass("selected");
				else
					current = current.prev();
			} while($(".selected").length == 0 && hasVisible);
		}
	}
}

//* adds clicked suggestion to input
function takeSugg(trObject)
{
	var value = cs.getInput();

	var input = value.substring(0, cs.getLiveSearchPointer());
	
	input = input.concat(trObject.children().text(), " ");
	
	$(trObject).removeClass("selected");
	cs.addLiveSearchPointer(input.length);
	showSugg("");
	cs.setInput(input);
}

//* shows/hides sharelink box and sets value
function showLink(onoff, url)
{
	if(!onoff)
	{
		$("#headbar_sharelink_link").val("");
		$("#headbar_sharelink_w").css("display", "none");
		$("#headbar_sharelink_w").css("opacity", 0);
	}
	else
	{
		$("#headbar_sharelink_link").val(url);
		$("#headbar_sharelink_w").css("display", "block");
		$("#headbar_sharelink_w").animate({opacity: 1}, 400, function()
		{
			$("#headbar_sharelink_link").select();
		});
	}
}

//* change background image
function changeBG(url)
{
	var preload = new Image();
	preload.src = url;
	preload.onload = function()
	{
		notiBG.deleteIt();
		$("body").css("background-image", "url(" + url + ")");
		
		if ($("#bg_input_cookies").is(":checked")) //cookie is set here to be sure that the url is valid
			cs.setCookie("bg",url, 10080); //1 week
	}
}

//for special events
function lsd()
{
	LSD = requestAnimationFrame(lsd);
    var d = new Date();
    var colval = d.getTime()*0.09 % 360;
    var col = "hsl(".concat(colval,",100%,60%)");
    $("h2").css("color", col);
    $("#headbar_seek").css("background", col);
    $(".ui-slider-range").css("background", col);
	$("#search-string").css("color", col);
	$("#suggestions tr td").css("color", col);
	$(".playerbox_button").css("color", col);
	$(".playerbox_text").css("color", col);
}

function checkGaben()
{
	if(document.getElementById("audio-element").ended && !cs.getInput())
		gaben();
	else
	{
		console.log("Guess I'm waiting like you do with HL3...");
		GABE = window.setTimeout(function(){checkGaben();}, 10000);
	}	
}

function gaben()
{
	var gabe = document.createElement("img");
    gabe.setAttribute("src", "gabe.png");
    gabe.setAttribute("style", "position: fixed; bottom: 0; display: block;");
    gabe.setAttribute("id", "GABEN");
    document.body.appendChild(gabe);
    gabenMove();
	lsd();
    $("body").css("background-image", "url(valve.jpg)");
    var gabeNotif = new Notification("PRAISE LORD GABEN!!!1!!11!", "<iframe width=\"480\" height=\"270\" src=\"//www.youtube.com/embed/bUo1PgKksgw?loop=1&playlist=bUo1PgKksgw\" frameborder=\"0\" allowfullscreen></iframe>", true, Notification.status.KLP);
	gabeNotif.init();
	$(settings.INPUT).val("gaben");
	cs.action();
}

function gabenMove()
{
	var maxWidth = ($(document).width() - 300)/2;
    var t = new Date();
    var w = maxWidth + Math.sin(t.getTime()*0.0004)*maxWidth;
    var jumpHeight = 10;
    var h = Math.cos(t.getTime()*0.0004) * jumpHeight * Math.sin(t.getTime()*0.02);
	$("#GABEN").css("left", w);
	$("#GABEN").css("bottom", h);
    GABE = requestAnimationFrame(gabenMove);	
}

function showSettings()
{
	$("#headbar_settings_box").css("display", "block");
	$("#headbar_settings_box").animate({opacity: 1}, 100, function()
	{
		$(document).on("click", function(event)
		{
			if (event.target.className != "settings_options")
				hideSettings();
		});
	});
}

function hideSettings()
{
	$("#headbar_settings_box").animate({opacity: 0}, 100, function()
	{
		$("#headbar_settings_box").css("display", "none");
		$(document).unbind("click");
	});
}

function showBGForm()
{
	hideSettings();
	$("#overlay_setBG").css("display", "block");
	$("#overlay_setBG").animate({opacity: 1}, 200, function()
	{
		$("#overlay_setBG").on("click", function(event)
		{
			if(event.target.id == "overlay_setBG")
				hideBGForm();
		});
	});
}

function hideBGForm()
{
	$("#overlay_setBG").animate({opacity: 0}, 200, function()
	{
		$("#overlay_setBG").css("display", "none");
		$("#overlay_setBG").unbind("click");
	});
}

function setBG()
{
	hideBGForm();
	var url = $("#bg_input_text").val();
	
	if(!/^http(s){0,1}:\/{2}/g.test(url))
		url = "http://".concat(url);
	
	if(url == "" || !/^http(s){0,1}:(\/){2}(.*)\.(jpg|jpeg|png|gif)$/g.test(url))
	{
		$("body").css("background-image", "url(./bg.jpg)");
		if($("#bg_input_cookies").is(":checked"))
			cs.setCookie("bg", " ", -5);
	}
	else
	{
		window.notiBG = new Notification("Loading custom background", url, false, Notification.status.LOADING);
		window.notiBG.init();
		changeBG(url);
	}
}

function showHelp()
{
	hideSettings();
	$("#overlay_help").css("display", "block");
	$("#overlay_help").animate({opacity: 1}, 200, function()
	{
		$("#overlay_help").on("click", function(event)
		{
			if (event.target.id == "overlay_help")
				hideHelp();
		});
	});
}

function hideHelp()
{
	$("#overlay_help").animate({opacity: 0}, 200, function()
	{
		$("#overlay_help").css("display", "none");
		$("#overlay_help").unbind("click");
	});
}

function showCookieDiscl()
{
	$("#cookie_disclaimer").css("display", "block");
	$("#cookie_disclaimer").animate({opacity: 1}, 100);
}

function hideCookieDiscl()
{
	$("#cookie_disclaimer").animate({opacity: 0}, 100, function()
	{
		$("#cookie_disclaimer").css("display", "none");
	});
}

function cookieDiscl()
{
	var notiCookie = new Notification("Use of cookies","Cookies are text-snippets a website sends to your browser to save it locally.<br />Chatsounds uses them when you are using the<br /><br /><b>\"Remember this background\"</b>-feature<br />(the image url is saved in a cookie)<br /><br />Cookies are not used by default so if you do not check this box no cookies are saved.<br /><span style=\"font-size: 12px\">EU Directive 2002/58/EC</span>", true, Notification.status.KLP);
	notiCookie.init();
}

function openLink(name)
{
	var s = "";
	if(name == "github")
		s = "https://github.com/TheKeyLimePie/chatsounds-online";
	else if(name == "meta")
		s = "http://metastruct.net";
	var win = window.open(s, "_blank");
	win.focus();
}

function showAbout()
{
	hideSettings();
	var desc = "";
	$.get("README.md", function(data)
	{
		desc = data.match(/^.[^=]+.+/gm)[1];
	}).always(function()
	{
		var credits = "";
		for(var x = 0; x < names.length; x++)
		{
			credits = credits.concat(names[x],"<br/>");
		}
		
		var githash = "";
		$.get("getGitRev.php", function(data)
		{
			if(data.search("Unable to open file!") > -1)
				githash = "Unable to to access Git hash";
			else
				githash = data;
		}).always(function()
		{
			var details = desc.concat("<br/><br/>", credits, "<br/>", "<a href=\"javascript:showLicenses()\">Software licenses</a>", "<br/><br/>This site is based on Git: <br/><i>", githash, "</i><br/>", "Sounds samples are based on Git (via SVN gateway): <br/><a href=\"https://github.com/Metastruct/garrysmod-chatsounds\" target=\"_blank\"><i>", cs.sampleDB.getRev(), "</i></a>");
			var about = new Notification("Some infos", details, true, Notification.status.KLP);
			about.init();
		});
	});
}

function showLicenses()
{
	var licenses = new Array();
	licenses.push("MIT: <a target=\"_blank\" href=\"https://gist.github.com/paulirish/1579671\">requestAnimationFrame polyfill</a><br/><i>by Erik Möller, fixes from Paul Irish and Tino Zijdel</i>");
	licenses.push("MIT: <a target=\"_blank\" href=\"https://github.com/malihu/malihu-custom-scrollbar-plugin\">malihu custom scrollbar plugin</a><br/><i>by Manos Malihutsakis</i>");
	licenses.push("GNU GPLv3: <a target=\"_blank\" href=\"https://github.com/Falicon/BitlyPHP\">BitlyPHP</a><br/><i>by Kevin Marshall</i>");
	
	var details = "";
	
	for(var x = 0; x < licenses.length; x++)
	{
		details = details.concat(licenses[x], "<br/><br/>");
	}
	
	var licenseoverview = new Notification("Software licenses", details, true, Notification.status.GITHUB);
	licenseoverview.init();
}