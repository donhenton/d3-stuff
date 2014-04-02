/**
 * 
 * This code sets up the message pump and contains the handlers for both 
 * the messages and the zoom in/out buttons
 */
//http://bl.ocks.org/mbostock/3892928
//http://codepen.io/billdwhite/pen/lCAdi
ActionCode = {
    zoomData: {"zoomFactor": 1.0, "increment": 0.1},
    actions: {"zoomIn": "zoomIn", "zoomOut": "zoomOut",
        "mouseDownNode": "mouseDownNode",
        "mouseDownSVG": "mouseDownSVG",
        "menuClicked": "menuClicked",
        "nodeClicked": "nodeClicked" ,
        "providerClicked": "providerClicked"},
    init: function()
    {
        MESSAGE_PUMP.subscribe(ActionCode.zoomInHandler, ActionCode.actions.zoomIn);
        MESSAGE_PUMP.subscribe(ActionCode.zoomOutHandler, ActionCode.actions.zoomOut);
        MESSAGE_PUMP.subscribe(ActionCode.providerClickHandler, ActionCode.actions.providerClicked);
        MESSAGE_PUMP.subscribe(ActionCode.closeContextHandler, ActionCode.actions.mouseDownNode);
        MESSAGE_PUMP.subscribe(ActionCode.closeContextHandler, ActionCode.actions.mouseDownSVG);
        MESSAGE_PUMP.subscribe(ActionCode.nodeClickedHandler, ActionCode.actions.nodeClicked);
        MESSAGE_PUMP.subscribe(ActionCode.menuClickedHandler, ActionCode.actions.menuClicked);

    },
    /**
     * button code for zoom in
     * @returns {undefined}
     */
    zoomIn: function()
    {
        MESSAGE_PUMP.raiseEvent(null, ActionCode.actions.zoomIn);
        MESSAGE_PUMP.raiseEvent(null, ActionCode.actions.mouseDownSVG);
    },
    /**
     * button code for zoom out
     * @returns {undefined}
     */
    zoomOut: function()
    {
        MESSAGE_PUMP.raiseEvent(null, ActionCode.actions.zoomOut);
        MESSAGE_PUMP.raiseEvent(null, ActionCode.actions.mouseDownSVG);
    },
    /**
     * the actual event handler
     * the parameter is zoomData : zoomFactor and increment
     * @param {incrementData} d
     * @returns {undefined}
     */
    zoomInHandler: function(d)
    {
        //console.log(" in "+ActionCode.zoomData["zoomFactor"]);
        ActionCode.zoomData["zoomFactor"] = ActionCode.zoomData["zoomFactor"] + ActionCode.zoomData["increment"];
        TreeCode.zoom(ActionCode.zoomData);
    },
    /**
     * the actual event handler 
     * @param {incrementData} d
     * @returns {undefined}
     */
    zoomOutHandler: function(d)
    {
        //console.log(" out 1 "+ActionCode.zoomData["zoomFactor"]);
        ActionCode.zoomData["zoomFactor"] = ActionCode.zoomData["zoomFactor"] - ActionCode.zoomData["increment"];
        // console.log(" out 2 "+ActionCode.zoomData["zoomFactor"]);
        TreeCode.zoom(ActionCode.zoomData);
    },
    /**
     * this handler deals with clicks on the provider nodes
     * @param {providerNode} d
     * @returns {undefined}
     */
    providerClickHandler: function(d)
    {
        info = "Clicked on " + d.type + " " + d.name + " (" + d.id + ")";
        $("#outputBox").text(info);
        var items = [];
        var clickedPath = d3.select("path[tid='" + d.id + "']");
        ActionCode.clearColoredPath();
        var nextNodeId = clickedPath.attr("sid");
        
        while (nextNodeId != 1)
        {
            nextNodeId = clickedPath.attr("sid");
            items.push(clickedPath);
            clickedPath = d3.select("path[tid='" + nextNodeId + "']");
        }
        var markFunction = function(d){ d.classed({"linkNormal":false,"linkMark": true })};
        items.forEach(markFunction);
    },
    closeContextHandler: function()
    {

        d3.select('#my_custom_menu')
                .style('display', 'none');
        
    },
    clearColoredPath: function()
    {
         d3.selectAll("path.linkMark").classed({"linkNormal":true,"linkMark": false });
    },
    
    /**
     * 
     * @param {providerData} d
     * @returns {undefined}
     */
    nodeClickedHandler: function(d)
    {
        ActionCode.clearColoredPath();
    },
    
    menuClickedHandler: function(menuId)
    {
        id = $("#nodeId").text();
        // cant raise events in a handler must call code directly
        //MESSAGE_PUMP.raiseEvent(null, ActionCode.actions.closeContext);
        ActionCode.closeContextHandler();
        // use the id to find the d3 node
        node = d3.select("g[data-id='"+id+"']");
        info = "Clicked on menu " + menuId+" for node id "+id+" "+node.datum().name;
        info += "<p> <i>This information was created via a look up using the id ";
        info += "of the node and finding the data associated with it. See "
        info += "menuClickedHandler of ActionCode</i></p>"
        $("#outputBox").html(info);
        
    }

};
