/*global console window describe xdescribe it expect runs waits*/
(function () {
	require.paths.unshift(__dirname + '/../../../');
	
	describe('the lexical component', function () {
		it('should add the following components to the system', function () {
			var ran = false;
				
			runs(function () {
				require('thorny/base')('./config/default.json')(function ($) {
					$.es().makeEntity()
						.addTag('is-drawable')
						.addComponent('drawable');
					$.es().makeEntity()
						.addTag('is-collideable')
						.addComponent('collideable');
					
					// Test is-drawable
					expect($.getTag('is-drawable').hasComponent('drawable')).toBeTruthy();
					expect($.getTag('is-drawable').hasComponent('collideable')).toBeFalsy();
					
					// Test is-collideable
					expect($.getTag('is-collideable').hasComponent('drawable')).toBeFalsy();
					expect($.getTag('is-collideable').hasComponent('collideable')).toBeTruthy();
					
					ran = true;
				});//instanceof thorny
			});
			waits(200);
			runs(function () {
				expect(ran).toBeTruthy();
			});
		});// it should have the following functions
		
	});// desc the drawable component
}());