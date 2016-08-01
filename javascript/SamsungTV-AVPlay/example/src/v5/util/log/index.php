<?php
	if ($_GET['msg']) {
		$msg = "[" . date('H:i') . "] " . $_GET['msg'];
		file_put_contents('./' . date('ymd') . '.log', $msg . "\n", FILE_APPEND);
		echo $msg;
	}else if ($_GET['clear']){
		if ($handle = opendir('./')) {
		    while (false !== ($entry = readdir($handle))) {
		        if ($entry != "." && $entry != ".." && $entry != "index.php") {
		            unlink('./' . $entry);
		        }
		    }
		    closedir($handle);
		}
	}else{
		echo "'msg' argument not defined.";
	}