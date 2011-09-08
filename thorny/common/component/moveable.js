/*global window*/
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
					user_facing: {x: 0, y: 0},
					speed: 1,
					easing: 'linear'// TODO
				};
			}()), options);
		},
	
		/**
		 * Used to build the execute options.
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
					time: false
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
			$.data(module, 'moveable', {});
			
			$.es().registerComponent('moveable', function (entity) {
				return {
					attach: function (options) {
						// The position is required.
						if (! entity.hasComponent('position')) {
							return false;
						}
						
						// Build the options.
						options = attachOptions($, options);
						
						// Build a new movable object.
						$.data(module, 'moveable')[entity.id] = $._.extend(
							entity.getComponent('position').data.expose(),
							{
								position_last: entity.getComponent('position').data.expose().position,
								user_facing: $('thorny math vector2').factory(options.user_facing.x, options.user_facing.y).normalize(),
								speed: options.speed,
								easing: options.easing,
								current_speed: 0,
								injected_processors: [],
								last_exec_time: $.time().now()
							}
						);
					},

					execute: function (options) {
						options = executeOptions($, options);
						
						// We need to know the current time, the time option 
						// exists to make the system more easily testable.
						if (options.time === false) {
							options.time = $.time().now();
						}
						
						var 
							i, 
							ii,
							self = $.data(module, 'moveable')[entity.id],
							processor,
							changes,
							
							// Localised data to allow the processor's to 
							// change the values without requiring access to
							// the internal state.
							direction = self.facing,
							position = self.position, 
							distance = this.getMoveDistance(options.time, self),
							goal = self.position.translate(
								self.facing,
								distance
								);
						
						// Execute any injected processors.
						for (i = 0, ii = self.injected_processors.length; i < ii; i += 1) {
							processor = self.injected_processors[i];
							
							// Execute the processor code.
							changes = processor({
								direction: direction,
								position:  position,
								distance:  distance,
								goal:      goal
							});
							
							// If valid changes we're made
							if (changes) {
								// Move the changed values back out of the 
								// changes object, so that they can used by 
								// other processors, and finally inserted into
								// the position.
								direction = changes.direction;
								position  = changes.position;
								distance  = changes.distance;
								goal      = changes.goal;
							}
						}
						
						
						// If a direction is set, update it.
						if (direction &&
							! (
								direction.getX() === 0 && 
								direction.getY() === 0
							)
						) {
							// Backup the last position.
							self.position_last = self.position;
							
							// Set the position and direction back into the 
							// position component.
							self.facing = direction;
							self.position = position.translate(
								direction,
								distance
								);
							
							entity.notifyObservers('moved');
						
						} else {
							// If the last position is different from the 
							// current position it means we havn't executed 
							// the last step in the movement.
							//
							// This step updates the entites position to
							// represent the exact location is in, and removes
							// its last ticks worth of funnel movement.
							if (self.position_last.getX() !== self.position.getX() &&
								self.position_last.getY() !== self.position.getY()
							) {
								self.position_last = self.position;
								entity.notifyObservers('moved');
							}
						}
					},
					
					expose: function () {
						return $.data(module, 'moveable')[entity.id];
					},
					
					inject: function (entity, code) {
						// TODO
						// The Idea here is that other components such as the
						// pathfinder and collision detector can inject 
						// functionality into this
						var self = $.data(module, 'moveable')[entity.id];
						
						self.injected_processors.push(code);
					},
					
					/**
					 * Used to get the amount of movement allowed.
					 * @param int now Contains the current time
					 * @return float Contain how far an entity can move this
					 * gameloop tick;
					 */
					getMoveDistance: function (now, options) {
						var distance = (
							options.speed * (now - options.last_exec_time)
						) / 1000;
						
						options.last_exec_time = now;
						
						return distance;
					}
				};
			});
		});
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/common/component/moveable')));