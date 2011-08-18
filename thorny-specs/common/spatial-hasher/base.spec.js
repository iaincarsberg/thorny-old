/*global console window describe xdescribe it expect runs waits*/
(function () {
	require.paths.unshift(__dirname + '/../../../');
	
	var runner = require('thorny-specs/test-runner');
	
	describe('the spatial-hasher module', function () {
		it('should have the following functions', function () {
			runner(function ($, done) {
				var spatial = $('thorny spatial-hasher base');
				
				// Test instanced version
				//   Base
				expect(typeof spatial).toEqual('object');
				expect(typeof spatial.factory).toEqual('function');
				expect(typeof spatial.setup).toEqual('function');
				//   Factory
				expect(typeof spatial.factory()).toEqual('object');
				expect(typeof spatial.factory().inject).toEqual('function');
				expect(typeof spatial.factory().process).toEqual('function');
				
				// Test Global version
				expect(typeof $.spatial_hasher()).toEqual('object');
				expect(typeof $.spatial_hasher().inject).toEqual('function');
				expect(typeof $.spatial_hasher().process).toEqual('function');
				done();
			});// runner
		});// it should have the following functions
		
		describe('has a factory function', function () {
			describe('has a inject function', function () {
				it('should return a copy of the spatial-hasher, used in object chaining', function () {
					runner(function ($, done) {
						var 
							spatial_1 = $('thorny spatial-hasher base').factory(),
							spatial_2 = $.spatial_hasher();

						expect(spatial_1.inject()).toEqual(spatial_1);
						expect(spatial_1.inject().inject()).toEqual(spatial_1);
						expect(spatial_1.inject().inject().inject()).toEqual(spatial_1);

						expect(spatial_2.inject()).toEqual(spatial_2);
						expect(spatial_2.inject().inject()).toEqual(spatial_2);
						expect(spatial_2.inject().inject().inject()).toEqual(spatial_2);
						
						done();
					});// runner
				});// it should return a copy of the spatial-hasher, used in object chaining
				
				it('should rasterise a simple shape into the hashmap', function () {
					// Place the vector in the middle of a rasterised section,
					// so when we rasterise it gives us an even box
					runner(function ($, done) {
						$.es().makeEntity()
							.addTag('player')
							.addComponent('drawable')
							.addComponent('position', {
								position: {
									x: 72, 
									y: 72
								}
							})
							.addComponent('moveable', {
								size: 48
							});
						
						$.spatial_hasher()
							.inject($.getTag('player'))
							.process(function (search) {
								var 
									x, xx,
									y, yy,
									level = [
										[0, 0, 0, 0, 0, 0, 0, 0, 0],
										[0, 1, 1, 1, 1, 1, 1, 1, 0],
										[0, 1, 1, 1, 1, 1, 1, 1, 0],
										[0, 1, 1, 1, 1, 1, 1, 1, 0],
										[0, 1, 1, 1, 1, 1, 1, 1, 0],
										[0, 1, 1, 1, 1, 1, 1, 1, 0],
										[0, 1, 1, 1, 1, 1, 1, 1, 0],
										[0, 1, 1, 1, 1, 1, 1, 1, 0],
										[0, 0, 0, 0, 0, 0, 0, 0, 0]
									];
								
								for (y = 0, yy = level.length; y < yy; y += 1) {
									for (x = 0, xx = level[y].length; x < xx; x += 1) {
										if (level[y][x] === 1) {
											expect(search(x * 16, y * 16)).toBeTruthy();
											expect(search(x * 16, y * 16)).toEqual({1: true});
											
										} else {
											expect(search(x * 16, y * 16)).toBeFalsy();
										}
									}
								}
								
								done();
							});
					});
				});// it should rasterise a simple shape into the hashmap
				
				it('should rasterise multiple simple shapes into the hashmap', function () {
					runner(function ($, done) {
						$.es().makeEntity()
							.addTag('player_1')
							.addComponent('drawable')
							.addComponent('position', {
								position: {
									x: 24, 
									y: 24
								}
							})
							.addComponent('moveable', {
								size: 16
							});
							
						$.es().makeEntity()
							.addTag('player_2')
							.addComponent('drawable')
							.addComponent('position', {
								position: {
									x: 72, 
									y: 72
								}
							})
							.addComponent('moveable', {
								size: 16
							});
							
						$.es().makeEntity()
							.addTag('player_3')
							.addComponent('drawable')
							.addComponent('position', {
								position: {
									x: 24, 
									y: 120
								}
							})
							.addComponent('moveable', {
								size: 16
							});
						
						$.spatial_hasher()
								.inject($.getTag('player_1'))
								.inject($.getTag('player_2'))
								.inject($.getTag('player_3'))
							.process(function (search) {
								var 
									x, xx,
									y, yy,
									level = [
										[1, 1, 1, 0, 0, 0, 0, 0, 0],
										[1, 1, 1, 0, 0, 0, 0, 0, 0],
										[1, 1, 1, 0, 0, 0, 0, 0, 0],
										[0, 0, 0, 2, 2, 2, 0, 0, 0],
										[0, 0, 0, 2, 2, 2, 0, 0, 0],
										[0, 0, 0, 2, 2, 2, 0, 0, 0],
										[3, 3, 3, 0, 0, 0, 0, 0, 0],
										[3, 3, 3, 0, 0, 0, 0, 0, 0],
										[3, 3, 3, 0, 0, 0, 0, 0, 0]
									];
								
								for (y = 0, yy = level.length; y < yy; y += 1) {
									for (x = 0, xx = level[y].length; x < xx; x += 1) {
										if (level[y][x] === 1) {
											expect(search(x * 16, y * 16)).toBeTruthy();
											expect(search(x * 16, y * 16)).toEqual({1: true});
										
										} else if (level[y][x] === 2) {
											expect(search(x * 16, y * 16)).toBeTruthy();
											expect(search(x * 16, y * 16)).toEqual({2: true});
											
										} else if (level[y][x] === 3) {
											expect(search(x * 16, y * 16)).toBeTruthy();
											expect(search(x * 16, y * 16)).toEqual({3: true});
										
										} else {
											expect(search(x * 16, y * 16)).toBeFalsy();
										}
									}
								}
								
								done();
							});
					});
				});// it should rasterise multiple simple shapes into the hashmap
			});// desc has a inject function

			describe('has a process function', function () {
				it('should set the size to 16', function () {
					runner(function ($, done) {
						// Set the size.
						$('thorny spatial-hasher base').setup({
							size: 16
						});
						done();
					});
				});//it should set the size to 16
				
				it('should return an object with an access function to access items in a collection', function () {
					runner(function ($, done) {
						$.spatial_hasher().process(function (search) {
							expect(typeof search).toEqual('function');
							expect(search(0, 0)).toBeFalsy();
							
							done();
						});
					});
				});// it should return an object with an access function to access items in a collection
				
				it('should mark spatial regions as populated', function () {
					runner(function ($, done) {
						$.spatial_hasher()
							.inject($('thorny math vector2').factory(0, 0))
							.inject($('thorny math vector2').factory(16, 0))
							.inject($('thorny math vector2').factory(0, 16))
							.process(function (search) {
								expect(typeof search).toEqual('function');
								
								// Use absolute x/y values
								expect(search(0, 0)).toBeTruthy();
								expect(search(16, 0)).toBeTruthy();
								expect(search(0, 16)).toBeTruthy();
								expect(search(16, 16)).toBeFalsy();
								
								// Use a vector2
								expect(search($('thorny math vector2').factory(0, 0))).toBeTruthy();
								expect(search($('thorny math vector2').factory(16, 0))).toBeTruthy();
								expect(search($('thorny math vector2').factory(0, 16))).toBeTruthy();
								expect(search($('thorny math vector2').factory(16, 16))).toBeFalsy();
								done();
							});
					});
				});// it should
			});// desc has a process function
		});// desc has a factory function
		
		describe('has an options function', function () {
			it('should return the defaults correctly', function () {
				runner(function ($, done) {
					var options = $('thorny spatial-hasher base').setup({}, true);
					
					expect(options.size).toEqual(16);
					done();
				});
			});// it should return the defaults correctly
			
			it('should return the customisation correctly', function () {
				runner(function ($, done) {
					var options = $('thorny spatial-hasher base').setup({
						size: 32
					}, true);
					
					expect(options.size).toEqual(32);
					
					// Makesure the change persists into a new instance of 
					// the hasher.
					expect($('thorny spatial-hasher base').setup({}, true).size).toEqual(32);
					done();
				});
			});// it should return the customisation correctly
		});// desc has an options function 
	});// desc the spatial-hasher module
}());