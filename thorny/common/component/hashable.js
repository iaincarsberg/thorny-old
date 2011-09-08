/*global window*/
(function (module) {
	/**
	 * Used to make an object hashable
	 * @param object subject Contains the object that is to be observed
	 * @return object Containing the injected observable functionality.
	 */
	module.exports = function ($, module) {
		$.onInit(module, function () {
			// Contains an instance of the hashmap
			var hashmap = false;
			
			// Create an instance of the hashmap
			$.registerGlobal('hashmap', function () {
				if (! hashmap) {
					hashmap = $.spatial_hasher();
				}
				return hashmap;
			});
			
			$.es().registerComponent('hashable', function (entity) {
				return {
					attach: function () {
						var that = this;
						
						// Hash the entity into the hashmap
						$.hashmap().inject(entity);
						
						// If the entity is moveable, it means we will need to
						// rehash this object per movement.
						if (entity.hasComponent('moveable')) {
							entity.addObserver(
								$('thorny core observer')({
									moved: function (entity) {
										// Refresh the entities location in
										// the hashmap
										$.hashmap().removeEntityFromHashmap(entity);
										$.hashmap().inject(entity);
									}
								})
							);
						}
					}
				};
			});
		});
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/common/component/hashable')));