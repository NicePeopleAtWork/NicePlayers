<?php
	$a = $_SERVER['HTTP_USER_AGENT'];

	$file = 'UA.txt';
	$current = file_get_contents($file);
	$current .= $a . "\r\n";
	file_put_contents($file, $current);

	echo $a
?>

OK