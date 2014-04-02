/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var lineGraph = d3.select("#D3line")
    .append("svg:svg")
    .attr("width", 500)   
    .attr("height", 200); 
 
var myLine = lineGraph.append("svg:line")
    .attr("x1", 40)
    .attr("y1", 50)
    .attr("x2", 450)
    .attr("y2", 150)
    .style("stroke-width", 24) 
    .style("stroke", "rgb(6,120,155)");
