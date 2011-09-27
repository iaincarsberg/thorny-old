/*global console window describe xdescribe it expect runs waits*/
(function () {
	require.paths.unshift(__dirname + '/../../../');
	
	var runner = require('thorny-specs/test-runner');
	
	describe('the load-level component', function () {
		it('should have the following functions', function () {
			var 
				ran = false,
				completedOne = false,
				completedTwo = false;
				
			runs(function () {
				require('thorny/base')('./config/default.json')(function ($) {
					var entity = $.es().makeEntity()
						.addComponent('load-level', './content/levels/room1.json')
						.addComponent('load-level', './content/levels/room2.json')
						.triggers('world-loaded');
					
					$.event().bind('world-loaded', function () {
						completedOne = true;
					});
					$.event().bind('world-loaded', function () {
						completedTwo = true;
					});
					
					ran = true;
				});//instanceof thorny
			});
			waits(200);
			runs(function () {
				expect(ran).toBeTruthy();
				expect(completedOne).toBeTruthy();
				expect(completedTwo).toBeTruthy();
			});
		});// it should have the following functions
		
		describe('the component under normal usage', function () {
			it('should load and parse a level file', function () {
				var ran = false;

				runs(function () {
					require('thorny/base')('./config/default.json')(function ($) {
						$.es().makeEntity()
							.addTag('world')
							.addComponent('load-level', './thorny-spec-demo/files/level/poly.json')
							.triggers('world-loaded');

						$.event().bind('world-loaded', function () {
							$.es().tag.get('world')
								.getComponent('load-level')
								.each(function (level) {
									// Test Copy'n'pasted from the mesh.spec's
									// final test.
									var 
										neightbours,
										iterator = level.data.iterator();
										
									iterator.rewind();
									neightbours = iterator.current().node.getNeightbours();
									expect(parseInt(neightbours.step().details.distanceTo, 10))
										.toEqual(47);

									iterator.next();
									neightbours = iterator.current().node.getNeightbours();
									expect(parseInt(neightbours.step().details.distanceTo, 10))
										.toEqual(47);
									expect(parseInt(neightbours.step().details.distanceTo, 10))
										.toEqual(52);

									iterator.next();
									neightbours = iterator.current().node.getNeightbours();
									expect(parseInt(neightbours.step().details.distanceTo, 10))
										.toEqual(52);
								});
							
							ran = true;
						});
					});//instanceof thorny
				});
				waits(200);
				runs(function () {
					expect(ran).toBeTruthy();
				});
			});// it should load and parse a level file
			
			it('should accept a options object and displace the loaded file according to the contains value', function () {
				runner(function ($, done) {
					$.es().makeEntity()
						.addTag('world')
						.addComponent('load-level', './thorny-spec-demo/files/level/poly.json', {
							x: 100,
							y: 200
						})
						.triggers('world-loaded');

					$.event().bind('world-loaded', function () {
						$.es().tag.get('world')
							.getComponent('load-level')
							.each(function (level) {
								expect(level.data.getX()).toEqual(100);
								expect(level.data.getY()).toEqual(200);
								
								done();
							});
					});
				});
			});// it should accept a options object and displace the loaded file according to the contains value
			
			describe('level-segments can be networked together using different techniques', function () {
				describe('the "file" method', function () {
					it('should use the files natural networking rules', function () {
						
					});// it should use the files natural networking rules
					
					it("shouldn't find any neighbours if none are set in the file", function () {
						
					});// it shouldn't find any neighbours if none are set in the file
				});// desc the "file" method
				
				describe('the "touching" method', function () {
					it('should find networked segments based on the position of the polygons in the level', function () {
						
					});// should find networked segments based on the position of the polygons in the level
					
					it('should ignore the natural networking rules', function () {
						
					});// it should ignore the natural networking rules
				});// desc the "touching" method
			});// desc level-segments can be networked together using different techniques
		});// the component under normal usage
	});// desc the load-level component
}());