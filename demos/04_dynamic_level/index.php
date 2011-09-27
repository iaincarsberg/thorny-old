<?php

include_once dirname(__FILE__).'/../../build/config.php';
$root = dirname(__FILE__) . '/../..';
$raw_files = array_merge(
	Config::factory(
		$root,
		'config/thorny-spec-demo.json',
		FALSE
		),
	Config::factory(
		$root,
		'demos/04_dynamic_level/config.json',
		FALSE
		)
);
$files = array();
foreach ($raw_files as $file) {
	$files[] = str_replace($root, '', $file);
}


$levels = array();
$base = '.' . str_replace(realpath($root), '', dirname(__FILE__)) . '/level/';
foreach (scandir(dirname(__FILE__) . '/level') as $file) {
	if (strtolower(substr($file, -4)) !== 'json') {
		continue;
	}
	$levels[$file] = $base . $file;
}

?>
<html>
<head>
	<title>Thorny Engine: Dynamic Levels</title>
	<style type="text/css" media="screen">
body{background: #ABC;}
header, footer, div#main{width:1100px;margin: 0 auto;}
canvas{border: 1px solid #444;float:left;margin-right: 10px;}
ul{margin: 0;padding: 0;list-style: none;}
fieldset{width: 400px;border:1px solid #444;}
ul a{display: block;}
.selected{background-color: yellow;}
#main{position: relative;}
	</style>
</head>
<body>
	<header>
		<h2>Thorny Engine: Dynamic Levels</h2>
		<p>
			Shows off the engines ability to dynamically add level segments 
			into the world, this allows for the game world to be streamed from
			the server, meaning you can have a pretty massive world.<br />
			Or implement some kind of procedural content creation pipeline :D
		</p>
		<p>
			This implementation is going to require a number of assumptions to
			be made on the content being loaded. Any level segments loaded 
			using this approach will be required to adhere to a tileable 
			format.<br />
			This is to allow the engine to assume that any points projected 
			onto one another form an edge that should be used for networking
			the two points together.
		</p>
	</header>
	<div id="main">
		<canvas id="processing-canvas-1" width="640", height="480"></canvas>
		<fieldset>
			<legend>Which tile to place?</legend>
			<ul class="level-segment">
<?php foreach ($levels as $name=> $path): ?>
				<li><a href="#" title="Used to add the box.json level" data-file="<?php echo $path; ?>"><?php echo $name; ?></a></li>
<?php endforeach ?>
			</ul>
		</fieldset>
		<fieldset>
			<legend>And where to place it?</legend>
			<table border="1" class="location">
<?php for ($y=0; $y < 10; $y++): ?>
				<tr>
<?php 	for ($x=0; $x < 10; $x++): ?>
					<td><a id="<?php echo sprintf('cell-%d-%d', $x, $y) ?>" href="#" title="Add a level segment to <?php echo "$x - $y"; ?>" data-x="<?php echo $x; ?>" data-y="<?php echo $y; ?>"><?php echo "$x - $y"; ?></a></td>
<?php 	endfor; ?>
				</tr>
<?php endfor; ?>
			</table>
		</fieldset>
	</div>
	<footer>
		<p>&copy; Iain Carsberg</p>
	</footer>
	<script src="/node.js"></script>
	<script src="/lib/json.js"></script>
	<script src="/lib/jquery-1.6.1.min.js"></script>
	<script src="/lib/underscore.js"></script>
	<script src="/lib/underscore-min.js"></script>
	<script src="/lib/processing-1.2.1.min.js"></script>
	<script src="/lib/Stats.js"></script>
<?php foreach ($files as $file): ?>
	<script src="<?php echo $file; ?>"></script>
<?php endforeach; ?>

	<script>
// Make some global variables that thorny will be able to access.
document.active_tile = false;
document.place_at = false;

$(document).ready(function () {
	document.active_tile = $('ul a:first').addClass('selected').data('file');
	$('#cell-0-0').hide();
	
	$('.level-segment a').click(function () {
		$('.level-segment a').removeClass('selected');
		$(this).addClass('selected');
		
		document.active_tile = $(this).data('file');
		
		return false;
	});
	
	$('.location a').click(function () {
		document.place_at = {
			x: $(this).data('x'),
			y: $(this).data('y')
		};
		$(this).hide();
		return false;
	});
	
	$('table a')
		.mouseover(function () {
			$('#main').append(
				$('<div>')
					.addClass('hover-item')
					.css({
						position: 'absolute',
						top: $(this).data('y') * 50,
						left: $(this).data('x') * 50,
						background: 'red',
						opacity: 0.2,
						width: 51,
						height: 51
					})
				);
			})
		.mouseleave(function () {
			$('.hover-item').remove();
			});
});
	</script>
	<script>
// Make console not crash IE
if (typeof console === 'undefined') {
	console = {
		log: function() {}
	};
}
<?php echo file_get_contents('app.js'); ?>
	</script>
</body>
</html>