
$(document).ready(function() {

    svg = d3.select("#graph")
            .append("svg")
            .attr("width", 600)
            .attr("height", 250);
    createGraph(svg);


});


function generateData()
{

    var numValues = Math.floor(Math.random() * 10) +7;
    var dataset = [];
    for (var i = 0; i < numValues; i++) {
        var newNumber = Math.floor(Math.random() * 100); //New random integer (0-24)
        dataset.push(newNumber); //Add new number to array }
    }
    return dataset;
}


function processGraph(svg, data)
{
    var w = parseInt($(svg[0][0]).attr("width"));
    var h = parseInt($(svg[0][0]).attr("height"));
    var xScale = d3.scale.ordinal()
            .domain(d3.range(data.length))
            .rangeRoundBands([0, w], 0.1);

    var yScale = d3.scale.linear()
            .domain([0, d3.max(data)])
            .range([0, h]);

    //Create bars
    svg.selectAll("rect").data([]).exit().remove();
    svg.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .transition()
            .duration(3000)
            .attr("x", function(d, i) {
                return xScale(i);
            })
            .attr("y", function(d) {
                return h - yScale(d);
            })
            .attr("width", xScale.rangeBand())
            .attr("height", function(d) {
                return yScale(d);
            })
            .attr("fill", function(d,i) {
                return "rgb(0, 0, " + (yScale(d)) + ")";
            });

    //Create labels
    svg.selectAll("text").data([]).exit().remove();
    svg.selectAll("text")
            .data(data)
            .enter()
            .append("text")
            .text(function(d) {
                return d;
            })
            .transition()
            .duration(1500)
            .attr("text-anchor", "middle")
            .attr("x", function(d, i) {
                return xScale(i) + xScale.rangeBand() / 2;
            })
            .attr("y", function(d) {
                return h - yScale(d) + 14;
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("fill", "white");


}

function createGraph(svg)
{

    processGraph(svg, generateData());

    d3.select("p")
            .on("click", function() {

                //New values for dataset
                dd = generateData();
                processGraph(svg, dd);


            });


}

