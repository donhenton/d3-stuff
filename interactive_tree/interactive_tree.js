
//http://bl.ocks.org/mbostock/4339083
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
    root: {},
    duration: 250,
    //i: 0,
    svgGroup: null,
    margin: {"top": 10, "right": 50, "bottom": 20, "left": 100},
    /**
     * function to perform zoom
     * @returns {undefined}
     */
    zoom: function()
    {

        //console.log(d3.event.translate + " " + d3.event.scale);
        TreeCode.svgGroup.attr("transform", "translate(" + (d3.event.translate[0] + TreeCode.margin.left) + "," + (d3.event.translate[1] + TreeCode.margin.top) + ") scale(" + d3.event.scale + ")");

    },
    /**
     * Initially create the graph
     * 
     * @returns {undefined}
     */
    createGraph: function()
    {
        var docWidth = $(document).width();
        var width = docWidth / (1.361);
        var docHeight = $(document).height();
        var halfHeight = docHeight / 2;
        var quarterHeight = docHeight / 4;
        var height = halfHeight + quarterHeight;


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

//////////////////////////// zoom and pan //////////////////////////
        var zoomListener = d3.behavior.zoom().scaleExtent([0, 10]).on("zoom", this.zoom);
        this.svg.call(zoomListener);

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
        var node = this.svgGroup.selectAll("g.node")
                .data(nodes, function(d) {
                    return d.id || (d.id = ++i);
                });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g")
                .attr("class", function(d)
                {
                    TreeCode.createProviderImage(d, this);
                    return "node type_" + d.type;
                })
                .attr("transform", function(d) {
                    return "translate(" + source.y0 + "," + source.x0 + ")";
                })
                .on("click", this.click);

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
        var nodeUpdate = node.transition()
                .duration(this.duration)
                .attr("transform", function(d) {
                    return "translate(" + d.y + "," + d.x + ")";
                });

        nodeUpdate.select("circle")
                .attr("r", 4.5)
                .style("fill", function(d) {
                    return d._children ? "lightsteelblue" : "#fff";
                });

        nodeUpdate.select("text")
                .style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
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
                .attr("class", "link")
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
    },
    /**
     * 
     * Toggle children on click.
     * 
     * @param {graphNode} d
     * @returns {undefined}
     */
    click: function(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        TreeCode.update(d);
    }

}; // end TreeCode
/////

