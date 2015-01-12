$(window).load( function ()
  {
	  //---
	  // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
	  // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
	   
	  // requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
	   
	  // MIT license
	   
	  (function() {
		  var lastTime = 0;
		  var vendors = ['ms', 'moz', 'webkit', 'o'];
		  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
			  window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
			  window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
										 || window[vendors[x]+'CancelRequestAnimationFrame'];
		  }
	   
		  if (!window.requestAnimationFrame)
			  window.requestAnimationFrame = function(callback, element) {
				  var currTime = new Date().getTime();
				  var timeToCall = Math.max(0, 16 - (currTime - lastTime));
				  var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
					timeToCall);
				  lastTime = currTime + timeToCall;
				  return id;
			  };
	   
		  if (!window.cancelAnimationFrame)
			  window.cancelAnimationFrame = function(id) {
				  clearTimeout(id);
			  };
	  }());
	  //---
	  
	  //start credits loop in footer
	  changeFooter(0);
	  //initiate Volume slider
	  sliderInit();
	  //tests if the browser supports .ogg files for HTML5 <audio>
	  var testAudio = document.createElement("audio");
	  if (!testAudio.canPlayType("audio/ogg"))
	  {
		  var notiBrowser = new Notification ("Your browser is not compatible", "This site uses HTML5 technology.<br />Unfortunately, your browser does not support .ogg files.<br />Update your browser or use <a href='http://www.mozilla.org/firefox' target='_blank'>Firefox</a> or <a href='http://www.google.com/chrome' target='_blank'>Chrome</a>.", false, Notification.status.ERROR);
		  notiBrowser.init ();
		  return;
	  }
	  else if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
	  {
		  var notiMobile = new Notification("We're not ready for mobile devices", "It seems like you're using a mobile device such as Android or iOS. Unfortunately, Chatsounds online is not optimised for mobile devices. Sure, you can just go on if you want to but there might be some bugs...", true, Notification.status.ERROR);
		  notiMobile.init();
	  }
	  else if(/Valve Source Client/i.test(navigator.userAgent))
	  {
		  var notiSteam = new Notification("Dude! Srsly?!", "Are you using Chatsounds online via some kind of ingame overlay thingy?<br/>C'mon man... Use a <a href=\"https://www.mozilla.org/en-US/firefox/new/\" target=\"_blank\" title=\"Firefox\">good browser</a> for ultimate user experience!", true, Notification.status.ERROR);
		  notiSteam.init();
	  }
	  
	  //object of Samplecs
	  cs = new Chatsounds();
	  //get JSON with samples
	  cs.sampleDB.updateDB();
	  //set default volume
	  cs.jukebox.setVolume(0.5);
	  //get URL parameters
	  cs.parameters.updateParameters();
	  //when soundlist.json was loaded -> useParameters()

	  window.JSONDB.done( function ()
	  {
		  $(cs.INPUT).focus();
		  cs.parameters.useParameters();
  });
	  
	  if (cs.getCookie("bg") != -1)
	  {
		  var url = cs.getCookie("bg");
		  window.notiBG = new Notification ("Loading custom background", url, false, Notification.status.LOADING);
		  window.notiBG.init ();
		  $("#bg_input_text").val(url);
		  changeBG (url);
	  }
	  
	  GABE = window.setTimeout(function(){gaben();}, 900000);

	  // character input, backspace, delete, comma, semicolon handled here
	  $(cs.INPUT).keyup(function(e)
	  {
			if(e.which == 9)	//TAB key
				e.preventDefault();
			liveSearchManager(e);
	  });
	  
	  // arrow key up/down/right handled here
	  $(cs.INPUT).keydown(function(e)
	  {
			if(e.which == 9)	//TAB key
				e.preventDefault();
			listNavigator(e);
      });
	  
	  // ENTER is handled here (if ENTER was pressed on a selected element)
	  $(cs.INPUT).keypress(function(e)
	  {
        	if (e.which == 13 && $(".selected").length)
				takeSugg($(".selected"));
      });
	  
	  $("#bg_input_cookies").change(function(e)
	  {
		   if ($("#bg_input_cookies").is(":checked"))
		  	   showCookieDiscl ();
		   else
		   	   hideCookieDiscl ();
      });
	  
	  $("#suggestions tr").on("click", function ()
	  {
		  takeSugg ($(this));
		  cs.action ();
	  });
	  
	  $("#timeline_cardline").on("click", ".card", function ()
	  {
		  var index = $(this).attr("id").substr(5);
		  console.log("Manual choice: " + index);
		  cs.jukebox.playSample (index);
	  });
	  
	  $(cs.jukebox.audioelem).on("canplay", function ()
	  {
		  $("h2").stop();
		  $("h2").animate({color: "#33b5e5"}, 100);
	  });
	  
	  $(cs.jukebox.audioelem).on("play", function ()
	  {
		  cs.jukebox.ui.updateSeek();
	  });
	  
	  $(cs.jukebox.audioelem).on("ended", function ()
	  {
		  cs.jukebox.ui.playIcon("play");
		  if (cs.jukebox.repetitions > 1)
		  {
			  cs.jukebox.repetitions--;
			  cs.jukebox.play();
			  cs.jukebox.ui.playIcon("pause");
		  }
		  else if (parseInt(cs.jukebox.playing) < cs.jukebox.queue.length - 1)
		  {
			  cs.jukebox.playSample (parseInt(cs.jukebox.playing) + 1);
		  }
		  else
		  	$("#search-string").focus();
	  });
  });