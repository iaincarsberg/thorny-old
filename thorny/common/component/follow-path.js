/*global window console*/
(function (module) {
	var 
		/**
		 * Used to build the attach options.
		 * @param object $ Contains a reference to thorny
		 * @param object options Contains the attachment specific options
		 * @return object Containing the attached options
		 */
		attachOptions = function ($, options) {
			if (typeof options !== 'object') {
				options = {};
			}
			return $._.extend((function () {
				return {
					// Required
					// Contains the route that is to be followed
					route: [],
					
					// Contains the loop type, can be 'once' or 'cycle'
					type: 'once',
					
					// Contains a function that is execute once a route has
					// been compoleted.
					complete: false
				};
			}()), options);
		},
	
		/**
		 * Used to build the attach options.
		 * @param object $ Contains a reference to thorny
		 * @param object options Contains the attachment specific options
		 * @return object Containing the attached options
		 */
		executeOptions = function ($, options) {
			if (typeof options !== 'object') {
				options = {};
			}
			return $._.extend((function () {
				return {
					direction: false,
					position:  false,
					distance:  false,
					goal:      false
				};
			}()), options);
		};
	
	/**
	 * Used to make an object observable
	 * @param object subject Contains the object that is to be observed
	 * @return object Containing the injected observable functionality.
	 */
	module.exports = function ($, module) {
		$.onInit(module, function () {
			$.data(module, 'paths', {});
			
			$.es().registerComponent('follow-path', function (entity) {
				return {
					// You can have multiple paths
					isUnique: false,
					
					// And we want to process all of them at once, so we can 
					// select the correct path.
					processAsCollection: true,
					
					attach: function (options) {
						var base = this;
						
						// The position is required.
						if (! entity.hasComponent('position') ||
							! entity.hasComponent('moveable')) {
							return false;
						}
						
						// Build the options.
						options = attachOptions($, options);
						
						// The path must be named
						if (options.name === false) {
							return false;
						}
						
						// Build a new path object.
						$.data(module, 'paths')[entity.id] = {
							route: base.vectorifyRoute(options.route),
							type:  options.type,
							
							// Contains the callback
							complete: options.complete,
							
							// Contains the id of the next item in the route
							node: false,
							
							// Contains the current target in the route
							target: false
						};
						
						// Inject a hook to execute this function per 
						// moveable update.
						entity.getComponent('moveable')
							.data
							.inject(entity, function (data) {
								return base.execute(
									$._.extend(
										{path: $.data(module, 'paths')[entity.id]}, 
										data
										)
									);
							});
					},
					
					/**
					 * Used to follow a path around the world.
					 * @param object entity Contains the entity currently
					 * being executed.
					 * @param object|undefined moveable Contains a reference 
					 * to entities moveable component
					 * @param distance|undefined distance Contains the 
					 * distance the moveable is able to move this tick.
					 * @return void
					 */
					execute: function (options) {
						options = executeOptions($, options);
						
						// Makesure the options are valid
						if (options.path      === false ||
							options.direction === false ||
							options.position  === false || 
						    options.distance  === false ||
						    options.goal      === false
						) {
							return;
						}
						
						// Default the node
						if (! options.path.node) {
							options.path.node = 0;
						}
						
						// Default the target, if there are enough points in the route
						if (! options.path.target && options.path.route.length > options.path.node) {
							options.path.target = options.path.route[options.path.node];
							
							options.direction = options.position.rotateToFace(options.path.target);
						}
						
						var toTarget;
						while (true) {
							// If there is a target find out how far away it is.
							if (options.path.target) {
								toTarget = options.position.distance(options.path.target);
								
							} else {
								toTarget = 0;
							}
							
							// If the traveled distance is grater than the 
							// distance to the target, then we need to move to
							// the target, and check the next target in 
							// the chain.
							if (options.distance >= toTarget) {
								options.distance -= toTarget;
								options.position = options.path.target;
								options.path.node += 1;
								
								// Update the target
								if (options.path.type === 'once') {
									options.path.target = (options.path.node >= options.path.route.length) ? false : options.path.route[options.path.node];
									
								} else if (options.path.type === 'cycle') {
									options.path.target = options.path.route[
										(options.path.node % options.path.route.length)
										];
								}
								
								// If the path has been completed call the 
								// complete callback
								if ((options.path.node % options.path.route.length) === 0 &&
									typeof options.path.complete === 'function'
								) {
									options.path.complete();
								}
								
								// Update the direction
								if (options.path.target) {
									options.direction = options.position.rotateToFace(options.path.target);
									
									// We want to iterate onto the next node, so continue.
									continue;
								
								// If there is no target, remove the movement direction
								} else {
									options.direction = false;
								}
							}
							
							// All done :)
							break;
						}
						
						return options;
					},
					
					expose: function () {
						return $.data(module, 'moveable')[entity.id];
					},
					
					inject: function (name, code) {
						// TODO
						// The Idea here is that other components such as the
						// pathfinder and collision detector can inject 
						// functionality into this
						var self = $.data(module, 'moveable')[entity.id];
						
						if (self.validity_tests[name] !== undefined) {
							throw new Error('TODO - Inject cannot replace the functionality in "' + name + '"');
						}
						
						self.validity_tests[name] = code;
					},
					
					/**
					 * Used to vectorify the route.
					 * @param array route Contains the route [{x:0, y:0}, ...
					 * @return array Containing a collection of vector2s
					 */
					vectorifyRoute: function (route) {
						var i, ii, node, vector2s = [], v2;
						for (i = 0, ii = route.length; i < ii; i += 1) {
							node = route[i];
							
							// Makesure the node looks right
							if (typeof(node) !== 'object') {
								continue;
							}
							
							// If we have an object thats basically {x:0,y:0}
							if (
								node.x !== undefined &&
								node.y !== undefined
							) {
								v2 = $('thorny math vector2')
									.factory(node.x, node.y);
								
							// If we have an existing vector2
							} else if (
								node.getX !== undefined &&
								node.getY !== undefined &&
								typeof node.getX === 'function' &&
								typeof node.getY === 'function'
							) {
								v2 = node;
								
							// Otherwise
							} else {
								continue;
							}
							
							vector2s.push(v2);
						}
						
						return vector2s;
					}
				};
			});
		});
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/common/component/follow-path')));