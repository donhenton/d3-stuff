



var counter = 0;
var smiley_counter = 0;
var w = 700;
var h = 400;
var selectedSmiley = null;
var isMouseDownOnSmiley = false;


function face_factory(classname, data, x, y, r)
{

    var drag = d3.behavior.drag()
            .on("drag", function(d, i) {
                d.x += d3.event.dx
                d.y += d3.event.dy
                d3.select(this).attr("transform", function(d, i) {
                    return "translate(" + [d.x, d.y] + ")"
                })
            });

    //data format
    //{ "x": 0 - 1 , "y": 0 -1, "z": 0-1 }
    //color could be made a parameter
    //var arc = d3.svg.arc().outerRadius(r)
    //var donut = d3.layout.pie();
    smiley_counter++;
    var face = d3.select("#charts")
            .append("svg:g")
            //.data([data.sort(d3.descending)])
            //.data([data])
            .data([{"x": x, "y": y, "id": smiley_counter}])
            .attr("class", classname)
            .attr("transform", "translate(" + x + "," + y + ")")
            // .call(drag)
            .on("mouseup", function(d, i)
            {
                mouseUpForSmiley(d, i, this);
            })
//            .on("mousemove", function(d, i)
//            {
//                mouseMoveForSVG(d, i, this,d3.event);
//            })
            .on("mousedown", function(d, i)
            {
                mouseDownForSmiley(d, i, this);
            });


    console.log("make head");
    var head_color = d3.scale.linear()
            .domain([0, 1])
            .interpolate(d3.interpolateRgb)
            .range(["#ff0000", "#0000ff"]);

    var head = face.append("svg:circle")
            .attr("class", "head")
            .attr("fill", function(d) {
                return head_color(data.x);
            })
            .attr("fill-opacity", .8)
            .attr("stroke", "#000")
            .attr("stroke-width", 4)
            .attr("r", r);

    console.log("make mouth");
    var mouth_x = [0, .5, 1];

    var mouth_x_range = d3.scale.linear()
            .domain([0, 1])
            .range([-r / 2, r / 2]);


    var mouth_y_range = d3.scale.linear()
            .domain([0, 1])
            .range([-r / 2, r / 2]);

    var mouth_y = [.5, data.y, .5];
    console.log(mouth_y)

    var mouth_line = d3.svg.line()
            .x(function(d, i) {
                return mouth_x_range(mouth_x[i]);
            })
            .y(function(d, i) {
                return mouth_y_range(mouth_y[i]);
            })
            .interpolate("basis");

    /*
     var mouth = face.append("svg:path")
     .attr("class", "mouth")
     .attr("stroke", "#000")
     .attr("stroke-width", 4)
     .attr("fill", "none")
     .attr("transform", "translate(" + [0, r/3] + ")")
     .attr("d", mouth_line(mouth_x));
     */

    console.log("create eyes")
    var eyer = r / 10 + data.z * (r / 3);
    console.log(eyer);
    var left_eye = face.append("svg:circle")
            .attr("class", "eyes")
            .attr("stroke", "#000")
            .attr("fill", "none")
            .attr("stroke-width", 4)
            .attr("transform", "translate(" + [-r / 2.5, -r / 3] + ")")
            .attr("r", eyer);

    //eyer = r/10 + data.w * (r/3);
    var right_eye = face.append("svg:circle")
            .attr("class", "eyes")
            .attr("stroke", "#000")
            .attr("fill", "none")
            .attr("stroke-width", 4)
            .attr("transform", "translate(" + [r / 2.5, -r / 3] + ")")
            .attr("r", eyer);

    var text = face.append("svg:text")
            .text("SMILE!")
            .attr("y", ".5em")
            .attr("transform", "translate(" + [0, r / 3] + ")")
            .attr("text-anchor", "middle")
            .attr("font-weight", 700)
            .attr("font-family", "Helvetica")
            .attr("fill", "#ff0")
            .attr("stroke", "none")
            .attr("pointer-events", "none")

}// end face factory


function createGraph()
{
//setup svg canvas
    d3.select("#faces")
            .append("svg:svg")
            .attr("width", w)
            .attr("height", h)
            .attr("id", "charts")
            //.on("click", clickypie)
            .append("svg:rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("stroke", "#000")
            .attr("stroke-width", 3)
            .attr("fill", "none")

    svgItem = d3.select("svg").on("mousedown.svg1", function(d, i) {
        mouseDownForSVG();
    });
    
     svgItem = d3.select("svg").on("mouseup", function(d, i) {
        mouseUpForSmiley();
    });

    svgItem.on("mousemove",function(d,i){
        mouseMoveForSVG(d,i,this,d3.event)
    });
    //this is a second listener, but it must be scoped to the item 
    //a second listener for the item
    svgItem.on("mousedown.svg2", function(d, i) {
        $("#info").append(" svg2 " + counter++);
    });

//r = 100;
    for (i = 0; i < 20; i++)
    {
        var r = 20 + Math.random() * 50;
        var data = {"x": Math.random(), "y": Math.random(), "z": Math.random(), "w": Math.random()};
        x = Math.random() * w
        y = Math.random() * h
        face_factory("face" + i, data, x, y, r);
    }
}

function mouseDownForSVG()
{
    $("#info").text("hit svg surface " + counter++);
    isMouseDownOnSmiley = false;
    selectedSmiley = null;
}
function mouseDownForSmiley(d, i, node)
{

    d3.event.stopPropagation();
    $("#info").text("d " + d.id + " i  " + i + " " + node.className.baseVal)
    selectedSmiley = node;
    isMouseDownOnSmiley = true;

}

function mouseUpForSmiley(d, i, node)
{

    if (selectedSmiley != null)
        $("#info").append(" hit up " + selectedSmiley.className.baseVal)
    selectedSmiley = null;
    isMouseDownOnSmiley = false;
}

function mouseMoveForSVG(d, i, node,event)
{
    var mouseInfo = d3.mouse(node); 
    if (isMouseDownOnSmiley)
    {
       // console.log("hit mouse move ")
      
        d3.select(selectedSmiley).attr("transform", function(d, i) {
            var cmd = "translate(" + mouseInfo[0]+","+mouseInfo[1]  + ")";
            console.log("hit "+cmd);
            return cmd;
        })
        
    }
    
   // console.log("x "+mouseInfo[0]+" "+mouseInfo[1]);
}