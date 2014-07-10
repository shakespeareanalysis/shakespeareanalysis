function plot_speech_detail(values, chart) {

  var data = values.slice();
  var label = function(d) { return d.label };
  var amount = function(d) { return d.amount };

  var width = 410,
  barHeight = 20,
  offset = 80,
  padding = 5;

  var x = d3.scale.linear()
  .domain([0, d3.max(data, amount)])
  .range([0, width - offset]);

  var color = d3.scale.category20();

  var chart = d3.select("#"+chart)
  .attr("width", width)
  .attr("height", barHeight * values.length);

  var bar = chart.selectAll("g")
  .data(data)
  .enter().append("g")
  .attr("transform", function(d, i) { return "translate("+(offset+padding)+"," + i * barHeight + ")"; });

  bar.append("rect")
  .attr("width", function(d) { return x(amount(d)) })
  .attr("fill", function(d) { return color(d.label) } )
  .attr("height", barHeight - 1);

  bar.append("text")
  .attr("x", function(d) { return -padding; })
  .attr("y", barHeight / 2)
  .attr("dy", ".35em")
  .attr("text-anchor", "end")
  .attr("fill", "black")
  .attr("font-family", "sans-serif")
  .attr("font-size", "10px")
  .text(function(d) { return label(d); });

  bar.append("text")
  .attr("x", function(d) { return width- (offset+padding); })
  .attr("y", barHeight / 2)
  .attr("dy", ".35em")
  .attr("text-anchor", "end")
  .attr("fill", "black")
  .attr("font-family", "sans-serif")
  .attr("font-size", "10px")
  .text(function(d) { return amount(d); });

}

function plot_character_network(graph, chart, linkDistance) {

  // prepare link data: names to indexes
  for(link in graph.links) {
    graph.links[link].source = graph.nodes.indexOf(graph.nodes.filter(function(obj) {
      return obj.name == graph.links[link].source || obj.name == graph.links[link].source;
    })[0]);
    graph.links[link].target = graph.nodes.indexOf(graph.nodes.filter(function(obj) {
      return obj.name == graph.links[link].target || obj.name == graph.links[link].target;
    })[0]);
    
  }
  // remove zero same-scene links 
  for(var i = 0; i < graph.links.length; i++) {
    if(graph.links[i].scenes.length < 1) {
      graph.links.splice(i, 1);  
      i--;
    }
  }

  var width = 410,
    height = 300,
    minRadius = 10,
    maxRadius = 30;

    var linkDist = function(link, index) {
      return (-15*link.scenes.length)+165;
    }
    

var force = d3.layout.force()
    .charge(-120)
    .linkDistance(linkDist)
    .size([width, height]);

var svg = d3.select("#"+chart)
    .attr("width", width)
    .attr("height", height);

var drag = force.drag()
  .on("dragstart", dragstart);

var lines = d3.scale.linear()
  .domain(d3.extent(graph.nodes, function(d) { return d.lines; }))
  .range([minRadius, maxRadius]);

force
    .nodes(graph.nodes)
    .links(graph.links)
    .start();

var link = svg.selectAll(".link")
    .data(graph.links)
  .enter().append("line")
    .attr("class", "link")
    .attr("data-scenes",  function(d) { return d.scenes.length; })
    .style("stroke-width", function(d) { return d.scenes.length; });

var node = svg.selectAll(".node")
    .data(graph.nodes)
  .enter().append("g")
    .attr("class", "circlenode")
    .call(drag);

node.append("circle")
    .attr("class", "node")
    .attr("r", function(d) {return lines(d.lines) })
    .style("fill", function(d) { return d.bgcolor; });

node.append("text")
    .attr("font-family", "sans-serif")
    .attr("font-size", "10px")
    .attr("dy", "-0.5em")
    .attr("text-anchor", "middle")
    .attr("fill", "black")
    .attr("stroke", "none")
    .text(function(d) { return d.name; });

node.append("text")
    .attr("font-family", "sans-serif")
    .attr("font-size", "10px")
    .attr("dy", "1em")
    .attr("text-anchor", "middle")
    .attr("fill", "black")
    .attr("stroke", "none")
    .text(function(d) { return d.lines; });

force.on("tick", function() {
  node
    .attr("cx", function(d) { return d.x = Math.max( (maxRadius-minRadius), Math.min(width - (maxRadius-minRadius), d.x)); })
    .attr("cy", function(d) { return d.y = Math.max( (maxRadius-minRadius), Math.min(height -  (maxRadius-minRadius), d.y)); })
    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });
});

function dragstart(d) {
  d3.select(this).classed("fixed", d.fixed = true);
}
  
}




/* pie plots */
function plot_pie(values, chart) {

  // remove zero-value entries 
  // this is temporary due to problems with characters contained in groups
  // TODO: Fix in future release
  for(var i = 0; i < values.length; i++) {
    if(values[i].amount < 1) {
      values.splice(i, 1);  
      i--;
    }
  }

  var width = 410,
    height = 310,
    labeldist = -15,
    outerdist = 75,
    radius = (Math.min(width, height) / 2) - outerdist;

  var color = d3.scale.ordinal()
      .range(["#1abc9c", "#2ecc71", "#3498db", "#9b59b6", "#34495e", "#16a085", "#27ae60", "#2980b9", "#8e44ad"]);

  var arc = d3.svg.arc()
      .outerRadius(radius)
      .innerRadius(radius / 2.5);

  var pie = d3.layout.pie()
      .sort(null)
      .value(function(d) { return d.amount; });

  var svg = d3.select("#"+chart)
    .data([values])
      .attr("width", width)
      .attr("height", height)
    .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  var g = svg.selectAll(".arc")
      .data(pie)
    .enter().append("g")
      .attr("class", "arc");

  g.append("path")
      .attr("d", arc)
      .style("fill", function(d, i) { return values[i].bgcolor; });

  g.append("text")
      .attr("transform", function(d) { 
        return "translate(" + ( (radius - labeldist) * Math.sin( ((d.endAngle - d.startAngle) / 2) + d.startAngle ) ) + "," + ( -1 * (radius - labeldist) * Math.cos( ((d.endAngle - d.startAngle) / 2) + d.startAngle ) ) + ")"; })
      .attr("dy", ".35em")
      .style("text-anchor", function(d) {
        var rads = ((d.endAngle - d.startAngle) / 2) + d.startAngle;
        if ( (rads > 7 * Math.PI / 4 && rads < Math.PI / 4) || (rads > 3 * Math.PI / 4 && rads < 5 * Math.PI / 4) ) {
          return "middle";
        } else if (rads >= Math.PI / 4 && rads <= 3 * Math.PI / 4) {
          return "start";
        } else if (rads >= 5 * Math.PI / 4 && rads <= 7 * Math.PI / 4) {
          return "end";
        } else {
          return "middle";
        }
      })
      .style("fill", "black")
      .attr("class", "label")
      .text(function(d, i) { return values[i].label + " (" + values[i].amount + ")"; });




  


}


