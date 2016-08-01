<?php
	$dir = '../../plugins/';
	$dirs = array();
	if ($handle = opendir($dir)) {
	    while (false !== ($entry = readdir($handle))) {
	        if ($entry != "." && $entry != "..") {
	            $dirs[] = $dir . '/' . $entry . '/';
	        }
	    }
	}
	closedir($handle);
	natsort($dirs); // sort

	$libfile = '../../libs/manifest.json';
	if (file_exists($libfile)){
        $libconf= json_decode(file_get_contents($libfile));
	}
?>
<!DOCTYPE html>
<html>
<head>
    <title>V5 Plugin Catalog</title>
    <link rel="stylesheet" type="text/css" href="../css/style.css" />
    <script src="../js/jquery-2.2.1.min.js"></script>
</head>
<body>
	<h1>V5 Plugins</h1>
	<?php include 'menu.php' ?>
	<p><strong>Lib last-build:</strong> <?php echo $libconf->ver ?> / <strong>Lib last-stable:</strong> <?php echo $libconf->lastStable ?></p>
	<p><a href="#" onclick="$('.last-build').toggle()">Toggle last-build</a></p>

	<table>
		<tr>
			<th>Name</th>
			<th><img src="../img/qa-gold.png" /></th>
			<th>last-stable</th>
			<th>last-stable lib</th>
			<th>src</th>
			<th class="last-build">last-build</th>
			<th class="last-build">last-build lib</th>
			<th class="last-build">src</th>
			<th class="last-build">Testing</th>
		</tr>
<?php foreach ($dirs as $d) {
		$file = $d . 'manifest.json';
        if (file_exists($file)) {
        	$config = json_decode(file_get_contents($file));

        	$file2 = $d . '/last-stable/manifest.json';
        	$config2 = false;
        	if (file_exists($file2)){
        		$config2 = json_decode(file_get_contents($file2));
        	}
?>
		<tr>
			<td><a href="plugin.php?plugin=<?php echo $config->name ?>"><?php echo $config->name ?></a></td>
			<td>
				<?php if ($config->ver == $config->lastStable): ?>
					<?php if ($config->libVer == $libconf->ver): ?>
					<img src="../img/qa-gold.png" title="Tested with the last version, hoorray!" style="cursor: help;"/>
					<?php else: ?>
					<img src="../img/qa-silver.png" title="Tested, but not with the last lib version." style="cursor: help;"/>
					<?php endif; ?>

				<?php elseif ($config->lastStable != "-"): ?>
					<img src="../img/qa-bronze.png" title="New version available for testing." style="cursor: help;"/>
				<?php else: ?>
					<img src="../img/qa-missing.png" title="This poor plugin needs testing." style="cursor: help;"/>
				<?php endif; ?>
			</td>
			<td class="<?php if ($config->lastStable != $config->ver) echo 'notice'; ?>">
				<?php echo $config->lastStable ?>
			</td>
			<td class="<?php if ($config2->libVer != $libconf->lastStable && $config2->libVer != $libconf->ver) echo 'notice'; ?>">
				<?php if ($config->lastStable != '-'): ?>

				<a href="libs.php?lib=<?php echo $config2 ? $config2->libVer : "-" ?>" title="View Lib">
					<?php echo $config2 ? $config2->libVer : "-"?>
				</a>
				<?php else: ?>
					-
				<?php endif; ?>
			</td>
			<td>
				<?php if ($config->lastStable != '-'): ?>
					<a href="<?php echo $dir . $config->name . '/' .$config->lastStable ?>/plugin.js" title="View code"><img src="../img/js.png" alt="js"/></a>
					<a href="<?php echo $dir . $config->name . '/' .$config->lastStable ?>/plugin.min.js" title="View minified code"><img src="../img/min.png" alt="min"/></a>
					<a href="<?php echo $dir . $config->name . '/' .$config->lastStable ?>/sp.min.js" title="View Smart Plugin"><img src="../img/sp.png" alt="SP"/></a>
				<?php else: ?>
					-
				<?php endif; ?>
			</td>
			<td class="last-build">
				<?php echo $config->ver ?>
			</td>
			<td class="last-build <?php if ($config->libVer != $libconf->lastStable && $config->libVer != $libconf->ver) echo 'notice'; ?>">
				<a href="libs.php?lib=<?php echo $config ? $config->libVer : "-" ?>" title="View Lib">
					<?php echo $config->libVer ?>
				</a>
			</td>
			<td class="last-build">
				<a href="<?php echo $dir . $config->name . '/' .$config->ver ?>/plugin.js" title="View code"><img src="../img/js.png" alt="js"/></a>
				<a href="<?php echo $dir . $config->name . '/' .$config->ver ?>/plugin.min.js" title="View minified code"><img src="../img/min.png" alt="min"/></a>
				<a href="<?php echo $dir . $config->name . '/' .$config->ver ?>/sp.min.js" title="View Smart Plugin"><img src="../img/sp.png" alt="SP"/></a>
			</td>
			<td class="last-build">
				<?php
					$playerFolder = '../../../../samples/players/' . str_replace('-', '/', $config->name);
					$deviceFolder = '../../../../samples/devices/' . str_replace('-', '/', $config->name);
				?>
				<?php if (file_exists($playerFolder)): ?>
					<a href="<?php echo $playerFolder; ?>" title="Player testing environments"><img src="../img/test-players.png" alt="js"/></a>
				<?php endif; ?>
				<?php if (file_exists($deviceFolder)): ?>
					<a href="<?php echo $deviceFolder; ?>" title="Device testing environments"><img src="../img/test-devices.png" alt="js"/></a>
				<?php endif; ?>
			</td>
		</tr>
<?php
		}
	}
?>
	</table>
	<br/>
	<a href="index.php">Back</a>
</body>
</html>