/*global window*/
(function (module) {
	/**
	 * Used to make an object observable
	 * @param object subject Contains the object that is to be observed
	 * @return object Containing the injected observable functionality.
	 */
	module.exports = function ($, module) {
		$.es().registerComponent('notunique', function (entity) {
			return {
				name: 'component notunique',
				isUnique: false,
				someUniqueValue: false,
				
				attach: function (someUniqueValue) {
					this.someUniqueValue = someUniqueValue;
				}
			};
		});
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny-spec-demo/common/component/notunique')));