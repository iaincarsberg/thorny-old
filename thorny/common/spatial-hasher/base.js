/*global window*/
(function (module) {
	// Contains the global value, means we can set the size once, and it will
	// persist.
	var options = {
		size: 16
	};
	
	module.exports = function ($, module) {
		// Contains the spatial hashing system.
		var base = {};
		
		// We want the quad-tree to be a globally available tool
		$.onInit(module, function () {
			/*
			 * Bind the base object to the engine.
			 * 
			 * Usage:
			 * 
			 * $.spatial_hasher()
			 *    .inject($.getTag('player'))
			 *    .inject($.es().searchByComponents('drawable', 'position', 'collideable'))
			 *    .inject($.getTag('world'))
			 *    .process(function (hash) {
			 *        $.event().trigger('hashed'. hash);
			 *    });
			 * 
			 * OR
			 * 
			 * $('thorny spatial-hasher base').factory()
			 *    .inject($.getTag('player'))
			 *    .inject($.es().searchByComponents('drawable', 'position', 'collideable'))
			 *    .inject($.getTag('world'))
			 *    .process(function (hash) {
			 *        $.event().trigger('hashed'. hash);
			 *    });
			*/
			$.registerGlobal('spatial_hasher', function () {
				return base.factory();
			});
			
			
			/*
			.:ideas:.
			
			when you execute process it returns a hash of locations for example
			
			var hashes = {
				'0-0': {1: true, 17: true},
				'6-4': {16: true},
				...
			};
			
			with each key in the hash containing any items that are within 
			that spatial hash.
			
			this allows other scripts to later scan for any collisions, and
			handle those.
			
			So so sudo code...
			
			$.spatial_hasher()
				.inject($.es().searchByComponents('drawable', 'position', 'collideable'))
				.inject($.getTag('world'))
				.process(function (hash) {
					// Execute the module that is responsible for triggering
					// collision events.
					$.collision_detector(
						$.getTag('world'),
						$.es().searchByComponents(
							'position', 
							'collideable'
							),
						hash
						);
				});
			*/
		});
		
		/**
		 * Used to configure the spatial hasher
		 * @param object options Contains options that are used to customise
		 * the way hashes are generated
		 * @param boolean|undefined expose_options Used for unittesting
		 * @reutrn void
		 */
		base.setup = function (new_options, expose_options) {
			// Merge the options
			options = $._.extend(options, new_options);
			
			if (expose_options === true) {
				return options;
			}
		};
		
		/**
		 * Used to create a new spatial hash
		 * @param void
		 * @return object Containing logic used to build and access a spatial 
		 * hash of the game world.
		 */
		base.factory = function () {
			// Contains the hash
			var hashmap = {};
			
			return {
				/**
				 * Used to hash an x and y value
				 * @param int x Contains the x value
				 * @param int y Contains the y value
				 * @return string Containing the hash
				 */
				hash: function (x, y) {
					return Math.floor(x / options.size) + 
						'=' + 
						Math.floor(y / options.size);
				},
				
				/**
				 * Used to inject objects or collections into spatial scene
				 * @param void
				 * @return this to allow object chaining
				 */
				inject: function (item) {
					var that = this;
					
					if (item === undefined) {
						return this;
					}
					
					// 
					if (item.hasComponent !== undefined &&
						item.hasComponent('position') &&
						item.hasComponent('moveable')
					) {
						(function () {
							var
								position = item.getComponent('position').data.expose(),
								moveable = item.getComponent('moveable').data.expose(),
								hash = that.hash(position.position.getX(), position.position.getY()),
								x, 
								y, 
								x_floor = Math.floor((position.position.getX() - moveable.size) / options.size), 
								y_floor = Math.floor((position.position.getY() - moveable.size) / options.size),
								x_seiling = Math.ceil((position.position.getX() + moveable.size) / options.size),
								y_seiling = Math.ceil((position.position.getY() + moveable.size) / options.size);
							
							// Makesure the hash exists
							if (hashmap[hash] === undefined) {
								hashmap[hash] = {};
							}
							
							for (y = y_floor; y < y_seiling; y += 1) {
								for (x = x_floor; x < x_seiling; x += 1) {
									hash = that.hash(
										x * options.size,
										y * options.size
										);

									// Makesure the hash exists
									if (hashmap[hash] === undefined) {
										hashmap[hash] = {};
									}

									hashmap[hash][item.id] = true;
								}
							}
						}());
					
					} else if (
						item.hasComponent !== undefined &&
						item.hasComponent('position')
					) {
						(function () {
							// ...
						}());
						
					} else {
						(function () {
							// Hash the input
							var hash = that.hash(item.getX(), item.getY());

							// Makesure the hash exists
							if (hashmap[hash] === undefined) {
								hashmap[hash] = {};
							}

							hashmap[hash][item.id] = true;
						}());
					}
					
					return this;// returns the base object
				},

				/**
				 * Used to process the injected objects.
				 * @param function callback Called once the scene has been processed
				 * @reutrn void
				 */
				process: function (callback) {
					var that = this;
					
					/**
					 * Used to search the spatial hash map.
					 * @param int|object x Contains either the x value, or a vector2
					 * @param int y Contains the y value
					 * @return object Containing a list of encountered object or false
					 */
					callback(function (x, y) {
						if (typeof x === 'object') {
							y = x.getY();
							x = x.getX();
						}
						
						// Hash the input
						var hash = that.hash(x, y);
						
						if (hashmap[hash] !== undefined) {
							return hashmap[hash];
						}
						
						return false;
					});
				}
			};
		};
		
		return base;
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/common/spatial-hasher/base')));