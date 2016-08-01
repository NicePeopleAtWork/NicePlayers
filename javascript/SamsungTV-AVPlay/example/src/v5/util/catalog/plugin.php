<?php
	$dir = '../../plugins/' . $_GET['plugin'] . '/';
	$dirs = array();
	if ($handle = opendir($dir)) {
	    while (false !== ($entry = readdir($handle))) {
	        if ($entry != "." && $entry != ".." && $entry != 'last-build' && $entry != 'last-stable') {
	            $dirs[] = $dir . '/' . $entry . '/';
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
    <title>Plugin Versions</title>
    <link rel="stylesheet" type="text/css" href="../css/style.css" />
    <script>
    	function readplugin(id){
    		var url = 'readplugin.php?file=../../plugins/<?php echo $mconf->name; ?>/' + id + '/plugin.js';
    		var xhr = new XMLHttpRequest();
    		xhr.open("GET", url, true);
    		xhr.onload = function() {
    			document.getElementById('funcs'+id).innerHTML = xhr.responseText;
    		};
    		xhr.send();
    	}
    </script>
</head>
<body>
	<h1><?php echo $_GET['plugin'] ?> Versions</h1>
	<?php include 'menu.php' ?>
	<table>
		<tr>
			<th>Name</th>
			<th>Version</th>
			<th>Lib</th>
			<th>Built</th>
			<th>Flags</th>
			<th>Src</th>
			<th>Ads</th>
			<th>Functions</th>
		</tr>
<?php foreach ($dirs as $d) {
		$file = $d . 'manifest.json';
        if (file_exists($file)) {
        	$config = json_decode(file_get_contents($file));
?>
		<tr>
			<td><?php echo $config->name ?></td>
			<td><?php echo $config->ver ?></td>
			<td><a href="libs.php?lib=<?php echo $config->libVer ?>" title="View Lib"><?php echo $config->libVer ?></a></td>
			<td><?php echo $config->built ?></td>
			<td>
				<?php echo $config->flags ?>
				<?php if ($config->ver == $mconf->lastStable) echo "last-stable "; if ($config->ver == $mconf->ver) echo "last-build"; ?>
			</td>
			<td>
				<a href="<?php echo $d ?>/plugin.js" title="View code"><img src="../img/js.png" alt="js"/></a>
				<a href="<?php echo $d ?>/plugin.min.js" title="View minified code"><img src="../img/min.png" alt="min"/></a>
				<a href="<?php echo $d ?>/sp.min.js" title="View Smart Plugin"><img src="../img/sp.png" alt="SP"/></a>
			</td>
			<td>
			<?php if ($config->adnalyzers): ?>
				<?php foreach ($config->adnalyzers as $k => $v): ?>
					<a href="adnalyzer.php?adnalyzer=<?php echo $k ?>"><?php echo $v ?>-<?php echo $k ?></a>&nbsp;
				<?php endforeach; ?>
			<?php endif; ?>
			</td>
			<td class="comments" id="funcs<?php echo $config->ver ?>"></td>

		</tr>
		<?php $vers[] = $config->ver ?>

<?php
		}
	}
?>
	</table>
    <script><?php foreach ($vers as $ver) {?>readplugin('<?php echo $ver ?>');<?php } ?></script>

	<br/>
	<a href="plugins.php">Back</a>
	<br/>

	<h2>Features</h2>
	<div id="feats">Loading...</div>
	<script>
    		var url = '../../plugins/<?php echo $mconf->name; ?>/features.json';
    		var xhr = new XMLHttpRequest();
    		xhr.open("GET", url, true);
    		xhr.onload = function() {
    			try{
    				var code = '<table><tr><th>Name</th><th>Status</th><th>Since</th><th>Comments</th></tr>';
    				var resp = JSON.parse(xhr.responseText);
    				for (var i = 0; i < resp.length; i++) {
    					code += '<tr>';
    					code += '<td>' + resp[i].name + '</td>';
    					code += '<td class="' + resp[i].status + '">' + resp[i].status + '</td>';
    					code += '<td>' + resp[i].since + '</td>';
    					code += '<td class="comments">' + resp[i].comments + '</td>';
    					code += '</tr>';

    				}
    				code += '</table>';
    				document.getElementById('feats').innerHTML = code;
    			}catch(err){
    				document.getElementById('feats').innerHTML = "features.json is missing or corrupted.";
    			}
    		};
    		xhr.send();
	</script>
	<br/>
	<a href="plugins.php">Back</a>
	<br/>

	<h2>Changelog</h2>
	<iframe src="<?php echo $dir ?>/change.log" width="100%" height="500" style="border:0"></iframe>
	<br/>
	<a href="plugins.php">Back</a>

</body>
</html>