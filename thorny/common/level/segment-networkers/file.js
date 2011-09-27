/*global window $ console*/
(function (module, undefined) {
	module.exports = function ($, module) {
		return function (level, components, file_network) {
			// Network seperate levels together.
			components.each(function (existingLevel) {
				// We don't want to network a level to its self.
				if (level === existingLevel || 
					existingLevel.data === false
				) {
					return;
				}
				
				var i, ii, distance, from, to;
				for (i = 0, ii = file_network.length; i < ii; i += 1) {
					if (file_network[i].name === existingLevel.data.name) {
						from = level.data.iterator().stepTo(file_network[i].from).node;
						to = existingLevel.data.iterator().stepTo(file_network[i].to).node;

						distance = from.distance(to);

						from.addNeighbour(to, {distanceTo: distance});
						to.addNeighbour(from, {distanceTo: distance});
					}
				}
			});
		};
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/common/level/segment-networkers/file')));