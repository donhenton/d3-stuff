function createGraph()
{
    var svg = d3.select("body").append("svg:svg")
            .attr("width", window.width)
            .attr("height", window.height)
            .style("border-style", "solid")
            .style("border-width", "1px")
            .on("mousedown", function() {
                //console.log(svg.selectAll("g.transgroup"));
                svg.selectAll("g.transgroup").remove();
            });
    var g = svg.append("g");

    var rect = g.append("rect")
            .attr("x", 100)
            .attr("y", 100)
            .attr("width", "100")
            .attr("height", "100")
            .style("stroke-width", "1")
            .style("stroke", "blue")
            .style("fill", "white");

    rect.on("mousedown.drag", function()
    {
        var shape = d3.select(this);
        var group = g;
        //var offset = mouseRelativePoint(shape);
        var container = svg;//d3.select("body");
        var relative = d3.mouse(shape.node());
        var base = [shape.attr("x"), shape.attr("y")];
        var offset = offsetPoint(base, relative);

        container.on("mousemove.drag", function()
        {
            d3.select(this).call(moveShape2, group, shape, offset);
        })
                .on("mouseup.drag", function() {
                    container.on(".drag", null);
                })
                .on("mouseleave.drag", function() {
                    container.on(".drag", null);
                })

        var mydata = getEdgeData(shape);

        var transGroup = group.selectAll(".transgroup");
        transGroup = !transGroup.empty() ? transGroup
                : group.append("svg:g")
                .classed("transgroup", true)
                .style("fill", "lightgreen")
                .style("stroke-width", "1")
                .style("stroke", "red");

        transGroup.selectAll("circle")
                .data(mydata)
                .enter()
                .append("circle")
                .attr("cx", function(d) {
                    return d.x();
                })
                .attr("cy", function(d) {
                    return d.y();
                })
                .attr("r", 5)
                .on("mousedown.drag", function(d) {
                    var anchor = d3.select(this);
                    container.on("mousemove.drag", function()
                    {
                        var relative = d3.mouse(shape.node());
                        var base = [shape.attr("x"), shape.attr("y")];
                        var offset = offsetPoint(base, relative);
                        d.func(relative, offset, container, group);
                        transGroup.selectAll("circle")
                                .attr("cx", function(d) {
                                    return d.x();
                                })
                                .attr("cy", function(d) {
                                    return d.y();
                                });

                    })
                            .on("mouseup.drag", function() {
                                container.on(".drag", null);
                            })
                            .on("mouseleave.drag", function() {
                                container.on(".drag", null);
                            });
                    d3.event.stopPropagation();
                });
        d3.event.stopPropagation();
    });
}
function moveShape2(canvas, group, shape, offset) {
    //console.log(group.attr("transform"));
    var m = d3.mouse(shape.node());
    var to = d3.mouse(canvas.node());
    //console.log(m, to); 
    var transform = d3.transform(group.attr("transform"));
    offset = [-offset[0] - shape.attr("x"), -offset[1] - shape.attr("y")];
    var nt = d3.transform();
    nt.translate = offset;
    var nt2 = d3.transform();
    nt2.translate = m;
    var nt3 = transform.toString() + nt2.toString() + nt.toString();
    //console.log(nt3);
    group.attr("transform", d3.transform(nt3));
}

function mouseRelativePoint(shape)
{
    var offset = d3.mouse(shape.node());
    //console.log(offset[0],shape.attr("x"),offset[1], shape.attr("y"));
    return [offset[0] - shape.attr("x"), offset[1] - shape.attr("y")];
}

function offsetPoint(base, relative)
{
    //console.log(relative[0],base[0], relative[0] - base[0]); 
    return [relative[0] - base[0], relative[1] - base[1]];
}

