| <?php

	$file = $_GET['file'];
	if (file_exists($file)) {
		$content = file_get_contents($file);
		$vars = array('getPlayerVersion', 'getMediaDuration', 'getPlayhead', 'getIsLive', 'getResource', 'getBitrate', 'getThroughput', 'getRendition', 'getTotalBytes', 'getTitle', 'getAdResource', 'getAdPlayhead', 'getAdPosition', 'getAdTitle', 'getAdDuration', 'getAdBitrate', 'getAdThroughput', 'getAdPlayerVersion');

		foreach ($vars as $k => $v) {
			if (strpos($content, '.' . $v . ' = ') !== false) {
				echo str_replace('get', '', $v) . ' | ';
			}
		}

	}
?>