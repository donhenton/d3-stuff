/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



var theData = [1,2,3];

var p = d3.select("body").selectAll("p")
        .data(theData)
  .enter()
  .append("p") 
  .text("hello ");