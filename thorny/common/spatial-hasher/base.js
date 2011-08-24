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
					
					return false;
				},//search
				
				/**
				 * Used to inject objects or collections into spatial scene
				 * @param void
				 * @return this to allow object chaining
				 */
				inject: function (item) {
					var that = this;
					
					if (item === undefined) {
						return that;// returns the base object
					}
					
					// If an entity is moveable then we need to rasterise the
					// area in which it moves through.
					if (item.hasComponent !== undefined &&
						item.hasComponent('position') &&
						item.hasComponent('moveable')
					) {
						console.log(
							that.rayTraceLine(
								item, 
								hashmap,
								$('thorny math vector2').factory(0, 0),
								$('thorny math vector2').factory(10, 2)
								)
							);
						
						/*
						.:TODO:.
						Need to write some code to rasterise lines of movement
						then iterate over the rasterised line, and hash the
						region around the line.
						
						This will give me an hashed representation of an 
						entity moving though 2d space.
						*/
						that.hashRegion(item, hashmap);
					
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
				 * Used to hash a region of the hashmap
				 * @param object entity Contains the entity being hashed
				 * @param object hashmap Contains the hashmap
				 * @param optional int region_size Contains the size of the region being hashed
				 * @param optional object position Contains a vector2
				 * @return this to allow object chaining
				 */
				hashRegion: function (entity, hashmap, region_size, position) {
					position = (position !== undefined) ? position : entity.getComponent('position').data.expose().position;
					region_size = (region_size !== undefined) ? region_size : entity.getComponent('position').data.expose().getSize();
					
					var
						that = this,
						hash = this.hash(position.getX(), position.getY()),
						x, 
						y, 
						x_floor   = Math.floor((position.getX() - region_size) / options.size), 
						y_floor   = Math.floor((position.getY() - region_size) / options.size),
						x_seiling = Math.ceil((position.getX()  + region_size) / options.size),
						y_seiling = Math.ceil((position.getY()  + region_size) / options.size);
					
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

							hashmap[hash][entity.id] = true;
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
					// setup phase
					var
						x     = start.getX(),
						y     = start.getY(),
						endX  = end.getX(),
						endY  = end.getY(),
						stepX = ((x > endX) ? -1 : 1),
						stepY = ((y > endY) ? -1 : 1),
						tMaxX,
						tMaxY;
					
					// loop phase
					//var
					//	tX = Math.floor(start.getX() / options.size),
					//	tY = Math.floor(start.getY() / options.size);
					
					while (true) {
						if (tMaxX < tMaxY) {
							tMaxX += options.size;
							x += stepX;
							
						} else {
							tMaxY += options.size;
							y += stepY;
						}
						console.log(x, y);
						break;
					}
					
					/*
					loop {
						if(	tMaxX < tMaxY) {
							tMaxX= tMaxX + tDeltaX;
							X= X + stepX;
						} else {
							tMaxY= tMaxY + tDeltaY;
							Y= Y + stepY;
						}
						NextVoxel(X,Y);
					}
					*/
				}//rayTraceLine
			};
		};
		
		return base;
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/common/spatial-hasher/base')));