<?php
	$manifest = json_decode(file_get_contents('../../libs/manifest.json'));
	$config = (object) array('author' => '');
	if (file_exists('../config.json'))
	{
		$config = json_decode(file_get_contents('../config.json'));
	} else {
		file_put_contents('../config.json', "{\n\t\"author\": \"\"\n}");
	}

	function copyFile($origin, $destiny) {
		// Backup file
		if (file_exists($destiny))
			copy($destiny, $destiny . "_old"	);

		// Copy
		$file = file_get_contents($origin);
		$file = str_replace('[plugin_name]', ucfirst($_GET['plugin']), $file);
		$file = str_replace('[plugin_name_min]', strtolower($_GET['plugin']), $file);
		$file = str_replace('[plugin_ver]', strtolower($_GET['ver']), $file);
		$file = str_replace('[author]', $_GET['author'], $file);
		$file = str_replace('[lib]', $_GET['lib'], $file);
		$file = str_replace('[today]', date("d/m/y"), $file);
		file_put_contents($destiny, $file);
	}
?>
	<!DOCTYPE html>
	<html>

	<head>
		<title>New Plugin</title>
    	<link rel="stylesheet" type="text/css" href="../css/style.css" />
	</head>

	<body>
		<h1>New Plugin</h1>
		<?php if ($_GET['plugin'] != ""): ?>
			<div style="background-color: aliceblue; padding: 20px">
				<?php
					// Create dir if not exists
					$dir = '../../plugins/' . strtolower($_GET['plugin']);
					if(!file_exists($dir. '/src/'))
						mkdir($dir . '/src/', 0777, true);

					// Copy files
					copyFile('plugin.js', $dir . '/src/plugin.js');
					copyFile('manifest.json', $dir . '/manifest.json');
					copyFile('features.json', $dir . '/features.json');
					copyFile('change.log', $dir . '/change.log');
				?>

				<p>Scaffold created at '
					<?php echo sprintf("plugins/%s/", strtolower($_GET['plugin'])); ?>'.</p>
				<p>Remember to <b>restart gulp</b>.</p>
				<p><a href="index.php">Back</a></p>
			</div>
		<?php else: ?>
		<form method="get" action="index.php">
		<table>
			<tr>
				<th>Name</th>
				<th align="left">Value</th>
			</tr>
			<tr>
				<td>Plugin:</td>
				<td><input type="text" name="plugin" placeholder="Videojs5" /></td>
			</tr>
			<tr>
				<td>Author:</td>
				<td><input type="text" name="author" value="<?php echo $config->author ?>" /></td>
			</tr>
			<tr>
				<td>Plugin Version:</td>
				<td><input type="text" name="ver" value="5.3.0" /></td>
			</tr>
			<tr>
				<td>Lib Version:</td>
				<td><input type="text" name="lib" value="<?php echo $manifest->ver ?>" /></td>
			</tr>
			<caption align="bottom"><br/><input type="submit" value="Generar" /></caption>
		</table>
		</form>
		<?php endif ?>
	</body>

	</html>