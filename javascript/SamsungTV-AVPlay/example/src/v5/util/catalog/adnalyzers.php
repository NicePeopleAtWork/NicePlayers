<?php
	$dir = '../../adnalyzers/';
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
?>
<!DOCTYPE html>
<html>
<head>
    <title>V5 Adnalyzers Catalog</title>
    <link rel="stylesheet" type="text/css" href="../css/style.css" />
    <script src="../js/jquery-2.2.1.min.js"></script>
</head>
<body>
	<h1>V5 Adnalyzers</h1>
	<?php include 'menu.php' ?>
	<p><a href="#" onclick="$('.last-build').toggle()">Toggle last-build</a></p>

	<table>
		<tr>
			<th>Name</th>
			<th></th>
			<th>last-stable</th>
			<th>src</th>
			<th class="last-build">last-build</th>
			<th class="last-build">src</th>
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
			<td><a href="adnalyzer.php?adnalyzer=<?php echo $config->name ?>"><?php echo $config->name ?></a></td>
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
					<img src="../img/qa-missing.png" title="This poor adnalyzer needs testing." style="cursor: help;"/>
				<?php endif; ?>
			</td>
			<td class="<?php if ($config->lastStable != $config->ver) echo 'notice'; ?>">
				<?php echo $config->lastStable ?>
			</td>
			<td>
				<?php if ($config->lastStable != '-'): ?>
					<a href="<?php echo $dir . $config->name . '/' .$config->lastStable ?>/adnalyzer.js" title="View code"><img src="../img/js.png" alt="js"/></a>
					<a href="<?php echo $dir . $config->name . '/' .$config->lastStable ?>/adnalyzer.min.js" title="View minified code"><img src="../img/min.png" alt="min"/></a>
				<?php else: ?>
					-
				<?php endif; ?>
			</td>
			<td class="last-build">
				<?php echo $config->ver ?>
			</td>
			<td class="last-build">
				<a href="<?php echo $dir . $config->name . '/' .$config->ver ?>/adnalyzer.js" title="View code"><img src="../img/js.png" alt="js"/></a>
				<a href="<?php echo $dir . $config->name . '/' .$config->ver ?>/adnalyzer.min.js" title="View minified code"><img src="../img/min.png" alt="min"/></a>
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