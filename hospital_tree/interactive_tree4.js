
// http://bl.ocks.org/mbostock/4339083
// http://bl.ocks.org/stepheneb/1182434
/**
 *  
 *  Notes:
 *  The height of the node is spread across the container an
 *  is determined by the tree layout
 *  
 */



TreeCode = {
    tree: null,
    diagonal: null,
    svg: null,
    currentNode: null,
    root: {},
    duration: 250,
    //i: 0,
    svgGroup: null,
    margin: {"top": 10, "right": 50, "bottom": 20, "left": 100},
    yDisp: 0,
    xDisp: 0,
    zoomFactor: 1.0,
    /**
     * 
     * @param {zoomData} incrementData from action code
     * zoomData: {"zoomFactor": 1.0, "increment": 0.1},
     * @returns {undefined}
     */
    zoom: function(incrementData)
    {
        //console.log(d3.event.translate + " " + d3.event.scale);
        TreeCode.svgGroup.attr("transform", "translate(" + (TreeCode.xDisp) + "," + (TreeCode.yDisp) + ") scale(" + incrementData.zoomFactor + ")");
        TreeCode.zoomFactor = incrementData.zoomFactor;
    },
    /**
     * Initially create the graph
     * 
     * @returns {undefined}
     */
    createGraph: function()
    {
        var docWidth = $(document).width();
        var width = docWidth / (1.45);
        var docHeight = $(document).height();
        var halfHeight = docHeight / 2;
        var quarterHeight = docHeight / 4;
        var height = halfHeight + quarterHeight;
        this.xDisp = this.margin.left;
        this.yDisp = this.margin.top;

        this.tree = d3.layout.tree()
                .separation(function(a, b) {
                    return (a.type == 'Provider') ? 2 : 1;
                })
                .size([height, width]);

        this.diagonal = d3.svg.diagonal()
                .projection(function(d) {
                    return [d.y, d.x];
                });
        $("#tree-container").width(width + this.margin.right + this.margin.left + 10);

        d3.select("#tree-container").append("svg")
                .attr("width", width + this.margin.right + this.margin.left)
                .attr("height", height + this.margin.top + this.margin.bottom)
                .append("g")
                .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        this.svgGroup = d3.select("svg g");
        this.svg = d3.select("svg");

        this.svg.on("mouseup", this.mouseUpForSVG)
                .on("contextmenu", this.contextMenuForSVG)
                .on("mousedown", this.mouseDownForSVG);
//////////////////////////// zoom and pan //////////////////////////
        // var zoomListener = d3.behavior.zoom().scaleExtent([0, 10]).on("zoom", this.zoom);
        // this.svg.call(zoomListener);


        var drag =
                d3.behavior.drag()
                .on("drag", function(d, i) {
                    if (TreeCode.currentNode == null)
                    {
                        TreeCode.xDisp += d3.event.dx;
                        TreeCode.yDisp += d3.event.dy;
                        TreeCode.svgGroup.attr("transform", "translate(" + TreeCode.xDisp + "," + TreeCode.yDisp + ") scale(" + TreeCode.zoomFactor + ")");
                        // console.log("drag hit " + TreeCode.xDisp + " " + TreeCode.yDisp);
                    }
                });

        this.svg.call(drag);
//////////////////////////// zoom and pan //////////////////////////
        d3.json("/d3_sandbox/interactive_tree/hospital_orig.json", function(error, hospital_data) {
            TreeCode.root = hospital_data;
            TreeCode.root.x0 = height / 2;
            TreeCode.root.y0 = 0;

            function collapse(d) {
                if (d.children) {
                    d._children = d.children;
                    d._children.forEach(collapse);
                    d.children = null;
                }
            }

            TreeCode.root.children.forEach(collapse);
            TreeCode.update(TreeCode.root);
        });
    },
    /**
     * create the image element on the terminal providers
     * 
     * @param {data} d
     * @param {graphNode} t
     * @returns {undefined}
     */
    createProviderImage: function(d, t) {
        if (d.type == 'Provider')
        {
            var elem = d3.select(t);
            var image = "/d3_sandbox/images/User.png";
            var title = "Provider";

            elem.append("svg:image")
                    .attr("xlink:href", image)
                    .attr("width", 24)
                    .attr("height", 24)
                    .attr("x", "5")
                    .attr("y", "-15")
                    .attr("title", title)
                    .attr("class", 'providerImage')
                    .attr("opacity", 1);
        }

    },
    /**
     * update the graph nodes eg, when clicking on a node 
     * expands the graph
     * @param {graphNode} source
     * @returns void
     */
    update: function(source) {

        // Compute the new tree layout.
        var nodes = this.tree.nodes(this.root).reverse(),
                links = this.tree.links(nodes);

        // Normalize for fixed-depth.
        nodes.forEach(function(d) {
            d.y = d.depth * 150;
             
        });

        // Update the nodes…
        var nodeCollection = this.svgGroup.selectAll("g.node")
                .data(nodes, function(d) {
                    return d.id || (d.id = ++i);
                });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = nodeCollection.enter().append("g")
                .attr("class", function(d)
                {
                    TreeCode.createProviderImage(d, this);
                    return "node type_" + d.type;
                })
                .attr("data-id",function(d){return d.id})
                .attr("transform", function(d) {
                    return "translate(" + source.y0 + "," + source.x0 + ")";
                })
                .on("click", this.click)
                .on("contextmenu", function(d, i) {
                    TreeCode.contextMenuForNodes(d, i, this)
                })
                .on("mousedown", this.mouseDownForNodes);


        nodeEnter.append("circle")
                .attr("r", 1e-6)
                .style("fill", function(d) {
                    return d._children ? "lightsteelblue" : "#fff";
                });

        nodeEnter.append("text")
                .attr("x", function(d) {
                    return d.children || d._children ? -10 : 10;
                })
                .attr("dy", ".35em")
                .attr("text-anchor", function(d) {
                    return d.children || d._children ? "end" : "start";
                })
                .text(function(d) {
                    return d.name;
                })
                .style("fill-opacity", 1e-6);

        // Transition nodes to their new position.
        var nodeUpdate = nodeCollection.transition()
                .duration(this.duration)
                .attr("transform", function(d) {
                    return "translate(" + d.y + "," + d.x + ")";
                });

        nodeUpdate.select("circle")
                .attr("r", 6.5)
                .style("fill", function(d) {
                    return d._children ? "lightsteelblue" : "#fff";
                });

        nodeUpdate.select("text")
                .style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        var nodeExit = nodeCollection.exit().transition()
                .duration(this.duration)
                .attr("transform", function(d) {
                    return "translate(" + source.y + "," + source.x + ")";
                })
                .remove();

        nodeExit.select("circle")
                .attr("r", 1e-6);

        nodeExit.select("text")
                .style("fill-opacity", 1e-6);

        // Update the links…
        var link = TreeCode.svgGroup.selectAll("path.link")
                .data(links, function(d) {
                    return d.target.id;
                });

        // Enter any new links at the parent's previous position.
        link.enter().insert("path", "g")
                .attr("class", "link linkNormal")
                .attr("sid",function(d){return d.source.id})
                .attr("tid",function(d){return d.target.id})
                .attr("d", function(d) {
                    var o = {x: source.x0, y: source.y0};
                    return TreeCode.diagonal({source: o, target: o});
                });

        // Transition links to their new position.
        link.transition()
                .duration(TreeCode.duration)
                .attr("d", TreeCode.diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
                .duration(TreeCode.duration)
                .attr("d", function(d) {
                    var o = {x: source.x, y: source.y};
                    return TreeCode.diagonal({source: o, target: o});
                })
                .remove();

        // Stash the old positions for transition.
        nodes.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });

    }, // end update 
    /**
     * 
     * Toggle children on click.
     * 
     * @param {graphNode} d
     * @returns {undefined}
     */
    mouseDownForNodes: function(d)
    {
        // console.log("mouseDown "+d);
        TreeCode.currentNode = d;
        MESSAGE_PUMP.raiseEvent(null, ActionCode.actions.mouseDownNode);
    },
    mouseDownForSVG: function()
    {
        //  TreeCode.currentNode = null; 
        MESSAGE_PUMP.raiseEvent(null, ActionCode.actions.mouseDownSVG);
    },
    mouseUpForSVG: function(d)
    {
        //   console.log("mouseUp "+d);
        TreeCode.currentNode = null;
    },
    click: function(d) {

        if (d.type == 'Provider')
        {
            MESSAGE_PUMP.raiseEvent(d, ActionCode.actions.providerClicked);
            return;
        }
        MESSAGE_PUMP.raiseEvent(d, ActionCode.actions.nodeClicked);
        
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        TreeCode.update(d);
    },
    contextMenuForNodes: function(d, i, t) {

        // var node = d3.select(t);
        // var position = d3.mouse(t);
        d3.select('#my_custom_menu')
                .style('position', 'absolute')
                .style('left', d3.event.pageX - 5 + "px")
                .style('top', d3.event.pageY - 5 + "px")
                .style('display', 'block')
                .on("contextmenu",this.contextMenuForSVG);

        d3.event.preventDefault();
        $("#nodeId").text(d.id);
    } ,
    
    contextMenuForSVG: function() {
        d3.event.preventDefault(); 
    }



}; // end TreeCode
/////

