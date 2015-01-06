var LIST_LENGTH = 9;

//* show the box where the sample cards are shown
function slideTimeline (slideOut)	// true:= slide in, false:= slide out
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
		$("#timeline").animate({height: "0", opacity: "0"}, 400, function ()
		{
			$("#timeline").css("display", "none");
		});
	}
}

//* continously changes footer credits
function changeFooter (x)
{
	var names = ["Project by <b>KeyLimePie</b>",".lua to .json converter: <b>PotcFdk</b>","Server hosting: <b>Techbot</b>"];
	$("#footer_table_names").animate({opacity: "0"}, 400, function(){
		$("#footer_table_names").empty();
		$("#footer_table_names").append(names[x%names.length]);
	});
	$("#footer_table_names").animate({opacity: "1"}, 400);
	
	window.setTimeout(function(){changeFooter(x+1)}, 3500);
}

//* sets volume slider (jQueryUI)
function sliderInit ()
{
	var slider = $("#playerbox_volume_slider");
	var tooltip = $("#playerbox_volume_tooltip");
	tooltip.hide();

	slider.slider ({
		range: "min",
		value: 50,
		min: 1,
		max: 100,
		
		start: function (event, ui)
		{
			tooltip.fadeIn("fast");
		},
		
		slide: function (event, ui)
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
		},
		
		stop: function (event, ui)
		{
			tooltip.fadeOut("fast");
		}
	});
}

//* shows a list with suggestions based on input
function showSugg (sampleNames)
{	
	$(".td-entry").hide();
	$(".td-entry").empty();

	if (sampleNames.length == 0)
	{
		$("#suggestions").css("display", "none");
		return;
	}
	else
		$("#suggestions").css("display", "table");
		
	for (var x = 0; x < LIST_LENGTH; x++)
	{
		var refer = "#td-" + x;
		if (x < sampleNames.length)
			$(refer).append(sampleNames[x]);
	}
	
	showItems (0, sampleNames.length);
}

//* shows table data elements, recursive
function showItems (x, MAX)
{
	var refer = "#td-" + x;
	if (x >= MAX || $(refer).text() == "")
		return;

	$(refer).show(50, function showNext () {showItems (x+1, MAX)});
}

//* handles <input> input
function liveSearchManager (e)
{
	if ( (e.which == 8) || (e.which == 46) || (e.which >= 48 && e.which <= 90) || (e.which >= 96 && e.which <=105) )//8: backspace, 46: delete, 48-90: abc...123..., 96-105: keypad 0-9
	{
		var string = cs.getInput().split(",");
		cs.liveSearch(string[string.length - 1]);
	}
	else if ( (e.which == 188) )							//188: comma
		showSugg([]);
	else if (e.which == 39 && cs.getInput().length)	//39: arrow key right
	{
		if ($(".selected").length > 0)
			takeSugg ($(".selected"));
	}
}

