/*global window*/
(function (module) {
	module.exports = function ($, module) {
		// We need to declair the base object before we register the global 
		// version otherwise when we do $('thorny quad-tree') it loses
		// scope.
		var base = {};
		
		// We want the quad-tree to be a globally available tool
		$.onInit(module, function () {
			// Bind the entity-system to the thorny object.
			$.registerGlobal('quadtree', function () {
				return base;
			});
			
			// $.data(module, 'entities', {});
		});
		
		/**
		 * Used to process the world into a quad tree
		 * @param int width Contains the width of zone we're quad-treeing
		 * @param int height Contains the height of zone we're quad-treeing
		 * @param array selector Contains the elements we're looking for in 
		 * our little quad envrioment
		 * @reutrn void
		 */
		base.process = function (width, height, selector) {
			//$.es().searchByComponents('drawable', 'position')
		};
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/common/level/quad-tree/base')));