/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var dataset = [];
var itemCount = 25;
$(document).ready(function() {

    for (var i = 0; i < itemCount; i++) {
        var newNumber = Math.random() * 30;
        dataset.push(newNumber);
    }

    createBars();
    createCircles();
    createSVGBars();


});



function createBars()
{
    d3.select("#bars").selectAll("div").data(dataset)
            .enter()
            .append("div")
            .attr("class", "bar")
            .style("height", function(d) {
                var barHeight = d * 10;
                return barHeight + "px";
            });

}

function createCircles()
{
    var w = 600;
    var h = 150;
    sp = w / itemCount;

    //this is the svg canvas
    var svg = d3.select("#circles")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

    var circles = svg.selectAll("circle").data(dataset)
            .enter()
            .append("circle");

    circles.attr("cx", function(d, i) {
        return 15 + (i * sp);
    })
            .attr("cy", h / 2).attr("r", function(d) {
        return d * .75;
    })
            .attr("fill", function(i, d)
            {
                if (i > itemCount * .75)
                {
                    return "red";
                }

                return "black";
            })

            ;

}// end createCircles

function createSVGBars()
{
    var w = 600;
    var h = 220;
    var barMult = 4;
    var barWidth = 20;
    var spacingBetweenBars = 2;
    var wholeLength = dataset.length * (spacingBetweenBars + barWidth);
    var yDisp = (w - wholeLength) / 2;

    //this is the svg canvas
    var svg = d3.select("#svgBars")
            .append("svg")
            .attr("width", w)
            .attr("height", h);


    svg.selectAll("rect").data(dataset)
            .enter()
            .append("rect")
            .attr("x", function(d, i) {
                return yDisp + (i * (barWidth + spacingBetweenBars));
            })
            .attr("y", function(d) {
                return h - (d * barMult) - 5;
            })
            .attr("width", barWidth)
            .attr("height", function(d) {
                return d * barMult;
            })
            .style("fill", function(d) {
                j = Math.round(d)
                return "rgb(0,0," + (j * 6) + ")";
            });

    // labels

    svg.selectAll("text")
            .data(dataset)
            .enter()
            .append("text")
            .text(function(d) {
                return  Math.round(d);
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("fill", "white")
            .attr("text-anchor", "middle")
            .attr("x", function(d, i) {
                return (i * (barWidth + spacingBetweenBars)) + yDisp + barWidth / 2;
            })
            .attr("y", function(d) {
                return h - (d * 4) + 7; // +15
            });

    var scale = d3.scale.linear()
            .domain([100, 500])
            .range([10, 350]);

    var xAxis = d3.svg.axis();
    xAxis.scale(scale);
    xAxis.orient("top");
    svg.append("g")
            .attr("transform", "translate(0," + (30) + ")")
            .call(xAxis);

}