//* handles <input> input related to arrow key navigation
function listNavigator (e)
{
	if (e.which == 40 && cs.getInput().length)	//40: arrow key down
	{
		if ($(".selected").length > 0)
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
	else if (e.which == 38 && cs.getInput().length)	//38: arrow key up
	{
		if ($(".selected").length > 0)
		{
			var current = $(".selected");
			if (current.prev().children().css("display") == "none")
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
			do
			{
				if (current.children().css("display") != "none")
					current.addClass("selected");
				else
					current = current.prev();
			} while ($(".selected").length == 0);

		}
	}
}

//* adds clicked suggestion to input
function takeSugg (trObject)
{
	var value = cs.getInput();

	value = value.split(",");

	var input = "";
	for (var x = 0; x < value.length - 1; x++)
	{
		input = input.concat(value[x], ",");
	}
	
	input = input.concat(trObject.children().text());
	$(trObject).removeClass("selected");
	cs.setInput(input);
}

//* shows/hides sharelink box and sets value
function showLink (onoff, url)
{
	if (!onoff)
	{
		$("#headbar_sharelink_link").val("");
		$("#headbar_sharelink_w").css("display", "none");
		$("#headbar_sharelink_w").css("opacity", 0);
	}
	else
	{
		$("#headbar_sharelink_link").val(url);
		$("#headbar_sharelink_w").css("display", "block");
		$("#headbar_sharelink_w").animate({opacity: 1}, 400, function ()
		{
			$("#headbar_sharelink_link").select();
		});
	}
}

//* change background image
function changeBG (url)
{
	var preload = new Image ();
	preload.src = url;
	preload.onload = function ()
	{
		notiBG.deleteIt ();
		$("body").css("background-image", "url(" + url + ")");
		
		if ($("#bg_input_cookies").is(":checked"))	//cookie is set here to be sure that the url is valid
			cs.setCookie ("bg",url, 10080);	//1 week
	}
}

function specialAnnouncement ()
{
	specialNoti = new Notification("<span id=\"special_noti\">Happy Birthday Hendrik!</span>", "A happy birthday wishes KeyLimePie!<br /><br />To other visitors: You can ignore this :D", true, Notification.status.KLP);
	specialNoti.init();
	$("h2").append("<span style=\"font-size: 25px\"> | Happy Birthday Hendrik!</span>");
	lsd ();
	$("body").css("background-image", "url(bg-special.jpg)");
	$("#search-string").val("birthday today,celebrate#2,its a celebration,nyugga,trip");
	window.JSONDB.done( function ()
	{
	   cs.action (); 
	});	
}

//for special events
function lsd ()
{
	requestAnimationFrame(lsd);
    var d = new Date();
    var colval = parseInt(Math.abs(Math.sin(0.0005*d.valueOf()))*360);
    var col = "hsl(".concat(colval,",100%,60%)");
    $("h2").css("color", col);
    $("#headbar_seek").css("background", col);
    $(".ui-slider-range").css("background", col);
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
    $(cs.INPUT).val("gaben*100");
    cs.action();
}

function gabenMove()
{
	var maxWidth = ($(document).width() - 300)/2;
    var t = new Date();
    var v = maxWidth + Math.sin(t.getTime()*0.0004)*maxWidth;
    $("#GABEN").css("left", v);
    requestAnimationFrame(gabenMove);	
}

function showSettings ()
{
	$("#headbar_settings_box").css("display", "block");
	$("#headbar_settings_box").animate({opacity: 1}, 100, function ()
	{
		$(document).on("click", function (event)
		  {
			  if (event.target.className != "settings_options")
				hideSettings ();
		  });
	});
	
	
}

function hideSettings ()
{
	$("#headbar_settings_box").animate({opacity: 0}, 100, function ()
	{
		$("#headbar_settings_box").css("display", "none");
		$(document).unbind("click");
	});
}

function showBGForm ()
{
	hideSettings ();
	$("#overlay_setBG").css("display", "block");
	$("#overlay_setBG").animate({opacity: 1}, 200, function ()
	{
		$("#overlay_setBG").on("click", function (event)
		  {
			  if (event.target.id == "overlay_setBG")
				hideBGForm ();
		  });
	});
}

function hideBGForm ()
{
	$("#overlay_setBG").animate({opacity: 0}, 200, function ()
	{
		$("#overlay_setBG").css("display", "none");
		$("#overlay_setBG").unbind("click");
	});
}

function setBG ()
{
	hideBGForm ();
	var url = $("#bg_input_text").val();
	if (url == "")
	{
		$("body").css("background-image", "url(bg.jpg)");
		if ($("#bg_input_cookies").is(":checked"))
			cs.setCookie("bg", " ", -5);
	}
	else
	{
		if (url.substring(0,4) != "http")
				url = "http://".concat(url);
		window.notiBG = new Notification ("Loading custom background", url, false, Notification.status.LOADING);
		window.notiBG.init ();
		changeBG(url);
	}
}

function showHelp ()
{
	hideSettings ();
	$("#overlay_help").css("display", "block");
	$("#overlay_help").animate({opacity: 1}, 200, function ()
	{
		$("#overlay_help").on("click", function (event)
		  {
			  if (event.target.id == "overlay_help")
				hideHelp ();
		  });
	});
}

function hideHelp ()
{
	$("#overlay_help").animate({opacity: 0}, 200, function ()
	{
		$("#overlay_help").css("display", "none");
		$("#overlay_help").unbind("click");
	});
}

function showCookieDiscl ()
{
	$("#cookie_disclaimer").css("display", "block");
	$("#cookie_disclaimer").animate({opacity: 1}, 100);
}

function hideCookieDiscl ()
{
	$("#cookie_disclaimer").animate({opacity: 0}, 100, function ()
	{
		$("#cookie_disclaimer").css("display", "none");
	});
}

function cookieDiscl ()
{
	var notiCookie = new Notification ("Use of cookies","Cookies are text-snippets a website sends to a browser to save it locally.<br />We use them when you are using the<br /><br /><b>\"Remember this background\"</b>-feature<br />(the image url is saved with a cookie)<br /><br />Cookies are not used on default so if you do not check this box no cookies are saved.<br /><span style=\"font-size: 12px\">EU Directive 2002/58/EC</span>", true, Notification.status.KLP);
	notiCookie.init ();
}