/*global console Stats, window*/
require('./thorny/base')('./config/default.json', './demos/02_navigation/config.json')(function ($) {
	var 
		gameLoop = $('thorny core game-loop').factory(),
		stats = new Stats();
	
	// Add Stats - Start
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.left = '0px';
	stats.domElement.style.top = '0px';
	window.document.getElementById('main').appendChild(stats.domElement);
	// Add Stats - End
	
	$.es().makeEntity()
		.addTag('player')
		.addComponent('drawable')
		.addComponent('position', {
			position: {
				x: 200, 
				y: 200
			}
		})
		.addComponent('moveable', {
			speed: 128
		});
	
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
		.addComponent('load-level', './content/levels/room1.json')
		.addComponent('load-level', './content/levels/room2.json')
		.triggers('world-loaded');
	
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
	
	$.event().bind('world-loaded', function () {
		gameLoop.start(function () {
			// Process any object that needs to move.
			$.es().searchByComponents('moveable')
				.each(function (moveable) {
					moveable.data.execute(this);
				});

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
});