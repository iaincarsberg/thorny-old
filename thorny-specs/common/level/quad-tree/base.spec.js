/*global console window describe it expect runs waits*/
(function () {
	require.paths.unshift(__dirname + '/../');
	
	describe('the levels quad-tree module', function () {
		it('should have the following functions', function () {
			var ran = false;
			runs(function () {
				require('thorny/base')('./config/default.json')(function ($) {
					var qt = $.quadtree();
					
					expect(typeof qt).toEqual('object');
					expect(typeof qt.process).toEqual('function');
					
					ran = true;
				});//instanceof thorny
			});
			waits(200);
			runs(function () {
				expect(ran).toBeTruthy();
			});
		});//it should have the following functions
		
		describe('should have a process function', function () {
			
		});
	});
}());