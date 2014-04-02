//start timer
start = new Date().getTime();

var uniqueArray = [],
newPoints = [],
newPins = [],
hiddenPoints = [],
displayedPoints = [],
colors = ['#61c6d9', '#61d99c', '#a8d54c', '#adaf30', '#c49846', '#c46e46', '#c4464c', '#bf4280', '#bb46c4', '#976dff', '#6d85ff', '#81c2ff', '#83ba99', '#a0ad90', '#ad9090', '#9b90ad', '#88a4b5', '#0ca48a', '#bdbdbd', '#545454'],
colorAssigned = [],
colorObj = {};

//get data
d3.json('js/points_min.json', function(dataSet){
	formatPoints(dataSet);
});

function formatPoints(dataSet) {
// find all the unique clusterIds
	var u = dataSet.points.clusterId;
	var unique=u.filter(function(itm,nUnique,u){
		return nUnique==u.indexOf(itm);
	});
// object that stores clusterId : random hex 
	for(var i = 0; i < unique.length; i++){
		colorObj[unique[i]] = colors[Math.floor(Math.random()*colors.length)];
	}
//function to assign hex value to newPoints Object
	function colorIt(i){
		filler = colorObj[dataSet.points.clusterId[i]];
		return filler;
	}
// points object, hopefully we could design the json feed to omit this step and those similar to it.
	for (var r = 0; r < dataSet.points.x.length; r++) {
		var pointsObj = {
			x : dataSet.points.x[r] + 12,
			y : dataSet.points.y[r],
			label : dataSet.points.label[r],
			clusterId : dataSet.points.clusterId[r],
			fillColor : colorIt(r)
		};
		newPoints.push(pointsObj);
	}
// visible vs non-visible
	for (var p = 0; p < newPoints.length; p++){
		if(newPoints[p].clusterId < 0 ) {
			hiddenPoints.push(newPoints[p]);
		} else {
			displayedPoints.push(newPoints[p]);
		}
	}
// pin/label object that is more friendly
	for (var l = 0; l < dataSet.pins.id.length; l++) {
		var pinObj = {
			x : dataSet.pins.x[l],
			y : dataSet.pins.y[l],
			name : dataSet.pins.name[l],
			id : dataSet.pins.id[l]
		};
		newPins.push(pinObj);
	}
	$('#screen').fadeOut(200);
	drawBoard(displayedPoints, newPins, hiddenPoints);
}

function drawBoard(displayedPoints, newPins, hiddenPoints){
//Dimensions, can change to show number scale
	var margin = {top: 0, right: 0, bottom: 0, left: 0},
		width = 1048 - margin.left - margin.right,
		height = 650 - margin.top - margin.bottom;
//Define scales
	var x = d3.scale.linear()
		.domain([-width / 5, width / 5])
		.range([0, width]);

	var y = d3.scale.linear()
		.domain([-height / 5, height / 5])
		.range([height, 0]);
//X axis
	var xAxis = d3.svg.axis()
		.scale(x)
		.orient('bottom')
		.ticks(5)
		.tickSize(-height)
		.tickFormat(d3.format('s'));
//Y axis
	var yAxis = d3.svg.axis()
		.scale(y)
		.orient('left')
		.ticks(5)
		.tickSize(-width)
		.tickFormat(d3.format('s'));
//Create svg element
	var svg = d3.select('svg')
		.attr({
			'width' : width + margin.left + margin.right,
			'height': height + margin.top + margin.bottom
		})
		.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
		.call(d3.behavior.zoom().x(x).y(y).scaleExtent([1, 50]).on('zoom', zoom));
//draw main board
	svg.append('rect')
		.attr({
			'width': width,
		   'height': height
		});

	svg.append('g')
		.attr({
			'class' : 'x axis',
		 'transform': 'translate(0,' + height + ')'
		})
		.call(xAxis);

	svg.append('g')
		.attr('class', 'y axis')
		.call(yAxis);
// map and draw points
	var circler = svg.selectAll('.circPoint')
		.data(displayedPoints)
		.enter()
		.append('circle')
		 .style('fill', function(d,i){
        	return d.fillColor;
        })
        .attr({
        	   'class':'circPoint',
        	      'r' : '3',
          'transform' : function(d, i) {return 'translate('+x(0)+','+y(0)+')';},
        })
        .on('click', function(d,i){
			displayInfo(d,i)
		})
		.transition()
		.attr('transform', function(d, i) {
			return 'translate('+x(d.x)+','+y(d.y)+')';
		})
		.duration(1500)
  		.delay(200);
		
		function displayInfo(d,i){
			$('.infoShow p').html('<p><b>Label:</b> ' + d.label + ' &nbsp;&nbsp;<b>ID:</b> ' + d.clusterId + ' <b> &nbsp;&nbsp;Color:</b> ' + d.fillColor+ '</p>');
		}
/*
	var autoLabel = svg.selectAll('.labeler')
		.data(newPins)
		.enter()
		.append('rect')
		.attr('class', 'labeler')
        .style('fill', '#ccc')
        .style('stroke', '#666')
		.attr('transform', function(d, i) {
			return 'translate('+x(d.x)+','+y(d.y)+')';
		})
		.attr('width', '100')
		.attr('height', '15')
		.text(function(d,i){return d.name;});;
*/
	var autoText = svg.selectAll('.texter')
		.data(newPins)
		.enter()
		.append('text')
		.attr('class', 'texter')
		.attr('transform', function(d, i) {
			return 'translate('+x(0)+','+y(0)+')';
		})
		.transition()
		.attr('transform', function(d, i) {
			return 'translate('+x(d.x)+','+y(d.y)+')';
		})
		.text(function(d,i){return d.name;})
		.duration(500)
		.delay(1800);
	
	function zoom() {
		svg.select('.x.axis').call(xAxis);
		svg.select('.y.axis').call(yAxis);
		svg.selectAll('.circPoint, .labeler, .texter')
		.attr('transform', function(d, i) {
			return 'translate('+x(d.x)+','+y(d.y)+')';
		});
	}

	var amount = displayedPoints.length + hiddenPoints.length,
	elapsed = new Date().getTime() - start;
	$('p.tester').text('Load time was ' + elapsed + 'ms, with ' + amount + ' data points loaded, and ' + displayedPoints.length +' points visible.');

}

	