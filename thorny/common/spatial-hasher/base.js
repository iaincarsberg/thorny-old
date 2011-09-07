/*global window console*/
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
			 *    .process(function (instance) {
			 *        instance.search(0, 0);
			 *        $.event().trigger('hashed'. hash);
			 *    });
			*/
			$.registerGlobal('spatial_hasher', function () {
				return base.factory();
			});
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
				},//hash
				
				/**
				 * Used to expose the hashmap in a way that directly altering
				 * it wound't break anything.
				 * @param void
				 * @return object Containing the hashmap
				 */
				getHashmap: function () {
					return $._.extend({}, hashmap);
				},//getHashmap
				
				/**
				 * Used to search the hashmap
				 * @param object|int x Contains the x param or an object
				 * @param int y Contains the y param
				 * @return array|false Contains the enteries in the found hash
				 */
				search: function (x, y) {
					if (typeof x === 'object') {
						y = x.getY();
						x = x.getX();
					}
					
					// Hash the input
					var hash = this.hash(x, y);
					
					if (hashmap[hash] !== undefined) {
						return hashmap[hash];
					}
					
					return {};
				},//search
				
				/**
				 * Used to inject objects or collections into spatial scene
				 * @param void
				 * @return this to allow object chaining
				 */
				inject: function (item) {
					var that = this, route, i, size;
					
					if (item === undefined) {
						return that;// returns the base object
					}
					
					// If an entity is moveable then we need to rasterise the
					// area in which it moves through.
					if (item.hasComponent !== undefined &&
						item.hasComponent('position') &&
						item.hasComponent('moveable')
					) {
						// Plot the actors movement.
						route = that.rayTraceLine(
							item, 
							hashmap,
							item.getComponent('moveable').data.expose().position_last,
							item.getComponent('moveable').data.expose().position
							);
						
						size = item.getComponent('moveable').data.expose().getSize();
						
						// Iterate over the route, and hash the region 
						// surounding each point.
						for (i = 0; i < route.length; i += 1) {
							that.hashRegion(
								item, 
								hashmap, 
								size, 
								route[i],
								true
								);
						}
					
					// If an entity has the has the position attribute then
					// we need to raster the region it enhabits.
					} else if (
						item.hasComponent !== undefined &&
						item.hasComponent('position')
					) {
						that.hashRegion(item, hashmap);
					
					// Otherwise we need to rasterise a single point.
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
					
					return that;// returns the base object
				},//inject
				
				/**
				 * Used to remove all instances of an entity from the hashmap
				 * @param object entity Contains an entity we're clearing out
				 * of the hashmap.
				 * @return this to allow object chaining
				 */
				removeEntityFromHashmap: function (entity) {
					if (entity.id === undefined) {
						return this;// returns the base object
					}
					
					var key;
					for (key in hashmap) {
						if (hashmap.hasOwnProperty(key) &&
							hashmap[key][entity.id]
						) {
							hashmap[key][entity.id] = false;
						}
					}
					
					return this;// returns the base object
				},//removeEntityFromHashmap

				/**
				 * Used to process the injected objects.
				 * @param function callback Called once the scene has been processed
				 * @return this to allow object chaining
				 */
				process: function (callback) {
					var that = this;
					
					/**
					 * Used to search the spatial hash map.
					 * @param object that Contains the current instance of the
					 * spatial hasher function
					 * @return object Containing a list of encountered object or false
					 */
					callback(that);
					
					return that;
				},//process
				
				/**
				 * Marks an entity as being in a specific hash
				 * @param object entity Contains the entity being stored
				 * @param string hash Contains a hash
				 * @param object hashmap Contains the hashmap
				 * @return void
				 */
				putEntityIntoHashmap: function (entity, hash, hashmap) {
					// Makesure the hash is valid
					if (entity === undefined || entity.id === undefined) {
						return;
					}
					
					// Makesure the hash exists
					if (hashmap[hash] === undefined) {
						hashmap[hash] = {};
					}
					
					// If the entity isn't set, or is false we want to return 
					// true, so that when appending the traced route we dont
					// append duplicate enteries.
					if (hashmap[hash][entity.id] === undefined ||
						! hashmap[hash][entity.id]
					) {
						hashmap[hash][entity.id] = true;
						return true;
					}
					return false;
				},
				
				/**
				 * Used to hash a region of the hashmap
				 * @param object entity Contains the entity being hashed
				 * @param object hashmap Contains the hashmap
				 * @param optional int region_size Contains the size of the 
				 * region being hashed
				 * @param optional object position Contains a vector2
				 * @param optional boolean preScaled True if the position has
				 * already been scaled by the {options.size} value.
				 * @return this to allow object chaining
				 */
				hashRegion: function (entity, hashmap, region_size, position, preScaled) {
					position = (position !== undefined) ? position : entity.getComponent('position').data.expose().position;
					region_size = (region_size !== undefined) ? region_size : entity.getComponent('position').data.expose().getSize();
					
					var
						that = this,
						hash = this.hash(position.getX(), position.getY()),
						x, 
						y, 
						x_floor, 
						y_floor,
						x_seiling,
						y_seiling;
					
					if (preScaled) {
						region_size = Math.ceil(region_size / options.size);
						
						x_floor   = position.getX() - region_size;
						y_floor   = position.getY() - region_size;
						x_seiling = position.getX() + region_size + 1;
						y_seiling = position.getY() + region_size + 1;
						
					} else {
						x_floor   = Math.floor((position.getX() - region_size) / options.size);
						y_floor   = Math.floor((position.getY() - region_size) / options.size);
						x_seiling = Math.ceil((position.getX()  + region_size) / options.size);
						y_seiling = Math.ceil((position.getY()  + region_size) / options.size);
					}
					
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
							
							that.putEntityIntoHashmap(entity, hash, hashmap);
						}
					}
					return this;// returns the base object
				},//hashRegion
				
				/**
				 * Used to trace a line through hashed space
				 * @param object entity Contains the entity that is moving 
				 * through 2d space.
				 * @param object hashmap Contains the hashmap we're tracing a
				 * vector of movement though
				 * @param object start Contains a vector2 defining the start 
				 * of the movement vector
				 * @param object end Contains a vector2 defining the end of 
				 * the movement vector
				 * @return array Containg vectors we travelled through
				 */
				rayTraceLine: function (entity, hashmap, start, end) {
					// Uses Bresenham's line algorithm.
					var
						that = this,
						x0 = Math.floor(start.getX() / options.size),
						y0 = Math.floor(start.getY() / options.size),
						x1 = Math.floor(end.getX() / options.size),
						y1 = Math.floor(end.getY() / options.size),
						dx = Math.abs(x1 - x0),
						dy = Math.abs(y1 - y0),
						sx = ((x0 < x1) ? 1 : -1),
						sy = ((y0 < y1) ? 1 : -1),
						route = [],
						err = dx - dy,
						e2,
						v2 = $('thorny math vector2');
					
					while (true) {
						if (this.putEntityIntoHashmap(entity, x0 + '=' + y0, hashmap)) {
							route.push(v2.factory(x0, y0));
						}
						
						if (x0 === x1 && y0 === y1) {
							break;
						}
						
						e2 = 2 * err;
						
						if (e2 > -dy) {
							err -= dy;
							x0 += sx;
							
							// Hacky hacky code - start
							if (this.putEntityIntoHashmap(entity, x0 + '=' + y0, hashmap)) {
								route.push(v2.factory(x0, y0));
							}
							// Hacky hacky code - end
						}
						
						if (e2 < dx) {
							err += dx;
							y0 += sy;
						}
					}
					
					return route;
				}//rayTraceLine
			};
		};
		
		return base;
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/common/spatial-hasher/base')));