svg = null;

dataset = [
    [5, 20, .095], [480, 90, 1.35], [250, 50, 1], [100, 33, 1], [330, 95, 1],
    [410, 12, 1], [375, 44, 6.34], [25, 67, 1], [85, 2, 1], [220, 88, 1],
    [321, 160, 1]
];


function createGraph()
{

    var margin = {top: 20, right: 0, bottom: 20, left: 24},
    width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;
    /*
     var x = d3.scale.linear()
     .domain([-width / 2, width / 2])
     .range([0, width]);
     
     var y = d3.scale.linear()
     .domain([-height / 2, height / 2])
     .range([height, 0]);
     */

    var x = d3.scale.linear()
            .domain([0, 1.2 * d3.max(dataset, function(d) {
                    return d[0]; //find the max for x, which is d[0], d[1] is the y
                })])
            .range([0, width]);

    var y = d3.scale.linear()
            .domain([0, 1.2 * d3.max(dataset, function(d) {
                    return d[1];
                })])
            .range([height, 0]);



    var rScale = d3.scale.linear()
            .domain([0, d3.max(dataset, function(d) {
                    return d[2];
                })])
            .range([2, 26.33]);


    svg = d3.select("body").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
             .call(d3.behavior.zoom().scaleExtent([1, 8]).on("zoom", zoom))
            .append("g");

    svg.append("rect")
            .attr("width", width)
            .attr("height", height);

    //svg.append("rect")

    svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.svg.axis().scale(x).tickSize(-height).orient("bottom"));

    svg.append("g")
            .attr("class", "y axis")
            .call(d3.svg.axis().scale(y).ticks(5).tickSize(-width).orient("left"));

    /* ---------- */

    svg.selectAll("circle")
            .data(dataset)
            .enter()
            .append("circle")
            .attr("cx", function(d) {
                return x(d[0]);
            })
            .attr("cy", function(d) {
                return y(d[1]);
            })
            .attr("r", function(d) {
                return rScale(d[2]);
            })



}
function zoom() {
    svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}
