<?php
	$dir = '../../libs/';
	$dirs = array();
	if ($handle = opendir($dir)) {
	    while (false !== ($entry = readdir($handle))) {
	        if ($entry != "." && $entry != ".." && $entry != 'last-build' && $entry != 'last-stable') {
	            $dirs[] = $dir . '/' . $entry . '.000/';
	        }
	    }
	}
	closedir($handle);
	natsort($dirs); // sort.


	$mfile = $dir . 'manifest.json';
	if (file_exists($mfile)){
        $mconf= json_decode(file_get_contents($mfile));
	}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Lib Versions</title>
    <link rel="stylesheet" type="text/css" href="../css/style.css" />
</head>
<body>
	<h1>Lib Versions</h1>
	<?php include 'menu.php' ?>
	<table>
		<tr>
			<th>Name</th>
			<th>Version</th>
			<th>Built</th>
			<th>Flags</th>
			<th>Src</th>
		</tr>
<?php foreach ($dirs as $d) {
        $d = str_replace(".000", "", $d);
		$file = $d . 'manifest.json';
        if (file_exists($file)) {
        	$config = json_decode(file_get_contents($file));
?>
		<tr class="<?php if ($config->ver == $_GET['lib']) { echo 'notice'; }?>">
			<td>Youboralib</td>
			<td><?php echo $config->ver ?></td>
			<td><?php echo $config->built ?></td>
			<td>
				<?php echo $config->flags ?>
				<?php if ($config->ver == $mconf->lastStable) echo "last-stable "; if ($config->ver == $mconf->ver) echo "last-build"; ?>
			</td>
			<td>
				<a href="<?php echo $d ?>youboralib.js" title="View code"><img src="../img/js.png" alt="js"/></a>
				<a href="<?php echo $d ?>youboralib.min.js" title="View minified code"><img src="../img/min.png" alt="min"/></a>
			</td>
		</tr>
<?php
		}
	}
?>

	</table>
	<br/>
	<a href="plugins.php">Back</a>
	<br/>
	<h2>Changelog</h2>

	<iframe src="<?php echo $dir ?>/change.log" width="100%" height="1500" style="border:0"></iframe>
	<br/>
	<a href="plugins.php">Back</a>

</body>
</html>