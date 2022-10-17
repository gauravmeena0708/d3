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
	//html += "Population: " + d.properties.Magnitude +"<br/>";
	html += "EST Count: " + d.properties.est +"<br/>";
	html += "ACC Count: " + d.properties.acc +"<br/>";
	return html;
}

function ready(datasources) {
	let counties = datasources[0];
	let data = datasources[1];
	
	/*
	Modifictation of data starts
	*/
	let mapInfo = topojson.feature(counties, counties.objects.states);
	let data_pop = {};
	let data_est = {};
	let data_acc = {};
	
	for (let c of data) {
		let state = c.state
		data_pop[state] = +c.population;
		data_est[state] = +c.est;
		data_acc[state] = +c.accounts;
	}

	mapInfo.features = mapInfo.features.map(d => {
		let state = d.properties.st_nm;  		//get Statename
		let magnitude = data_pop[state];		//get corresponding value from other array
		let count_est = data_est[state];
		let count_acc = data_acc[state];
		d.properties.Magnitude = magnitude;
		d.properties.est = count_est;		//set properties with the value from other array
		d.properties.acc = count_acc;
		return d;
	});
	
	let maxEarthquake = d3.max(mapInfo.features, d => d.properties.Magnitude);
	let medianMagnitude = d3.median(mapInfo.features, d => d.properties.Magnitude);
	
	let maxacc = d3.max(mapInfo.features, d => d.properties.acc);
	let medianacc = d3.median(mapInfo.features, d => d.properties.acc);
	
	
	let cScale = d3.scaleLinear()
		.domain([0, medianacc, maxacc])
		.range(d3.schemeOranges[3]);

	svg.append("g")
		.selectAll("path")
		.data(mapInfo.features)
		.enter()
		.append("path")
		.attr("d", d => path(d))
		.attr("strock","black")
		.attr("fill", 
				d => d.properties.acc ?
				cScale(d.properties.acc) :
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