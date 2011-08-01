/*global window*/
(function (module) {
	/**
	 * Used to build the attach options.
	 * @param object $ Contains a reference to thorny
	 * @param object options Contains the attachment specific options
	 * @return object Containing the attached options
	 */
	var attachOptions = function ($, options) {
		if (typeof options !== 'object') {
			options = {};
		}
		return $._.extend((function () {
			return {
				position: {x: 0, y: 0},
				facing: {x: 0, y: 0}
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
			$.data(module, 'positions', {});
			
			$.es().registerComponent('position', function (entity) {
				return {
					attach: function (options) {
						if (options !== undefined && typeof options !== 'object') {
							if (arguments.length >= 2 && typeof arguments[0] === 'number' && typeof arguments[1] === 'number') {
								options = {
									position: {
										x: arguments[0],
										y: arguments[1]
									}
								};
							}
						}
						
						options = attachOptions($, options);
						$.data(module, 'positions')[entity.id] = {
							position: $('thorny math vector2').factory(options.position.x, options.position.y),
							facing: $('thorny math vector2').factory(options.facing.x, options.facing.y).normalize()
						};
					},

					execute: function () {
						return $.data(module, 'positions')[entity.id];
					},
					
					expose: function () {
						return $.data(module, 'positions')[entity.id];
					}
				};
			});
		});
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/common/component/position')));