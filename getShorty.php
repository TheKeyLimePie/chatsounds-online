<?php
	include_once("./BitlyPHP/bitly.php");

	$longUrl = htmlspecialchars($_POST["url"], ENT_QUOTES, "UTF-8");
	if(filter_var($longUrl, FILTER_VALIDATE_URL))
	{
		$jsonBitly = bitly_v3_shorten($longUrl, 'c57b0bde9fdb8468b115e2a6808d9c3701d01371', 'bit.ly');
		if($jsonBitly['status_code'] == 200)
			echo $jsonBitly['url'];
		else
			echo "ERROR: Code ".$jsonBitly['status_code'];
	}
	else
		echo "ERROR: The URI is invalid";
?>