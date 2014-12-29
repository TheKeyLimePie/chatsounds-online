
$("#headbar_cast").on("click", function ()
{
	var notiCast = new Notification ("Google Chromecast", "We're working on Google Chromecast support.<br />Stay tuned and (soon) happy casting!<br />ETA: I don't know...", true, 2);
	notiCast.init ();
});