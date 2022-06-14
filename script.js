var width = 900,
  height = 600;

var path = d3.geoPath()
  .projection(null);

var svg = d3.select("#chart1").append("svg")
  .attr("width", width)
  .attr("height", height);

Promise.all([
	d3.json("https://www.covid19india.org/mini_maps/india.json"),
	d3.csv("population.csv")	
]).then(ready);

var add_tooltip = function(){
	var div = d3.select("#chart1").append("div")
			.attr("class", "tooltip")
			.style("opacity", 0);
};

var add_tooltip_text = function(d) {
	//console.log(d);
	var html = "";
	html += "State: " + d.properties.st_nm +"<br/>";
	html += "Population: " + d.properties.Magnitude +"<br/>";
	return html;
}

function ready(datasources) {
	let counties = datasources[0];
	let data = datasources[1];
	
	/*
	Modifictation of data starts
	*/
	let mapInfo = topojson.feature(counties, counties.objects.states);
	let dataIndex = {};
	for (let c of data) {
		let country = c.state
		dataIndex[country] = +c.population;
	}
	mapInfo.features = mapInfo.features.map(d => {
		let country = d.properties.st_nm;  		//get Statename
		let magnitude = dataIndex[country];     //get corresponding value from other array
		d.properties.Magnitude = magnitude;     //set properties with the value from other array
		return d;
	});
	
	let maxEarthquake = d3.max(mapInfo.features, d => d.properties.Magnitude);
	let medianMagnitude = d3.median(mapInfo.features, d => d.properties.Magnitude);
	let cScale = d3.scaleLinear()
		.domain([0, medianMagnitude, maxEarthquake])
		.range(d3.schemeOranges[3]);

	svg.append("g")
		.selectAll("path")
		.data(mapInfo.features)
		.enter()
		.append("path")
		.attr("d", d => path(d))
		.attr("strock","black")
		.attr("fill", 
				d => d.properties.Magnitude ?
				cScale(d.properties.Magnitude) :
				"white")
		.on("mouseover", function(event,d) {
			var tooltip = d3.select('.tooltip');
			tooltip.transition()
				.duration(200)
				.style("opacity", .9);
			tooltip.html(add_tooltip_text(d))
				.style("left", (event.pageX) + "px")
				.style("top", (event.pageY - 28) + "px");
		})
		.on("mouseout", function(event,d) {
			var tooltip = d3.select('.tooltip');
			tooltip.transition()
				.duration(500)
				.style("opacity", 0);
		});
	add_tooltip();
}