/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var dataset = [ 5, 10, 15, 20, 25 ];
    d3.select("body").selectAll("p")
        .data(dataset)
        .enter()
        .append("p")
        .classed("frump",true)
        .text(display);


function display(d) 
{ 
    return "You are bozo "+d; 
}