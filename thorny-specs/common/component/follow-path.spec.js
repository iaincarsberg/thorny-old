/*global console window describe xdescribe it expect runs waits*/
(function () {
	require.paths.unshift(__dirname + '/../../../');
	
	describe('the follow-path component', function () {
		it('should have the following functions', function () {
			var ran = false;
				
			runs(function () {
				require('thorny/base')('./config/default.json')(function ($) {
					var entity = $.es().makeEntity()
						.addComponent('position')
						.addComponent('moveable')
						.addComponent('follow-path');
					
					expect(typeof entity.getComponent('follow-path')).toEqual('object');
					expect(typeof entity.getComponent('follow-path').data).toEqual('object');
					expect(typeof entity.getComponent('follow-path').data.length).toEqual('number');
					expect(entity.getComponent('follow-path').data.length).toEqual(1);
					
					expect(typeof entity.getComponent('follow-path').data[0].isUnique).toEqual('boolean');
					expect(typeof entity.getComponent('follow-path').data[0].processAsCollection).toEqual('boolean');
					expect(entity.getComponent('follow-path').data[0].isUnique).toBeFalsy();
					expect(entity.getComponent('follow-path').data[0].processAsCollection).toBeTruthy();
					
					expect(typeof entity.getComponent('follow-path').data[0].attach).toEqual('function');
					expect(typeof entity.getComponent('follow-path').data[0].update).toEqual('function');
					expect(typeof entity.getComponent('follow-path').data[0].execute).toEqual('function');
					expect(typeof entity.getComponent('follow-path').data[0].expose).toEqual('function');
					expect(typeof entity.getComponent('follow-path').data[0].inject).toEqual('function');
					expect(typeof entity.getComponent('follow-path').data[0].vectorifyRoute).toEqual('function');
					
					expect(typeof entity.getComponent('follow-path').each).toEqual('function');
					expect(typeof entity.getComponent('follow-path').first).toEqual('function');
					
					ran = true;
				});//instanceof thorny
			});
			waits(200);
			runs(function () {
				expect(ran).toBeTruthy();
			});
		});// it should have the following functions
		
		describe('has an attach function', function () {
			it("shouldn't attach without the position component", function () {
				var ran = false;

				runs(function () {
					require('thorny/base')('./config/default.json')(function ($) {
						try {
							var entity = $.es().makeEntity()
								.addComponent('moveable')
								.addComponent('follow-path');
							expect(false).toBeTruthy();
							
						} catch (e) {
							expect(e.message).toEqual('entity.addComponent(moveable, "[]"); Failed to attach to the entity.');
							expect(true).toBeTruthy();
						}
						
						ran = true;
					});//instanceof thorny
				});
				waits(200);
				runs(function () {
					expect(ran).toBeTruthy();
				});
			});// it shouldn't attach without the position component
			
			it("shouldn't attach without the moveable component", function () {
				var ran = false;

				runs(function () {
					require('thorny/base')('./config/default.json')(function ($) {
						try {
							var entity = $.es().makeEntity()
								.addComponent('position')
								.addComponent('follow-path');
							expect(false).toBeTruthy();
							
						} catch (e) {
							expect(e.message).toEqual('entity.addComponent(follow-path, "[]"); Failed to attach to the entity.');
							expect(true).toBeTruthy();
						}
						
						ran = true;
					});//instanceof thorny
				});
				waits(200);
				runs(function () {
					expect(ran).toBeTruthy();
				});
			});// it shouldn't attach without the moveable component
			
			describe("the process of adding a new path to an entity, that should be stored within the $.data('paths')", function () {
				it("should add a new element based on the used name using the defaults", function () {
					var ran = false;
					
					runs(function () {
						require('thorny/base')('./config/default.json')(function ($) {
							var 
								data = $.data('thorny component follow-path', 'paths'),
								entity = $.es().makeEntity()
								.addComponent('position')
								.addComponent('moveable')
								.addComponent('follow-path');
							
							expect(typeof data[entity.id]).toEqual('object');
							expect(typeof data[entity.id]).toEqual('object');
							expect(typeof data[entity.id].route).toEqual('object');
							expect(typeof data[entity.id].route.length).toEqual('number');
							expect(typeof data[entity.id].type).toEqual('string');
							expect(typeof data[entity.id].node).toEqual('boolean');
							expect(typeof data[entity.id].target).toEqual('boolean');
							expect(typeof data[entity.id].complete).toEqual('boolean');
							
							expect(data[entity.id].route).toEqual([]);
							expect(data[entity.id].type).toEqual('once');
							expect(data[entity.id].node).toBeFalsy();
							expect(data[entity.id].target).toBeFalsy();
							expect(data[entity.id].complete).toBeFalsy();
							
							ran = true;
						});//instanceof thorny
					});
					waits(200);
					runs(function () {
						expect(ran).toBeTruthy();
					});
				});// it should add a new element based on the used name using the defaults
				
				it("should add a new element using custom values", function () {
					var ran = false;
					
					runs(function () {
						require('thorny/base')('./config/default.json')(function ($) {
							var 
								data = $.data('thorny component follow-path', 'paths'),
								e1 = $.es().makeEntity()
								.addComponent('position')
								.addComponent('moveable')
								.addComponent('follow-path', {
									type: 'cycle'
								}),
								e2 = $.es().makeEntity()
								.addComponent('position')
								.addComponent('moveable')
								.addComponent('follow-path', {
									type: 'linear'
								});
							
							// entity 1
							expect(data[e1.id].route).toEqual([]);
							expect(data[e1.id].type).toEqual('cycle');
							expect(data[e1.id].node).toBeFalsy();
							expect(data[e1.id].target).toBeFalsy();
							
							// entity 2
							expect(data[e2.id].route).toEqual([]);
							expect(data[e2.id].type).toEqual('linear');
							expect(data[e2.id].node).toBeFalsy();
							expect(data[e2.id].target).toBeFalsy();
							
							ran = true;
						});//instanceof thorny
					});
					waits(200);
					runs(function () {
						expect(ran).toBeTruthy();
					});
				});// it should add a new element using custom values
			});// desc the process of adding a new path to an entity, that should be stored within the $.data('paths')
		});// desc has an attach function
		
		describe('has an execute function', function () {
			describe('that works differently depending on the loop type', function () {
				describe('with linear paths', function () {
					it('should move the entity along the path', function () {
						var rans = 0, fixtures;

						runs(function () {
							require('thorny/base')('./config/default.json')(function ($) {
								$.time().tick();
								var 
									i,	// Used for loop control
									ii,	// Used for loop delimiting
									f,  // Will contains fixture data
									data = $.data('thorny component follow-path', 'paths');
								
								fixtures = [
									// First loop
									{duration:     0, position: [  0,   0]},
									{duration:  1000, position: [ 10,   0]},
									{duration:  2000, position: [ 20,   0]},
									{duration:  3000, position: [ 30,   0]},
									{duration:  4000, position: [ 40,   0]},
									{duration:  5000, position: [ 50,   0]},
									{duration:  6000, position: [ 60,   0]},
									{duration:  7000, position: [ 70,   0]},
									{duration:  8000, position: [ 80,   0]},
									{duration:  9000, position: [ 90,   0]},
									{duration: 10000, position: [100,   0]},
									{duration: 11000, position: [100,  10]},
									{duration: 12000, position: [100,  20]},
									{duration: 13000, position: [100,  30]},
									{duration: 14000, position: [100,  40]},
									{duration: 15000, position: [100,  50]},
									{duration: 16000, position: [100,  60]},
									{duration: 17000, position: [100,  70]},
									{duration: 18000, position: [100,  80]},
									{duration: 19000, position: [100,  90]},
									{duration: 20000, position: [100, 100]},
									{duration: 21000, position: [ 90, 100]},
									{duration: 22000, position: [ 80, 100]},
									{duration: 23000, position: [ 70, 100]},
									{duration: 24000, position: [ 60, 100]},
									{duration: 25000, position: [ 50, 100]},
									{duration: 26000, position: [ 40, 100]},
									{duration: 27000, position: [ 30, 100]},
									{duration: 28000, position: [ 20, 100]},
									{duration: 29000, position: [ 10, 100]},
									{duration: 30000, position: [  0, 100]},
									{duration: 31000, position: [  0,  90]},
									{duration: 32000, position: [  0,  80]},
									{duration: 33000, position: [  0,  70]},
									{duration: 34000, position: [  0,  60]},
									{duration: 35000, position: [  0,  50]},
									{duration: 36000, position: [  0,  40]},
									{duration: 37000, position: [  0,  30]},
									{duration: 38000, position: [  0,  20]},
									{duration: 39000, position: [  0,  10]},
									{duration: 40000, position: [  0,   0]},
									
									// Second loop
									{duration: 41000, position: [  0,   0]},
									{duration: 42000, position: [  0,   0]},
									{duration: 43000, position: [  0,   0]},
									{duration: 44000, position: [  0,   0]},
									{duration: 45000, position: [  0,   0]},
									{duration: 46000, position: [  0,   0]},
									{duration: 47000, position: [  0,   0]},
									{duration: 48000, position: [  0,   0]},
									{duration: 49000, position: [  0,   0]},
									{duration: 50000, position: [  0,   0]},
									{duration: 51000, position: [  0,   0]},
									{duration: 52000, position: [  0,   0]},
									{duration: 53000, position: [  0,   0]},
									{duration: 54000, position: [  0,   0]},
									{duration: 55000, position: [  0,   0]},
									{duration: 56000, position: [  0,   0]},
									{duration: 57000, position: [  0,   0]},
									{duration: 58000, position: [  0,   0]},
									{duration: 59000, position: [  0,   0]},
									{duration: 60000, position: [  0,   0]},
									{duration: 61000, position: [  0,   0]},
									{duration: 62000, position: [  0,   0]},
									{duration: 63000, position: [  0,   0]},
									{duration: 64000, position: [  0,   0]},
									{duration: 65000, position: [  0,   0]},
									{duration: 66000, position: [  0,   0]},
									{duration: 67000, position: [  0,   0]},
									{duration: 68000, position: [  0,   0]},
									{duration: 69000, position: [  0,   0]},
									{duration: 70000, position: [  0,   0]},
									{duration: 71000, position: [  0,   0]},
									{duration: 72000, position: [  0,   0]},
									{duration: 73000, position: [  0,   0]},
									{duration: 74000, position: [  0,   0]},
									{duration: 75000, position: [  0,   0]},
									{duration: 76000, position: [  0,   0]},
									{duration: 77000, position: [  0,   0]},
									{duration: 78000, position: [  0,   0]},
									{duration: 79000, position: [  0,   0]},
									{duration: 80000, position: [  0,   0]},
								];
								
								
								// Execute all of the fixture data
								for (i = 0, ii = fixtures.length; i < ii; i += 1) {
									f = fixtures[i];
									
									$.es().makeEntity()
										.addTag('actor-' + i)
										.addComponent('position', 0, 0)
										.addComponent('moveable', {
											speed: 10
										})
										.addComponent('follow-path', {
											type: 'once',
											route: [
												{x: 100, y: 0},
												{x: 100, y: 100},
												{x: 0, y: 100},
												{x: 0, y: 0}
											]
										});
									
									$.getTag('actor-' + i).executeComponent('moveable', {
										time: $.time().now() + f.duration
									});
									expect(
										$.getTag('actor-' + i)
											.getComponent('position')
											.data
											.expose()
											.position
											.getSimpleCoords()
										).toEqual(f.position);
									
									rans += 1;
								}
							});//instanceof thorny
						});
						waits(200);
						runs(function () {
							expect(rans).toMatch(fixtures.length);
						});
					});// it should move the entity along the path
				});// desc with linear paths
				
				describe('with cycling paths', function () {
					it('should move the entity along the path', function () {
						var rans = 0, fixtures;

						runs(function () {
							require('thorny/base')('./config/default.json')(function ($) {
								$.time().tick();
								var 
									i,	// Used for loop control
									ii,	// Used for loop delimiting
									f,  // Will contains fixture data
									data = $.data('thorny component follow-path', 'paths');
								
								fixtures = [
									// First loop
									{duration:     0, position: [  0,   0]},
									{duration:  1000, position: [ 10,   0]},
									{duration:  2000, position: [ 20,   0]},
									{duration:  3000, position: [ 30,   0]},
									{duration:  4000, position: [ 40,   0]},
									{duration:  5000, position: [ 50,   0]},
									{duration:  6000, position: [ 60,   0]},
									{duration:  7000, position: [ 70,   0]},
									{duration:  8000, position: [ 80,   0]},
									{duration:  9000, position: [ 90,   0]},
									{duration: 10000, position: [100,   0]},
									{duration: 11000, position: [100,  10]},
									{duration: 12000, position: [100,  20]},
									{duration: 13000, position: [100,  30]},
									{duration: 14000, position: [100,  40]},
									{duration: 15000, position: [100,  50]},
									{duration: 16000, position: [100,  60]},
									{duration: 17000, position: [100,  70]},
									{duration: 18000, position: [100,  80]},
									{duration: 19000, position: [100,  90]},
									{duration: 20000, position: [100, 100]},
									{duration: 21000, position: [ 90, 100]},
									{duration: 22000, position: [ 80, 100]},
									{duration: 23000, position: [ 70, 100]},
									{duration: 24000, position: [ 60, 100]},
									{duration: 25000, position: [ 50, 100]},
									{duration: 26000, position: [ 40, 100]},
									{duration: 27000, position: [ 30, 100]},
									{duration: 28000, position: [ 20, 100]},
									{duration: 29000, position: [ 10, 100]},
									{duration: 30000, position: [  0, 100]},
									{duration: 31000, position: [  0,  90]},
									{duration: 32000, position: [  0,  80]},
									{duration: 33000, position: [  0,  70]},
									{duration: 34000, position: [  0,  60]},
									{duration: 35000, position: [  0,  50]},
									{duration: 36000, position: [  0,  40]},
									{duration: 37000, position: [  0,  30]},
									{duration: 38000, position: [  0,  20]},
									{duration: 39000, position: [  0,  10]},
									{duration: 40000, position: [  0,   0]},
									
									// Second loop
									{duration: 41000, position: [ 10,   0]},
									{duration: 42000, position: [ 20,   0]},
									{duration: 43000, position: [ 30,   0]},
									{duration: 44000, position: [ 40,   0]},
									{duration: 45000, position: [ 50,   0]},
									{duration: 46000, position: [ 60,   0]},
									{duration: 47000, position: [ 70,   0]},
									{duration: 48000, position: [ 80,   0]},
									{duration: 49000, position: [ 90,   0]},
									{duration: 50000, position: [100,   0]},
									{duration: 51000, position: [100,  10]},
									{duration: 52000, position: [100,  20]},
									{duration: 53000, position: [100,  30]},
									{duration: 54000, position: [100,  40]},
									{duration: 55000, position: [100,  50]},
									{duration: 56000, position: [100,  60]},
									{duration: 57000, position: [100,  70]},
									{duration: 58000, position: [100,  80]},
									{duration: 59000, position: [100,  90]},
									{duration: 60000, position: [100, 100]},
									{duration: 61000, position: [ 90, 100]},
									{duration: 62000, position: [ 80, 100]},
									{duration: 63000, position: [ 70, 100]},
									{duration: 64000, position: [ 60, 100]},
									{duration: 65000, position: [ 50, 100]},
									{duration: 66000, position: [ 40, 100]},
									{duration: 67000, position: [ 30, 100]},
									{duration: 68000, position: [ 20, 100]},
									{duration: 69000, position: [ 10, 100]},
									{duration: 70000, position: [  0, 100]},
									{duration: 71000, position: [  0,  90]},
									{duration: 72000, position: [  0,  80]},
									{duration: 73000, position: [  0,  70]},
									{duration: 74000, position: [  0,  60]},
									{duration: 75000, position: [  0,  50]},
									{duration: 76000, position: [  0,  40]},
									{duration: 77000, position: [  0,  30]},
									{duration: 78000, position: [  0,  20]},
									{duration: 79000, position: [  0,  10]},
									{duration: 80000, position: [  0,   0]},
								];
								
								
								// Execute all of the fixture data
								for (i = 0, ii = fixtures.length; i < ii; i += 1) {
									f = fixtures[i];
									
									$.es().makeEntity()
										.addTag('actor-' + i)
										.addComponent('position', 0, 0)
										.addComponent('moveable', {
											speed: 10
										})
										.addComponent('follow-path', {
											type: 'cycle',
											route: [
												{x: 100, y: 0},
												{x: 100, y: 100},
												{x: 0, y: 100},
												{x: 0, y: 0}
											]
										});
									
									$.getTag('actor-' + i).executeComponent('moveable', {
										time: $.time().now() + f.duration
									});
									expect(
										$.getTag('actor-' + i)
											.getComponent('position')
											.data
											.expose()
											.position
											.getSimpleCoords()
										).toEqual(f.position);
									
									rans += 1;
								}
							});//instanceof thorny
						});
						waits(200);
						runs(function () {
							expect(rans).toMatch(fixtures.length);
						});
					});// it should move the entity along the path
				});// desc with cycling paths
			});// desc that works differently depending on the loop type
			
			describe('that will call a complete callback when a loop has been finished', function () {
				describe('the process with a once loop', function () {
					it('should be called when a once loop completes', function () {
						var rans = 0;
						runs(function () {
							require('thorny/base')('./config/default.json')(function ($) {
								$.time().tick();
								$.es().makeEntity()
									.addTag('actor')
									.addComponent('position', 0, 0)
									.addComponent('moveable', {
										speed: 10
									})
									.addComponent('follow-path', {
										type: 'once',
										route: [
											{x: 100, y: 0},
											{x: 100, y: 100},
											{x: 0, y: 100},
											{x: 0, y: 0}
										],
										complete: function () {
											rans += 1;
										}
									});

								$.getTag('actor').executeComponent('moveable', {
									time: $.time().now() + 40000
								});
							});//instanceof thorny
						});
						waits(200);
						runs(function () {
							expect(rans).toEqual(1);
						});
					});// it should be called when a once loop completes
					
					it("should't be called when a once loop completes", function () {
						var rans = 0;
						runs(function () {
							require('thorny/base')('./config/default.json')(function ($) {
								$.time().tick();
								$.es().makeEntity()
									.addTag('actor')
									.addComponent('position', 0, 0)
									.addComponent('moveable', {
										speed: 10
									})
									.addComponent('follow-path', {
										type: 'once',
										route: [
											{x: 100, y: 0},
											{x: 100, y: 100},
											{x: 0, y: 100},
											{x: 0, y: 0}
										],
										complete: function () {
											rans += 1;
										}
									});
									
								$.getTag('actor').executeComponent('moveable', {
									time: $.time().now() + 39999
								});
							});//instanceof thorny
						});
						waits(200);
						runs(function () {
							expect(rans).toEqual(0);
						});
					});// it should be called when a once loop completes
				});// desc the process with a once loop
				
				describe('the process with a cycle loop', function () {
					it('should be called when a cycle loop completes', function () {
						var rans = 0;
						runs(function () {
							require('thorny/base')('./config/default.json')(function ($) {
								$.time().tick();
								$.es().makeEntity()
									.addTag('actor')
									.addComponent('position', 0, 0)
									.addComponent('moveable', {
										speed: 10
									})
									.addComponent('follow-path', {
										type: 'cycle',
										route: [
											{x: 100, y: 0},
											{x: 100, y: 100},
											{x: 0, y: 100},
											{x: 0, y: 0}
										],
										complete: function () {
											rans += 1;
										}
									});

								$.getTag('actor').executeComponent('moveable', {
									time: $.time().now() + 40000
								});
								$.getTag('actor').executeComponent('moveable', {
									time: $.time().now() + 80000
								});
							});//instanceof thorny
						});
						waits(200);
						runs(function () {
							expect(rans).toEqual(2);
						});
					});// it should be called when a cycle loop completes
					
					it("should't be called when a cycle loop completes", function () {
						var rans = 0;
						runs(function () {
							require('thorny/base')('./config/default.json')(function ($) {
								$.time().tick();
								$.es().makeEntity()
									.addTag('actor')
									.addComponent('position', 0, 0)
									.addComponent('moveable', {
										speed: 10
									})
									.addComponent('follow-path', {
										type: 'cycle',
										route: [
											{x: 100, y: 0},
											{x: 100, y: 100},
											{x: 0, y: 100},
											{x: 0, y: 0}
										],
										complete: function () {
											rans += 1;
										}
									});
									
								$.getTag('actor').executeComponent('moveable', {
									time: $.time().now() + 39999
								});
								$.getTag('actor').executeComponent('moveable', {
									time: $.time().now() + 79999
								});
							});//instanceof thorny
						});
						waits(200);
						runs(function () {
							expect(rans).toEqual(1);
						});
					});// it shouldn't be called when a cycle loop completes
				});// desc the process with a cycle loop
			}); // desc that will call a complete callback when a loop has been finished
		});// desc has an execute function
		
		describe('has an update function', function () {
			// TODO
		});// desc has an update function
		
		describe('has an expose function', function () {
			// TODO
		});// desc has an expose function
		
		describe('has an inject function', function () {
			// TODO
		});// desc has an inject function
		
		describe('has an vectorifyRoute function', function () {
			// TODO
		});// desc has an vectorifyRoute function
	});// desc the follow-path component
}());