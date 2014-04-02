
function createGraph()
{
    var width = 600;
    var height = 600;

    var tree = d3.layout.tree()
            .separation(function(a, b) {
                return ((a.parent == root) && (b.parent == root)) ? 3 : 1;
            })
            .size([height, width - 160]);

    var diagonal = d3.svg.diagonal()
            .projection(function(d) {
                return [d.y, d.x];
            });

    var svg = d3.select("#graphItem").append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(40,0)");

    var root = getData(),
            nodes = tree.nodes(root),
            links = tree.links(nodes);

    var link = svg.selectAll(".link")
            .data(links)
            .enter()
            .append("path")
            .attr("class", function(d) {
                return (d.source != root) ? "link_dashed" : "link_continuous";
            })
            .attr("d", diagonal);

    var node = svg.selectAll(".node")
            .data(nodes)
            .enter()
            .append("g")
            .attr("class", "node")
            .attr("transform", function(d) {
                return "translate(" + d.y + "," + d.x + ")";
            })

    node.append("circle")
            .attr("r", 4.5);

    node.append("text")
            .attr("dx", function(d) {
                return d.children ? -8 : 8;
            })
            .attr("dy", 3)
            .style("text-anchor", function(d) {
                return d.children ? "end" : "start";
            })
            .text(function(d) {
                return d.name;
            });

    d3.select(self.frameElement).style("height", height + "px");
}

function getData() {
    return {
        "name": "flare",
        "children": [{"name": "AA", "children": []},
            {
                "name": "analytics",
                "children": [{
                        "name": "cluster",
                        "children": [{
                                "name": "AgglomerativeCluster",
                                "size": 3938
                            }, {
                                "name": "CommunityStructure",
                                "size": 3812
                            }, {
                                "name": "HierarchicalCluster",
                                "size": 6714
                            }, {
                                "name": "MergeEdge",
                                "size": 743
                            }]
                    }, {
                        "name": "graph",
                        "children": [{
                                "name": "BetweennessCentrality",
                                "size": 3534
                            }, {
                                "name": "LinkDistance",
                                "size": 5731
                            }, {
                                "name": "MaxFlowMinCut",
                                "size": 7840
                            }, {
                                "name": "ShortestPaths",
                                "size": 5914
                            }, {
                                "name": "SpanningTree",
                                "size": 3416
                            }]
                    }, {
                        "name": "optimization",
                        "children": [{
                                "name": "AspectRatioBanker",
                                "size": 7074
                            }]
                    }]
            }, {
                "name": "animate",
                "children": [{
                        "name": "interpolate",
                        "children": [{
                                "name": "ArrayInterpolator",
                                "size": 1983
                            }, {
                                "name": "ColorInterpolator",
                                "size": 2047
                            }, {
                                "name": "DateInterpolator",
                                "size": 1375
                            }, {
                                "name": "Interpolator",
                                "size": 8746
                            }, {
                                "name": "MatrixInterpolator",
                                "size": 2202
                            }, {
                                "name": "NumberInterpolator",
                                "size": 1382
                            }, {
                                "name": "ObjectInterpolator",
                                "size": 1629
                            }, {
                                "name": "PointInterpolator",
                                "size": 1675
                            }, {
                                "name": "RectangleInterpolator",
                                "size": 2042
                            }]
                    }, {
                        "name": "ISchedulable",
                        "size": 1041
                    }, {
                        "name": "Parallel",
                        "size": 5176
                    }, {
                        "name": "Pause",
                        "size": 449
                    }, {
                        "name": "Scheduler",
                        "size": 5593
                    }, {
                        "name": "Sequence",
                        "size": 5534
                    }, {
                        "name": "Transition",
                        "size": 9201
                    }, {
                        "name": "Transitioner",
                        "size": 19975
                    }, {
                        "name": "TransitionEvent",
                        "size": 1116
                    }, {
                        "name": "Tween",
                        "size": 6006
                    }]
            }, {"name": "BB", "children": []}
            , {"name": "CC", "children": []}, {
                "name": "data",
                "children": [{
                        "name": "converters",
                        "children": [{
                                "name": "Converters",
                                "size": 721
                            }, {
                                "name": "DelimitedTextConverter",
                                "size": 4294
                            }, {
                                "name": "GraphMLConverter",
                                "size": 9800
                            }, {
                                "name": "IDataConverter",
                                "size": 1314
                            }, {
                                "name": "JSONConverter",
                                "size": 2220
                            }]
                    }, {
                        "name": "DataField",
                        "size": 1759
                    }, {
                        "name": "DataSchema",
                        "size": 2165
                    }, {
                        "name": "DataSet",
                        "size": 586
                    }, {
                        "name": "DataSource",
                        "size": 3331
                    }, {
                        "name": "DataTable",
                        "size": 772
                    }, {
                        "name": "DataUtil",
                        "size": 3322
                    }]
            }, {"name": "ZZ", "children": []}]
    };
}

