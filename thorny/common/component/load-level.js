/*global window*/
(function (module) {
	/**
	 * Used to make an object observable
	 * @param object subject Contains the object that is to be observed
	 * @return object Containing the injected observable functionality.
	 */
	module.exports = function ($, module) {
		$.onInit(module, function () {
			$.data(module, 'loaded-levels', {});
			
			$.es().registerComponent('load-level', function (entity) {
				return {
					/**
					 * Contains an instance of the $.level() module.
					 * @var object level
					 */
					data: false,
					
					/**
					 * One entity can have multiple loads loaded, the ideal would 
					 * be to use one entity as a world, for example
					 * 
					 * $.es().makeEntity()
					 *   .addTag('world')
					 *   .addComponent('load-level', 'some/map/file.format')
					 *   .addComponent('load-level', 'some/other/map/file.format');
					 */
					isUnique: false,
					processAsCollection: true,
					asynchronousAttachEvent: 'load-level-completed',

					/**
					 * Used to attach a level to an entity.
					 * @param object entity Contains the entity we're attatching a
					 * level to.
					 * @param string file Contains the file to load
					 * @param optional object options Containing options used
					 * to overide the placed possition of a tile, and how its
					 * networked into the level.
					 * @return void
					 * @throws 'Thorny.level: Attempted to load malformed level'
					 * @throws component.load-level.attach(n, "path.json"); unable to attach file because type not mesh'
					 */
					attach: function (file, options) {
						var level = this;
						if (typeof file !== 'string') {
							return false;
						}
						
						options = $._.extend((function () {
							/*
							Network key:
							
							file     - uses the levels network list,
							touching - scans each polygone to find matching 
							           edges, which are used to network level
							           segments together.
							*/
							
							return {
								x: false,
								y: false,
								network: 'file'
							};
						}()), options);
						
						// Open the required level
						entity.openFile(file, function (data) {
							// If the level is already loaded, then do nothing.
							if (level.data !== false) {
								return;
							}
							
							// Parse the json data.
							data = $.json.parse(data);
							
							// Makesure the data isn't invalid.
							$.level().validateNotMalformed(data);
							
							var 
								i,
								ii,
								components = entity
									.getComponent('load-level');
							
							// An entity can only ever have one type of level
							// attached, so we need to check the others.
							components.each(function (level) {
								if (level.data !== false &&
									level.data.loadedLevelType !== data.type
								) {
									throw new Error(
										'component.load-level.attach(' + entity.id + ', "' + file + '"); unable to attach file because type not ' + level.data.level.loadedLevelType
									);
								}
							});
							
							// If we were given an absolute location for this
							// tile to be loaded, then place the tile in the
							// desired location.
							if (options.x !== false &&
								options.y !== false
							) {
								data.x = options.x;
								data.y = options.y;
							}
							
							// Load the level
							level.data = $.level(data);
							
							// Network seperate levels together.
							$.level().network_segments(
								options.network,
								level, 
								components,
								data.network
								);
							
							/**
							 * Build an edge list, the idea of this to build a
							 * list of all the external edges within a loaded
							 * world (made up of multiple segments) so that 
							 * later we can easily and quickly scan for 
							 * any collisions that may occure.
							 */
							components.each(function (existingLevel) {
								/**
								 * Ideally when adding a new level segment we 
								 * wouldn't have to completly rebuild the 
								 * structure as this will waste time at 
								 * runtime.
								 * 
								 * Also now maybe a good time to rework the 
								 * level system so it becomes possible to 
								 * position new elements via code, to allow 
								 * for procedurally generated content.
								 */
								//console.log('TODO', file, options);
							});
							
							// Alert anything listening that the level has 
							// been altered
							entity.notifyObservers('altered');
						});
					}
				};
			});// registerComponent load-level
		});// onInit
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/common/component/load-level')));