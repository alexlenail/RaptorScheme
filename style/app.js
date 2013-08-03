// set up SVG for D3
var width  = 1600,
    height = 1200,
    colors = d3.scale.category10();

var svg = d3.select('body')
  .insert('svg')
  .attr('width', width)
  .attr('height', height)
  .style('background_color','transparent')
  .style('position','absolute')
  .style('right','0')
  .style('top','50');

// set up initial nodes and links
//  - nodes are known by 'id', not by index in array.
//  - reflexive edges are indicated on the node (as a bold black circle).
//  - links are always source < target; edge directions are set by 'left' and 'right'.


  var lastNodeId = 3;

  var links = [];


nodes = [];
counter = 0;

getCourses().done(function(Departments){Departments=arguments;},function(Departments){
  drawSideBar(Departments);});

function getCourses() {
  return $.getJSON("source/course_names.txt");
};


function loadDept(index){
  for(j = 0; j < nodes.length; j++){
   nodes.splice(nodes.indexOf(j),1);
   spliceLinksForNode(j);
  }


getCourses().done(function(Departments){Departments=arguments;},function(Departments){

  for(i = 0; i < Departments[index].length; i++){
   nodes[i] = push_nodes(Departments[index][i].course);
  }});
restart();
}
function push_nodes(string){
  return {id:string,reflexive:true};
  }


function spliceLinksForNode(node) {
  var toSplice = links.filter(function(l) {
    return (l.source === node || l.target === node);
  });
  toSplice.map(function(l) {
    links.splice(links.indexOf(l), 1);
  });
}

var force = d3.layout.force()
    .nodes(nodes)
    .links(links)
    .size([width, height])
    .linkDistance(150)
    .charge(-500)
    .on('tick', tick)

