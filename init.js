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
	  //MSA = window.setTimeout(function () {msaObj.appear()}, 600000);
	  
	  // character input, backspace, delete, comma, semicolon, arrow key right handled here
	  $(cs.INPUT).keyup( function (e)
	  {
		  liveSearchManager (e);
	  });
	  
	  // arrow key up/down handled here
	  $(cs.INPUT).keydown(function(e)
	  {
      		listNavigator (e);
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
	  
	  $(".overlay").on("click", ".overlay_exit", function (e)
	  {
		 var parentID = e.target.parentElement.id.substr(4);
		 if (isNaN(parentID))
		 	return;
		 for (var x = 0; x < Notification.registered.length; x++)
		 {
			   if (Notification.registered[x].id == parentID)
			   		Notification.registered[x].deleteIt();
			   return;
		 }
		 console.log("Notification not found. Not able to delete it.");
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
			  cs.jukebox.play ();
		  }
		  else if (parseInt(cs.jukebox.playing) < cs.jukebox.queue.length - 1)
		  {
			  cs.jukebox.playSample (parseInt(cs.jukebox.playing) + 1);
		  }
		  else
		  	$("#search-string").focus();
	  });
  });