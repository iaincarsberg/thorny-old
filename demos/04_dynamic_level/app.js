/*global document console Stats, window*/
require('./thorny/base')('./config/default.json', './demos/04_dynamic_level/config.json')(function ($) {
	var 
		gameLoop = $('thorny core game-loop').factory(),
		stats = new Stats();
	
	///////////
	// START //
	///////////
	$.es().makeEntity()
		.addComponent('renderer', {
			system: 'processing',
			element: 'processing-canvas-1',
			width: 640,
			height: 480
		});
	
	$.es().makeEntity()
		.addTag('world')
		.triggers('world-loaded');
	
	
	// Setup
	$.getTag('world').addComponent(
		'load-level', 
		'./demos/04_dynamic_level/level/box.json', 
		{
			x: 0,
			y: 0,
			network: 'adjacent'
		}
	);
	$.es().makeEntity()
		.addTag('player')
		.addComponent('drawable')
		.addComponent('position', {
			position: {
				x: 25, 
				y: 25
			}
		})
		.addComponent('moveable', {
			speed: 128
		});
	
	// Fudge in a click event handler moving the ball around.
	(function () {
		var 
			canvas = window.jQuery('#processing-canvas-1'),
			offset = canvas.offset(),
			astar = $('thorny level pathfinder astar'),
			funnel = $('thorny level pathfinder funnel');

		$.getTag('world')
			.getComponent('load-level')
			.first(function (level) {
				canvas.click(function (e) {
					var 
						route,
						path,
						from,
						to,
						toClick = $('thorny math vector2').factory(
							e.pageX - offset.left,
							e.pageY - offset.top
						),
						player = $.getTag('player').getComponent('position').data.expose().position;

					from = level.data.xySearch($.getTag('world'), player.getX(), player.getY());
					to = level.data.xySearch($.getTag('world'), toClick.getX(), toClick.getY(), true);

					route = astar.search(from, to, 16);
					path = funnel.process(
						player,
						toClick,
						route,
						8
					);

					$.getTag('player')
						.addComponent('follow-path', {
							route: path,
							type: 'once'
						});
				});
			});
	}());
	// Setup
	
	gameLoop.start(function () {
		// Process any object that needs to move.
		$.es().searchByComponents('moveable')
			.each(function (moveable) {
				moveable.data.execute(this);
			});
		
		if (document.active_tile && document.place_at) {
			$.getTag('world').addComponent(
				'load-level', 
				document.active_tile, 
				{
					x: document.place_at.x * 50,
					y: document.place_at.y * 50,
					network: 'adjacent'
				}
			);
			
			// Unset the place at value.
			document.place_at = false;
		}

	}, function () {
		// Execute all of the renderer's
		$.es().searchByComponents('renderer')
			.each(function (renderer) {
				renderer.data.execute(this);
			});
		
		// Update MrDoob's FPS counter.
		stats.update();
	});
});