/*global window*/
(function (module) {
	/**
	 * Used to register components that are only used in a lexical sence, to
	 * group objects and the like.
	 * @param object subject Contains the object that is to be observed
	 * @return object Containing the injected observable functionality.
	 */
	module.exports = function ($, module) {
		$.onInit(module, function () {
			$.registerGlobal('unit_test', function (code) {
				console.log(code);
				return code;
			});
		});
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny-specs/test-runner')));