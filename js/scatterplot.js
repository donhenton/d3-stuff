/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var w = 500;
var h = 300;
var padding = 30;

var dataset = [
    [5, 20, .095], [480, 90, 1.35], [250, 50, 1], [100, 33, 1], [330, 95, 1],
    [410, 12, 1], [475, 44, 6.34], [25, 67, 1], [85, 2, 1], [220, 88, 1],
    [600, 150, 1]
];

$(document).ready(function() {
 createGraph();
});

function createGraph()
{
//Create scale functions
    var xScale = d3.scale.linear()
            .domain([0, d3.max(dataset, function(d) {
                    return d[0]; //find the max for x, which is d[0], d[1] is the y
                })])
            .range([padding, w - padding * 2]);

    var yScale = d3.scale.linear()
            .domain([0, d3.max(dataset, function(d) {
                    return d[1];
                })])
            .range([h - padding, padding]);

    var rScale = d3.scale.linear()
            .domain([0, d3.max(dataset, function(d) {
                    return d[2];
                })])
            .range([4, 16.33]);

    //var formatAsPercentage = d3.format("1%");

    //Define X axis
    var xAxis = d3.svg.axis()
            .scale(xScale)
            .orient("bottom")
            .ticks(5)
        // .tickFormat(formatAsPercentage);

    //Define Y axis
    var yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left")
            .ticks(5)
     // .tickFormat(formatAsPercentage);

//Create SVG element
    var svg = d3.select("#scatterplot")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

//Create circles
    svg.selectAll("circle")
            .data(dataset)
            .enter()
            .append("circle")
            .attr("cx", function(d) {
                return xScale(d[0]);
            })
            .attr("cy", function(d) {
                return yScale(d[1]);
            })
            .attr("r", function(d) {
                return rScale(d[2]);
            });

//Create labels
    svg.selectAll("text")
            .data(dataset)
            .enter()
            .append("text")
            .text(function(d) {
                return d[0] + "," + d[1];
            })
            .attr("x", function(d) {
                return xScale(d[0]);
            })
            .attr("y", function(d) {
                return yScale(d[1]);
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("fill", "red");


//Create X axis
    svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + (h - padding) + ")")
            .call(xAxis)
     

    //Create Y axis
    svg.append("g")
            .style("font-size", '15px')
            .attr("class", "axis")
            .attr("transform", "translate(" + padding + ",0)")
            .call(yAxis);
}