function getEdgeData(shape)
{

    return [
        {//left top
            x: function() {
                return shape.attr("x");
            },
            y: function() {
                return shape.attr("y");
            },
            func: function(relative, offset)
            {
                shape.attr("width", +shape.attr("width") - offset[0])
                        .attr("x", relative[0])
                        .attr("height", +shape.attr("height") - offset[1])
                        .attr("y", relative[1]);
            }
        },
        {//right top
            x: function() {
                return (+shape.attr("x")) + (+shape.attr("width"));
            },
            y: function() {
                return +shape.attr("y");
            },
            func: function(relative, offset)
            {
                shape.attr("width", offset[0])
                        .attr("height", +shape.attr("height") - offset[1])
                        .attr("y", relative[1]);
            }
        },
        {//left bottom
            x: function() {
                return +shape.attr("x");
            },
            y: function() {
                return (+shape.attr("y")) + (+shape.attr("height"));
            },
            func: function(relative, offset)
            {
                shape.attr("width", +shape.attr("width") - offset[0])
                        .attr("x", relative[0])
                        .attr("height", offset[1]);
            }
        },
        {//right bottom
            x: function() {
                return (+shape.attr("x")) + (+shape.attr("width"));
            },
            y: function() {
                return (+shape.attr("y")) + (+shape.attr("height"));
            },
            func: function(relative, offset)
            {
                shape.attr("width", offset[0])
                        .attr("height", offset[1]);
            }
        },
        {//middle top
            x: function() {
                return (+shape.attr("x")) + (shape.attr("width") / 2);
            },
            y: function() {
                return shape.attr("y");
            },
            func: function(relative, offset)
            {
                shape.attr("height", +shape.attr("height") - offset[1])
                        .attr("y", relative[1]);
            }
        },
        {//middle bottom
            x: function() {
                return (+shape.attr("x")) + (shape.attr("width") / 2);
            },
            y: function() {
                return (+shape.attr("y")) + (+shape.attr("height"));
            },
            func: function(relative, offset)
            {
                shape.attr("height", offset[1]);
            }
        },
        {//middle left
            x: function() {
                return (+shape.attr("x"));
            },
            y: function() {
                return (+shape.attr("y")) + (+shape.attr("height") / 2);
            },
            func: function(relative, offset)
            {
                shape.attr("width", +shape.attr("width") - offset[0])
                        .attr("x", relative[0]);
            }
        },
        {//middle right
            x: function() {
                return (+shape.attr("x")) + (+shape.attr("width"));
            },
            y: function() {
                return (+shape.attr("y")) + (+shape.attr("height") / 2);
            },
            func: function(relative, offset)
            {
                shape.attr("width", offset[0]);
            }
        },
        {//rotate
            x: function() {
                return (+shape.attr("x")) + (shape.attr("width") / 2);
            },
            y: function() {
                return shape.attr("y") - 20;
            },
            func: function(relative, offset, anchor, group)
            {
                var halfWidth = shape.attr("width") / 2;
                var halfHeight = shape.attr("height") / 2;

                var x1 = +shape.attr("x") + halfWidth;
                var y1 = +shape.attr("y") - 20;
                var x2 = +shape.attr("x") + halfWidth;
                var y2 = +shape.attr("y") + halfHeight;
                var x3 = relative[0];
                var y3 = relative[1];

                var dx1 = x1 - x2;
                var dy1 = y1 - y2;
                var dx2 = x3 - x2;
                var dy2 = y3 - y2;

                var a = dx1 * dy2 - dy1 * dx2;
                var b = dx1 * dx2 + dy1 * dy2;
                var angle = Math.atan(a / b) * (180 / Math.PI);
                if (b < 0)
                    angle = 90 + (90 + angle);
                else if (a < 0)
                    angle += 360;

                var transform = d3.transform(group.attr("transform"));
                var nt = d3.transform();
                var nt2 = d3.transform();
                nt.translate = [x2, y2];
                nt.rotate = angle;
                nt2.translate = [-x2, -y2];
                var nt3 = transform.toString() + nt.toString() + nt2.toString();
                //console.log(angle,nt3);    
                group.attr("transform", nt3);
            }
        },
    ];
}
