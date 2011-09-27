/*global window $ console*/
(function (module, undefined) {
	module.exports = function ($, module) {
		return function (level, components) {
			// Network seperate levels together.
			components.each(function (existingLevel) {
				// We don't want to network a level to its self.
				if (level === existingLevel || 
					existingLevel.data === false
				) {
					return;
				}
				
				var i, 
					ii, 
					distance, 
					from, 
					to,
					current_iterator = level.data.iterator(),
					current_poly,
					existing_iterator = existingLevel.data.iterator(),
					existing_poly;
				
				while ((from = existing_iterator.step().node)) {
					while ((to = current_iterator.step().node)) {
						if (from.sharesEdge(to)) {
							distance = from.distance(to);
							
							from.addNeighbour(to, {distanceTo: distance});
							to.addNeighbour(from, {distanceTo: distance});
						}
					}
					current_iterator.rewind();
				}
			});
		};
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/common/level/segment-networkers/adjacent')));