//define arrow markers for graph links
svg.append('svg:defs').append('svg:marker')
    .attr('id', 'end-arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 20)
    .attr('markerWidth', 3)
    .attr('markerHeight', 3)
    .attr('orient', 'auto')
  .append('svg:path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#000');

svg.append('svg:defs').append('svg:marker')
    .attr('id', 'start-arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 30)
    .attr('markerWidth', 3)
    .attr('markerHeight', 3)
    .attr('orient', 'auto')
  .append('svg:path')
    .attr('d', 'M10,-5L0,0L10,5')
    .attr('fill', '#000');


// handles to link and node element groups
var path = svg.append('svg:g').selectAll('path'),
    circle = svg.append('svg:g').selectAll('g');

// mouse event vars
var selected_node = null,
    selected_link = null,
    mousedown_link = null,
    mousedown_node = null,
    mouseup_node = null;

function resetMouseVars() {
  mousedown_node = null;
  mouseup_node = null;
  mousedown_link = null;
}

// update force layout (called automatically each iteration)
function tick() {
  // draw directed edges with proper padding from node centers
  path.attr('d', function(d) {
    var deltaX = d.target.x - d.source.x,
        deltaY = d.target.y - d.source.y,
        dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
        normX = deltaX / dist,
        normY = deltaY / dist,
        sourcePadding = d.left ? 17 : 12,
        targetPadding = d.right ? 17 : 12,
        sourceX = d.source.x + (sourcePadding * normX),
        sourceY = d.source.y + (sourcePadding * normY),
        targetX = d.target.x - (targetPadding * normX),
        targetY = d.target.y - (targetPadding * normY);
    return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
  });

  circle.attr('transform', function(d) {
    return 'translate(' + d.x + ',' + d.y + ')';
  });
}

// update graph (called when needed)
function restart() {
  // path (link) group
  path = path.data(links);

  // update existing links
  path.classed('selected', function(d) { return d === selected_link; })
    .style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
    .style('marker-end', function(d) { return d.right ? 'url(#end-arrow)' : ''; });


  // add new links
  path.enter().append('svg:path')
    .attr('class', 'link')
    .classed('selected', function(d) { return d === selected_link; })
    .style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
    .style('marker-end', function(d) { return d.right ? 'url(#end-arrow)' : ''; })
    .on('mousedown', function(d) {
      // select link
      mousedown_link = d;
      if(mousedown_link === selected_link) selected_link = null;
      else selected_link = mousedown_link;
      selected_node = null;
      restart();
    });

  // remove old links
  path.exit().remove();


  // circle (node) group
  // NB: the function arg is crucial here! nodes are known by id, not by index!
  circle = circle.data(nodes, function(d) { return d.id; });

  // update existing nodes (reflexive & selected visual states)
  circle.selectAll('circle')
    .style('fill', function(d) { return (d === selected_node) ? d3.rgb(colors(82,131,199)).toString() : colors(82,131,199); })
    .classed('reflexive', function(d) { return d.reflexive; });

  // add new nodes
  var g = circle.enter().append('svg:g');

  g.append('svg:circle')
    .attr('class', 'node')
    .attr('r', 32)
    .style('fill', function(d) { return (d === selected_node) ? d3.rgb(82,131,199).toString() : colors(82,131,199); })
    .style('stroke', function(d) { return d3.rgb(colors(27,71,130)).toString(); })
    .classed('reflexive', function(d) { return d.reflexive; })
    .on('mouseover', function(d) {

      // enlarge target node
      d3.select(this).attr('transform', 'scale(1.1)');}).on('mouseout', function(d) {

      // unenlarge target node
      d3.select(this).attr('transform', 'scale(1.0)');}).on('mousedown', function(d) {
      // select node
      mousedown_node = d;
      if(mousedown_node === selected_node) selected_node = null;
      else selected_node = mousedown_node;
      selected_link = null;      

      restart();
    })
    
  // show node IDs
  g.append('svg:text')
      .attr('x', 0)
      .attr('y', 4)
      .attr('class', 'id')
      .text(function(d) { return d.id; });

  // remove old nodes
  circle.exit().remove();

  // set the graph in motion
  force.start();
}

//for testing
function mousedown() {

 svg.classed('active', true);
  restart();
}



function create_node(name) {

  node = {id: ++lastNodeId, reflexive: true};
  node.x = 50;
  node.y = 50;
  nodes.push(node);



}

function create_arrow(node1, node2){

var source, target, direction;

      var link;
        link = {source: node1, target:node2, left: false, right: true};
        links.push(link);
}



function init_nodes(array){
  var nodes = [];
  for(i = 0; i < array.length; i++){
     nodes[i] = {id:array[i] , reflexive:true}
  }

  return nodes;
}

//Pass in a list of courses (from a certain dept)
function makeCourseNodes(courseArray)
{
    orderCreated=0;
    var orderCreatedArray=[];
    nodeArray=[];
    for(i=0; i<courseArray.length; i++){
        nodes.push({id:courseArray[i][2], reflexive:true}) //(ID)
        nodeArray[i] = {id:courseArray[i][2], reflexive:true};
        orderCreatedArray[ courseArray[i][2] ] = orderCreated;
        console.log(orderCreatedArray[ courseArray[i][2] ]);

        orderCreated+=1;
    }
    for(i=0; i<courseArray.length; i++){
        for(p=0; p<courseArray[i][4]; p++){ //Loop through prereqs
            create_arrow(orderCreatedArray[ courseArray[i][4][p] ],orderCreatedArray[ courseArray[i][2] ]);
        }

    }
    return nodeArray;
}
loadDept(14);


// app starts here
svg.on('mousedown', mousedown)
mousedown();

function drawSideBar(Departments) {
  for(i = 0; i < Departments.length; i++) {
    if(Departments[i].length !== 0){
    var value = i;
      $("#Sidebar").append('<div class = "Department_button" value=' + i +'>' + Departments[i][0].dept + '</div>')
    }
  };
};

// sidebar and button functions:
function change_background_to_open_button() {
$("#button").css('background-image','url(images/graphics/open_button.png)');}

function change_background_to_close_button() {
$("#button").css('background-image','url(images/graphics/close_button.png)');}

function change_background_to_close_button_set() {
  $("#button").promise().done(function() {
    change_background_to_close_button();});}


$(document).ready(function(){
  $(".Department_button").hide();
  $("#Department_Title").hide();

  $("#button").toggle(function Open(){
    $("#button").delay(400).animate({right: "200px"}, 400);
    $("#Sidebar").animate({width: "254px"}, 400);
    change_background_to_close_button_set();
    $(".Department_button").delay(800).fadeIn(300);
    $("#Department_Title").delay(1000).fadeIn(200);
  },function Close(){
    $(".Department_button").hide();
    $("#Department_Title").fadeOut(200);
    $("#button").animate({right: "0px"}, 400);
    $("#Sidebar").animate({width: "0px"}, 400); 
    change_background_to_open_button();
  });     
  
});

$(document).ready(function() {
    $('#Department_button').click(function(){
        value = $(this.val());
        loadDept(value);
    });
});