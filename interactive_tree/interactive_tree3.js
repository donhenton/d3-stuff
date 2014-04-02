var totalNodes = 0, maxLabelLength = 15;
            // variables for drag/drop
            var selectedNode = null, draggingNode = null;
            // panning variables
            var panSpeed = 200, panBoundary = 20; // Within 20px from edges will pan when
            // dragging.
            // Misc. variables
            var i = 0, duration = 750;
            var root;

            // size of the diagram
            var docWidth, viewerWidth, docHeight, halfHeight, quarterHeight, viewerHeight;

            var tree, zoomListener, svgGroup, baseSvg;

            /**
             * define a d3 diagonal projection for use by the node paths later on.
             */
            var diagonal = d3.svg.diagonal().projection(function(d) {
                return [ d.x, -d.y ];
            });

            // Get JSON data
            treeJSON = d3.json("network.json", function(error, treeData) {

                // size of the diagram
                docWidth = $(document).width();
                viewerWidth = docWidth / (1.361);
                docHeight = $(document).height();
                halfHeight = docHeight / 2;
                quarterHeight = docHeight / 4;
                viewerHeight = halfHeight + quarterHeight;

                tree = d3.layout.tree().size([ viewerHeight, viewerWidth ]);

                // Call visit function to establish maxLabelLength
                visit(treeData, function(d) {
                    totalNodes++;
                    maxLabelLength = Math.max(d.name.length, maxLabelLength);

                }, function(d) {
                    return d.children && d.children.length > 0 ? d.children : null;
                });

                // Sort the tree initially incase the JSON isn't in a sorted
                // order.
                sortTree();
                function pan(domNode, direction) {
                    var speed = panSpeed;
                    if (panTimer) {
                        clearTimeout(panTimer);
                        translateCoords = d3.transform(svgGroup.attr("transform"));
                        if (direction == 'left' || direction == 'right') {
                            translateX = direction == 'left' ? translateCoords.translate[0] + speed : translateCoords.translate[0]
                                    - speed;
                            translateY = translateCoords.translate[1];
                        } else if (direction == 'up' || direction == 'down') {
                            translateX = translateCoords.translate[0];
                            translateY = direction == 'up' ? translateCoords.translate[1] + speed : translateCoords.translate[1]
                                    - speed;
                        }
                        scaleX = translateCoords.scale[0];
                        scaleY = translateCoords.scale[1];
                        scale = zoomListener.scale();
                        svgGroup.transition().attr("transform",
                                "translate(" + translateX + "," + translateY + ")scale(" + scale + ")");
                        d3.select(domNode).select('g.node').attr("transform", "translate(" + translateX + "," + translateY + ")");
                        zoomListener.scale(zoomListener.scale());
                        zoomListener.translate([ translateX, translateY ]);
                        panTimer = setTimeout(function() {
                            pan(domNode, speed, direction);
                        }, 50);
                    }
                }

                // Define the zoom function for the zoomable tree

                function zoom() {
                    svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
                }

                // define the zoomListener which calls the zoom function on the
                // "zoom" event constrained within the scaleExtents
                zoomListener = d3.behavior.zoom().scaleExtent([ 0.1, 3 ]).on("zoom", zoom);

                function initiateDrag(d, domNode) {
                    draggingNode = d;
                    d3.select(domNode).select('.ghostCircle').attr('pointer-events', 'none');
                    d3.selectAll('.ghostCircle').attr('class', 'ghostCircle show');
                    d3.select(domNode).attr('class', 'node activeDrag');

                    svgGroup.selectAll("g.node").sort(function(a, b) { 
                        if (a.id != draggingNode.id)
                            return 1; // a is not the hovered element,
                        // send "a" to the back
                        else
                            return -1; // a is the hovered element,
                        // bring "a" to the front
                    });
                    // if nodes has children, remove the links and nodes
                    if (nodes.length > 1) {
                        // remove link paths
                        links = tree.links(nodes);
                        nodePaths = svgGroup.selectAll("path.link").data(links, function(d) {
                            return d.target.id;
                        }).remove();
                        // remove child nodes
                        nodesExit = svgGroup.selectAll("g.node").data(nodes, function(d) {
                            return d.id;
                        }).filter(function(d, i) {
                            if (d.id == draggingNode.id) {
                                return false;
                            }
                            return true;
                        }).remove();
                    }

                    // remove parent link
                    parentLink = tree.links(tree.nodes(draggingNode.parent));
                    svgGroup.selectAll('path.link').filter(function(d, i) {
                        if (d.target.id == draggingNode.id) {
                            return true;
                        }
                        return false;
                    }).remove();

                    dragStarted = null;
                }

                // define the baseSvg, attaching a class for styling and the
                // zoomListener
                baseSvg = d3.select("#tree-container").append("svg").attr("width", viewerWidth).attr("height", viewerHeight).attr(
                        "class", "overlay").call(zoomListener);

                // Define the drag listeners for drag/drop behaviour of nodes.
                dragListener = d3.behavior.drag().on("dragstart", function(d) {
                    if (d == root) {
                        return;
                    }
                    dragStarted = true;
                    nodes = tree.nodes(d);
                    d3.event.sourceEvent.stopPropagation();
                    // it's important that we suppress the mouseover
                    // event on the node being dragged. Otherwise it
                    // will absorb the mouseover event and the
                    // underlying node will not detect it
                    // d3.select(this).attr('pointer-events',
                    // 'none');
                }).on("drag", function(d) {
                    if (d == root) {
                        return;
                    }
                    if (dragStarted) {
                        domNode = this;
                        initiateDrag(d, domNode);
                    }

                    // get coords of mouseEvent relative to svg
                    // container to allow for panning
                    relCoords = d3.mouse($('svg').get(0));
                    if (relCoords[0] < panBoundary) {
                        panTimer = true;
                        pan(this, 'left');
                    } else if (relCoords[0] > ($('svg').width() - panBoundary)) {

                        panTimer = true;
                        pan(this, 'right');
                    } else if (relCoords[1] < panBoundary) {
                        panTimer = true;
                        pan(this, 'up');
                    } else if (relCoords[1] > ($('svg').height() - panBoundary)) {
                        panTimer = true;
                        pan(this, 'down');
                    } else {
                        try {
                            clearTimeout(panTimer);
                        } catch (e) {

                        }
                    }

                    d.x0 += d3.event.dy;
                    d.y0 += d3.event.dx;
                    var node = d3.select(this);
                    node.attr("transform", "translate(" + d.y0 + "," + d.x0 + ")");
                    updateTempConnector();
                }).on("dragend", function(d) {
                    if (d == root) {
                        return;
                    }
                    domNode = this;
                    if (selectedNode) {
                        // now remove the element from the
                        // parent, and insert it into the new
                        // elements children
                        var index = draggingNode.parent.children.indexOf(draggingNode);
                        if (index > -1) {
                            draggingNode.parent.children.splice(index, 1);
                        }
                        if (typeof selectedNode.children !== 'undefined' || typeof selectedNode._children !== 'undefined') {
                            if (typeof selectedNode.children !== 'undefined') {
                                selectedNode.children.push(draggingNode);
                            } else {
                                selectedNode._children.push(draggingNode);
                            }
                        } else {
                            selectedNode.children = [];
                            selectedNode.children.push(draggingNode);
                        }
                        // Make sure that the node being added
                        // to is expanded so user can see added
                        // node is correctly moved
                        expand(selectedNode);
                        sortTree();
                        endDrag();
                    } else {
                        endDrag();
                    }
                });

                function endDrag() {
                    selectedNode = null;
                    d3.selectAll('.ghostCircle').attr('class', 'ghostCircle');
                    d3.select(domNode).attr('class', 'node');
                    // now restore the mouseover event or we won't be able to
                    // drag a 2nd time
                    d3.select(domNode).select('.ghostCircle').attr('pointer-events', '');
                    updateTempConnector();
                    if (draggingNode !== null) {
                        update(root);
                        centerNode(draggingNode);
                        draggingNode = null;
                    }
                }

                // Helper functions for collapsing and expanding nodes.

                function collapse(d) {
                    if (d.children) {
                        d._children = d.children;
                        d._children.forEach(collapse);
                        d.children = null;
                    }
                }

                function expand(d) {
                    if (d._children) {
                        d.children = d._children;
                        d.children.forEach(expand);
                        d._children = null;
                    }
                }

                var overCircle = function(d) {
                    selectedNode = d;
                    updateTempConnector();
                };
                var outCircle = function(d) {
                    selectedNode = null;
                    updateTempConnector();
                };

                // Function to update the temporary connector indicating
                // dragging affiliation
                var updateTempConnector = function() {
                    var data = [];
                    if (draggingNode !== null && selectedNode !== null) {
                        // have to flip the source coordinates since we did this
                        // for the existing connectors on the original tree
                        data = [ {
                            source : {
                                x : selectedNode.y0,
                                y : selectedNode.x0
                            },
                            target : {
                                x : draggingNode.y0,
                                y : draggingNode.x0
                            }
                        } ];
                    }
                    var link = svgGroup.selectAll(".templink").data(data);

                    link.enter().append("path").attr("class", "templink").attr("d", d3.svg.diagonal()).attr('pointer-events',
                            'none');

                    link.attr("d", d3.svg.diagonal());

                    d3.selectAll("#stoIdlink").attr("class", "invisible");
                    d3.selectAll("#childIdlink").attr("class", "invisible");

                    link.exit().remove();
                };

                // Append a group which holds all nodes and which the zoom
                // Listener can act upon.
                svgGroup = baseSvg.append("g");

                // Define the root
                root = treeData;
                root.x0 = viewerHeight / 2;
                root.y0 = 0;

                /**
                 * The below method is called to add buttons in UI
                 */
                addLoadSLAButtons();

                /** End of method to add buttons.* */

                // Layout the tree initially and center on the root node.
                update(root);
                centerNode(root);
                collapseFirstVM();

            });

            /**
             * This function is used to set all nodes for network frame
             * 
             * @param source
             * @return
             */
            function update(source) {

                // Compute the new height, function counts total children of
                // root node and sets tree height accordingly.
                // This prevents the layout looking squashed when new nodes
                // are made visible or looking sparse when nodes are removed
                // This makes the layout more consistent.
                var levelWidth = [ 1 ];
                var childCount = function(level, n) {

                    if (n.children && n.children.length > 0) {
                        if (levelWidth.length <= level + 1)
                            levelWidth.push(10);

                        levelWidth[level + 1] += n.children.length;
                        n.children.forEach(function(d) {
                            childCount(level + 1, d);
                        });
                    }
                };
                childCount(0, root);
                var newHeight = d3.max(levelWidth) * 25;
                tree = tree.size([ newHeight, viewerWidth ]);

                // Compute the new tree layout.
                var nodes = tree.nodes(root).reverse(), links = tree.links(nodes);

                // Set widths between levels based on maxLabelLength.
                nodes.forEach(function(d, i) {
                    d.y = (d.depth * (maxLabelLength * 7));
                    /** The below code is used to add nodes in map* */
                    if (nodes[i] != null && nodes[i] != 'undefined') {
                        if (nodes[i].type == "appServer") {
                            var toolMap = d3.map();
                            toolMap.set("connId", d.connServer);
                            toolMap.set("id", d.id);
                            toolMap.set("type", "Web server");
                            toolMap.set("x", d.x);
                            toolMap.set("y", d.y);
                            tooltipMap.set(d.id, toolMap);
                        } else if (nodes[i].type == "webServer") {
                            var toolMap = d3.map();
                            toolMap.set("connId", d.connServer);
                            toolMap.set("id", d.id);
                            toolMap.set("type", "Web server");
                            toolMap.set("x", d.x);
                            toolMap.set("y", d.y);
                            tooltipMap.set(d.id, toolMap);
                        } else if (nodes[i].type == "dataServer") {
                            var toolMap = d3.map();
                            toolMap.set("connId", d.connServer);
                            toolMap.set("id", d.id);
                            toolMap.set("type", "Web server");
                            toolMap.set("x", d.x);
                            toolMap.set("y", d.y);
                            tooltipMap.set(d.id, toolMap);
                        } else if (nodes[i].type == "container") {
                            var toolMap = d3.map();
                            toolMap.set("id", d.id);
                            toolMap.set("x", d.x);
                            toolMap.set("y", d.y);
                            tooltipMap.set(d.id, toolMap);
                        } else if (nodes[i].type == "sto") {
                            var toolMap = d3.map();
                            toolMap.set("id", d.id);
                            toolMap.set("x", d.x);
                            toolMap.set("y", d.y);
                            tooltipMap.set(d.id, toolMap);
                        } else if (nodes[i].type == "lb") {
                            var toolMap = d3.map();
                            toolMap.set("id", d.id);
                            toolMap.set("x", d.x);
                            toolMap.set("y", d.y);
                            tooltipMap.set(d.id, toolMap);
                        } else if (nodes[i].type == "vm") {
                            var toolMap = d3.map();
                            toolMap.set("id", d.id);
                            toolMap.set("x", d.x);
                            toolMap.set("y", d.y);
                            tooltipMap.set(d.id, toolMap);
                        }
                    }
                    /** My code ends here */

                });

                // Update the nodes…
                node = svgGroup.selectAll("g.node").data(nodes, function(d) {
                    return d.id || (d.id = ++i);
                });

                // Enter any new nodes at the parent's previous position.
                var nodeEnter = node.enter().append("g").call(dragListener).attr("class", "node").attr("transform", function(d) {
                    return "translate(" + source.y0 + "," + source.x0 + ")";
                }).on('click', click);

                /**
                 * The below code adds circle out of the server nodes to show connection
                 * between them.
                 */
                nodeEnter.append("circle").attr({
                    r : 22
                }).attr("id", function(d, i) {
                    if (nodes[i].type == "appServer") {
                        return "outer" + nodes[i].id;
                    } else if (nodes[i].type == "webServer") {
                        return "outer" + nodes[i].id;
                    } else if (nodes[i].type == "dataServer") {
                        return "outer" + nodes[i].id;
                    }
                }).style("fill", "transparent").style("stroke-width", function(d, i) {
                    if (nodes[i].type == "appServer") {
                        return "1";
                    } else if (nodes[i].type == "webServer") {
                        return "1";
                    } else if (nodes[i].type == "dataServer") {
                        return "1";
                    } else {
                        return "0";
                    }
                }).style("stroke", "#fff");

                /** End of code which is used to connect servers* */

                nodeEnter.append("circle").attr("r", 10).attr("id", function(d, i) {
                    return nodes[i].id;
                }).style("filter", function(d, i) {
                    if (nodes[i].type == "vm") {
                        if (d.children == 'undefined' || d.children == null) {
                            return "url(#virtualMacCollapse)";
                        } else {
                            return "url(#virtualMac)";
                        }
                    } else if (nodes[i].type == "container") {
                        if (d.children == 'undefined' || d.children == null) {
                            return "url(#containerCollapse)";
                        } else {
                            return "url(#container)";
                        }

                    } else if (nodes[i].type == "appServer") {
                        return "url(#appserver)";
                    } else if (nodes[i].type == "webServer") {
                        return "url(#webserver)";
                    } else if (nodes[i].type == "dataServer") {
                        return "url(#dbserver)";
                    } else if (nodes[i].type == "network") {
                        if (d.children == 'undefined' || d.children == null) {
                            return "url(#networkCollapse)";
                        } else {
                            return "url(#network)";
                        }
                    } else if (nodes[i].type == "lb") {
                        return "url(#loadbalancer)";
                    } else if (nodes[i].type == "sto") {
                        return "url(#storage)";
                    }

                }).style("fill", function(d) {
                    return d._children ? "lightsteelblue" : "#fff";
                }).on("mouseover", function(d) {
                    getConServers(this, d3.event, "enter");
                }).on("mouseout", function(d) {
                    getConServers(this, d3.event, "exit");
                });

                nodeEnter.append("text").attr("x", function(d) {
                    return d.children || d._children ? -10 : 10;
                }).attr("dy", ".35em").attr('class', 'nodeText').attr("text-anchor", function(d) {
                    return d.children || d._children ? "end" : "start";
                }).text(function(d) {
                    return d.name;
                }).style("fill-opacity", 0);

                // phantom node to give us mouseover in a radius around it
                nodeEnter.append("circle").attr('class', 'ghostCircle').attr("r", 30).attr("opacity", 0.2) // change

                .style("fill", "red").attr('pointer-events', 'mouseover').on("mouseover", function(node) {
                    overCircle(node);
                }).on("mouseout", function(node) {
                    outCircle(node);
                });

                // Update the text to reflect whether node has children or
                // not.
                node.select('text').attr("x", function(d) {
                    return d.children || d._children ? -10 : 10;
                }).attr("text-anchor", function(d) {
                    return d.children || d._children ? "end" : "start";
                }).text(function(d) {
                    return d.name;
                });

                // Change the circle fill depending on whether it has
                // children and is collapsed
                node.select("circle.nodeCircle").attr("r", 4.5).style("fill", function(d) {
                    return d._children ? "lightsteelblue" : "#fff";
                });

                // Transition nodes to their new position.
                var nodeUpdate = node.transition().duration(duration).attr("transform", function(d) {
                    return "translate(" + (d.x - 6) + "," + -d.y + ")";
                });

                // Fade the text in
                nodeUpdate.select("text").style("fill-opacity", 1);

                // Transition exiting nodes to the parent's new position.
                var nodeExit = node.exit().transition().duration(duration).attr("transform", function(d) {
                    return "translate(" + source.y + "," + source.x + ")";
                }).remove();

                nodeExit.select("circle").attr("r", 0);

                nodeExit.select("text").style("fill-opacity", 0);

                // Update the links…
                var link = svgGroup.selectAll("path.link").data(links, function(d) {
                    return d.target.id;
                });

                // Enter any new links at the parent's previous position.

                link.enter().insert("path", "g").attr("class", "link").attr("id", function(d, i) {
                    return d.target.id + "link";
                }).attr("stroke-dasharray", function(d) {
                    return (d.source.parent) ? "6,6" : "1,0";
                }).attr("d", function(d) {
                    var o = {
                        x : source.x0,
                        y : source.y0
                    };
                    return diagonal({
                        source : o,
                        target : o
                    });
                });

                d3.selectAll("#stoIdlink").attr("class", "invisible");
                d3.selectAll("#childIdlink").attr("class", "invisible");

                // Transition links to their new position.
                link.transition().duration(duration).attr("d", diagonal);

                // Transition exiting nodes to the parent's new position.
                link.exit().transition().duration(duration).attr("d", function(d) {
                    var o = {
                        x : source.x,
                        y : source.y
                    };
                    return diagonal({
                        source : o,
                        target : o
                    });
                }).remove();

                // Stash the old positions for transition.
                nodes.forEach(function(d) {
                    /** My changes to get the first VM id if total VM count exceeds 4 */
                    if (d.type == "vm") {
                        var toolMap = d3.map();
                        toolMap.set("id", d.id.id);
                        toolMap.set("type", "VM");
                        vmMap.set(d.id, toolMap);
                        vmLength = vmLength + 1;
                        if (vmLength > 3) {
                            vmOne = d.id;
                        }
                    }
                    /** End of my changes */
                    d.x0 = d.x;
                    d.y0 = d.y;

                });

            }

            /**
             * Function to center node when clicked/dropped so node doesn't get lost when
             * collapsing/moving with large amount of children.
             */
            function centerNode(source) {
                scale = zoomListener.scale();
                x = -source.y0;
                y = -source.x0;
                x = x * scale + viewerWidth / 2;
                y = y * scale + viewerHeight / 2;
                /** My Changes-starts here* */
                x = 226.83688;
                y = 361.125;
                /** My changes-ends here* */
                d3.select('g').transition().duration(duration).attr("transform",
                        "translate(" + x + "," + y + ")scale(" + scale + ")");
                zoomListener.scale(scale);
                zoomListener.translate([ x, y ]);
                var shootX = "850.242468772961";
                var shootY = "450.75";
                getShootImage(shootX, shootY);
                // mouseovertip(d);
            }

            /**
             * This function is used to add shooting image and text into the frame.
             * 
             * @param shootImgX
             * @param shootTextX
             * @return
             */
            function getShootImage(shootImgX, shootImgY) {
                d3.select("#shootCircle").remove();
                var imgUrl = "image/target-icon.png";

                baseSvg.append("image").attr("id", "shootCircle").attr("xlink:href", imgUrl).attr("x", shootImgX).attr("y",
                        shootImgY).attr("width", 50).attr("height", 50).style("fill", "red").classed("shoot", true);

                baseSvg.append("text").text("Shooting Gun").attr("x", shootImgX).attr("y", shootImgY + 50).attr("width", 50).attr(
                        "height", 50).style("font-weight", "bold");

            }

            /**
             * Toggle children function
             */
            function toggleChildren(d) {
                if (d.children) {
                    d._children = d.children;
                    d.children = null;
                } else if (d._children) {
                    d.children = d._children;
                    d._children = null;
                }
                return d;
            }
            /*******************************************************************************
             * The below change has been made to collapse the first node , if the total VM
             * count exceeds 3.
             */

            function collapseFirstVM() {
                var levelWidth = [ 1 ];
                var childCount = function(level, n) {

                    if (n.children && n.children.length > 0) {
                        if (levelWidth.length <= level + 1)
                            levelWidth.push(0);

                        levelWidth[level + 1] += n.children.length;
                        n.children.forEach(function(d) {
                            childCount(level + 1, d);
                        });
                    }
                };
                childCount(0, root);
                var newHeight = d3.max(levelWidth) * 25; // 25 pixels per
                // line
                tree = tree.size([ newHeight, viewerWidth ]);

                // Compute the new tree layout.
                var nodes = tree.nodes(root).reverse(), links = tree.links(nodes);
                nodes.forEach(function(d) {
                    if (vmLength > 3) {
                        if (d.id == vmOne) {
                            d = toggleChildren(d);
                            update(d);
                            centerNode(d);
                            d3.select("#" + d.id).style("filter", "url(#virtualMacCollapse)");
                        }
                    }
                });
            }

            /**
             * This function is used to add buttons in network topology.
             * 
             * @return
             */
            function addLoadSLAButtons() {
                var slaDiv = document.createElement("div");
                slaDiv.setAttribute("id", "slaDiv");
                slaDiv.style.position = "relative";
                slaDiv.style.left = "35px";
                slaDiv.style.top = "-300px";
                slaDiv.style.width = "100px";

                var slaButton = document.createElement("input");
                slaButton.setAttribute("type", "button");
                slaButton.setAttribute("value", "View/Modify ServiceContract");
                slaButton.setAttribute("class", "btn btn-info");
                slaButton.setAttribute("id", "addSla");
                slaButton.style.position = "absolute";
                slaButton.setAttribute("onclick", "");// this will be modified once we
                // receive clarification on the
                // functionality.

                document.getElementById("tree-container").appendChild(slaDiv);
                document.getElementById("slaDiv").appendChild(slaButton);

                var relDiv = document.createElement("div");
                relDiv.setAttribute("id", "relDiv");
                relDiv.style.position = "relative";
                relDiv.style.left = "35px";
                relDiv.style.top = "-250px";
                relDiv.style.width = "100px";

                var loadButton = document.createElement("input");
                loadButton.setAttribute("type", "button");
                loadButton.setAttribute("value", "Add Load");
                loadButton.setAttribute("class", "btn btn-cust-info");
                loadButton.setAttribute("id", "addload");
                loadButton.style.position = "absolute";
                loadButton.style.align = "left";

                loadButton.setAttribute("onclick", "reLoadPage()");

                document.getElementById("tree-container").appendChild(relDiv);
                document.getElementById("relDiv").appendChild(loadButton);

            }

            /**
             * A recursive helper function for performing some setup by walking through all
             * nodes
             */
            function visit(parent, visitFn, childrenFn) {
                if (!parent)
                    return;

                visitFn(parent);

                var children = childrenFn(parent);
                if (children) {
                    var count = children.length;
                    for ( var i = 0; i < count; i++) {
                        visit(children[i], visitFn, childrenFn);
                    }
                }
            }
            /**
             * This function is used to show the connections between servers
             * 
             * @param element
             * @param event
             * @param status
             * @return
             */
            function getConServers(element, event, status) {
                var conServerNode;
                var targetElement = event.target;
                var targetId = targetElement.id;

                if (targetId != null) {
                    var server = tooltipMap.get(targetElement.id);
                    if (server != null) {
                        var connectedServer = server.get("connId");
                        var outerTarget = d3.select("#" + "outer" + targetId);
                        var outerCon = d3.select("#" + "outer" + connectedServer);
                        if (status == "enter") {

                            outerTarget.style("stroke", "#48C127");
                            outerTarget.style("stroke-width", 3);
                            outerCon.style("stroke", "#F07A0B");
                            outerCon.style("stroke-width", 3);

                        } else if (status == "exit") {
                            outerTarget.style("stroke", "#fff");
                            outerCon.style("stroke", "#fff");
                            outerTarget.style("stroke-width", 1);
                            outerCon.style("stroke-width", 1);

                        }
                    }
                }

            }

            /**
             * sort the tree according to the node names
             */
            function sortTree() {
                tree.sort(function(a, b) {
                    return b.name.toLowerCase() < a.name.toLowerCase() ? 1 : -1;
                });
            }

            /**
             * This function is used to perform collapse or expand operations when node is
             * clicked
             * 
             * @param d
             * @return
             */
            function click(d) {
                addDetailsDiv(d.id, d.name, d.type);
                if (d3.event.defaultPrevented || d.id == 'lbNodeId' || d.id == 'stoNodeId')
                    return; // click suppressed
                d = toggleChildren(d);
                if (d.id != null && d.id != 'undefined' && d.id != 'stoId') {
                    var image = d3.select("#" + d.id).style("filter");
                    if (image.indexOf("virtualMacCollapse") != -1) {
                        d3.select("#" + d.id).style("filter", "url(#virtualMac)");
                    } else if (image.indexOf("virtualMac") != -1) {
                        d3.select("#" + d.id).style("filter", "url(#virtualMacCollapse)");
                    }

                    else if (image.indexOf("containerCollapse") != -1) {
                        d3.select("#" + d.id).style("filter", "url(#container)");
                    } else if (image.indexOf("container") != -1) {
                        d3.select("#" + d.id).style("filter", "url(#containerCollapse)");
                    } else if (image.indexOf("networkCollapse") != -1) {
                        d3.select("#" + d.id).style("filter", "url(#network)");
                    } else if (image.indexOf("network") != -1) {
                        d3.select("#" + d.id).style("filter", "url(#networkCollapse)");
                    }

                }

                update(d);
                centerNode(d);
                if (d.id != null && (d.id == "stoNodeId" || d.id == "lbNodeId")) {
                    d3.selectAll("#childIdlink").attr("class", "invisible");
                    d3.selectAll("#stoIdlink").attr("class", "invisible");
                }

            }

            function addDetailsDiv(nodeId, nodeName, nodeType) {
                var detailsDiv = document.createElement("div");
                detailsDiv.setAttribute("id", "detailsDiv");
                detailsDiv.style.position = "relative";
                detailsDiv.style.left = "35px";
                detailsDiv.style.top = "-200px";
                detailsDiv.style.width = "150px";
                document.getElementById("tree-container").appendChild(detailsDiv);

                var innerHtmlStr = "<font face=\"Arial\" size=\"2\" style=\"text-align: left;font-weight: bold\" color=\"#0B0B0B\">Node Properties</font>"
                        + "<table id=\"propTable\">"
                        + "<tr><td>Node Id&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:</td><td align=\"left\">&nbsp;&nbsp;"
                        + nodeId
                        + "</td></tr>"
                        + "<tr><td>Node Name&nbsp;&nbsp;:</td><td align=\"left\">&nbsp;&nbsp;"
                        + nodeName
                        + "</td></tr>"
                        + "<tr><td>Node Type&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:</td><td align=\"left\"> &nbsp;&nbsp;"
                        + nodeType + "</td></tr>"
                        + "</table>";
                document.getElementById("detailsDiv").innerHTML = innerHtmlStr;

            }