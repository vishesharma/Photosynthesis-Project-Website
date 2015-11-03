<!-- hide script from old browsers
	var recordingEvent;
	var parseObject;
			
	// Function that contains a loop that graphs the data from the database
	function record(devNum, query)
	{
		var outputWindow = document.getElementById('dataPlane');
		
		// Reset background to gray in case the map was viewed
		outputWindow.innerHTML = "";
		
		// Initialize datapoints to 0
		var CO2DataPoints = [{x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}, {x: 4, y: 0}, {x: 5, y: 0}];
		var tempFDataPoints = [{x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}, {x: 4, y: 0}, {x: 5, y: 0}];
		var tempCDataPoints = [{x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}, {x: 4, y: 0}, {x: 5, y: 0}];
		var humidityDataPoints = [{x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}, {x: 4, y: 0}, {x: 5, y: 0}];
		var lightDataPoints = [{x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}, {x: 4, y: 0}, {x: 5, y: 0}];
		var dpsMain = [CO2DataPoints, tempCDataPoints, tempFDataPoints, humidityDataPoints, lightDataPoints];
		
		// Set up containers for the graphs
		var CO2Chart 		= createGraphContainer("CO2ChartContainer", "left");
		var tempCChart 		= createGraphContainer("tempCChartContainer", null);
		var tempFChart 		= createGraphContainer("tempFChartContainer", "left");
		var humidityChart 	= createGraphContainer("humidityChartContainer", null);
		var lightChart 		= createGraphContainer("lightChartContainer", "left");
		
		// Add the graph containers to the web page
		document.getElementById('dataPlane').appendChild(CO2Chart);
		document.getElementById('dataPlane').appendChild(tempCChart);
		document.getElementById('dataPlane').appendChild(tempFChart);
		document.getElementById('dataPlane').appendChild(humidityChart);
		document.getElementById('dataPlane').appendChild(lightChart);
		
		// Create the graphs
		var CO2Graph 		= createGraphs("CO2ChartContainer", "CO2 Level", dpsMain[0], "CO2 (ppm)");
		var tempFGraph 		= createGraphs("tempFChartContainer", "Temperature", dpsMain[1], "Temperature (F)");
		var tempCGraph 		= createGraphs("tempCChartContainer", "Temperature", dpsMain[2], "Temperature (C)");
		var humidityGraph 	= createGraphs("humidityChartContainer", "Humidity", dpsMain[3], "Humidity (%)");
		var lightGraph 		= createGraphs("lightChartContainer", "Light Intensity", dpsMain[4], "Light Intensity (Lumens)");
		
		var xVal = dpsMain[0].length + 1;
		var yVal;	
				
		function loop()
		{
			recordingEvent = setTimeout(function()
			{
				parseObject.fetch();
				var sensorValues = parseObject.get("data");
				
				// Add new data points
				dpsMain[0].push({x: xVal,y: + sensorValues[0]});
				dpsMain[1].push({x: xVal,y: + sensorValues[1]});
				dpsMain[2].push({x: xVal,y: + sensorValues[2]});
				dpsMain[3].push({x: xVal,y: + sensorValues[3]});
				dpsMain[4].push({x: xVal,y: + sensorValues[4]});
				
				// Inrease x-axis value by 1
				xVal+= 1;
				
				// Make sure we only show 10 minutes of data
				if (dpsMain[1].length >  600 || xVal < 12 )
				{
					dpsMain[0].shift();
					dpsMain[1].shift();
					dpsMain[2].shift();
					dpsMain[3].shift();
					dpsMain[4].shift();
				}
				
				CO2Graph.render();
				tempCGraph.render();
				tempFGraph.render();
				humidityGraph.render();
				lightGraph.render();
				
				loop();
				
			}, 1000)}
			
		loop();
	}
	
	// Helper function create the graph containers
	function createGraphContainer(id, floatValue)
	{
		var newChart = document.createElement("div");
		newChart.setAttribute("id", id);
		newChart.style.width = "350px";
		newChart.style.height = "200px";
		if(floatValue != null)
		{
			newChart.style.float = "left";
		}
		newChart.style.margin = "10px 20px";
		
		return newChart
	}
	
	// Helper function to create the graphs
	function createGraphs(container, title, data, units)
	{
		var graph = new CanvasJS.Chart(container,{
		title :{
			text: title
		},
		axisX: {						
			title: "Time (s)"
		},
		axisY: {						
			title: units
		},
		data: [{
			type: "line",
			dataPoints : data
			}]
		});
		graph.render();
		
		return graph;
	}
	
	// Helper function to create buttons
	function createButtons(text, onClickFunction)
	{
		var newButton = document.createElement("a");
		newButton.setAttribute("href", "#");
		newButton.setAttribute("onclick", onClickFunction);
		newButton.setAttribute("id", "buttons");
		newButton.innerHTML = text
		newButton.style.float = "left";
		
		return newButton;
	}
	
	// Freezes the graph
	function stopRecording()
	{
		clearTimeout(recordingEvent);
	}
	
	// Clears all information about the current Arduino and
	// removes all of the graphs
	function clearDisplay()
	{
		var outputWindow = document.getElementById('dataPlane');
		outputWindow.innerHTML = "";
		
		// Reset all information from the previous Arduino
		document.getElementById("content").value = "<p>Welcome! To begin, search for an Arduino using and style the graph using the menu on the left.</p>";
		document.getElementById("latitude").value = null;
		document.getElementById("longitude").value = null;
		document.getElementById("tree").value = null;
		document.getElementById("notes").value = null;
		document.getElementById("arduino_ID").value = null;
		
		// Disable all inputs and buttons
		document.getElementById("latitude").disabled = true;
		document.getElementById("longitude").disabled = true;
		document.getElementById("tree").disabled = true;
		document.getElementById("notes").disabled = true;
		document.getElementById("save").disabled = true;
		
		parseObject = null;
		document.getElementById("content").innerHTML = "<p>Please enter an Arduino ID.</p>";
	}
	
	// Main function that sets up the area where the graphs will be created
	// It also loads the information about the current Arduino
	function createDataWindow()
	{
		var devNumStr = document.getElementById("arduino_ID").value;
		var devNum = parseInt(devNumStr);

		//Make sure user entered an ID
		if(devNumStr == "")
		{
			document.getElementById("content").innerHTML = "<p>Please enter an Arduino ID.</p>";
			var devNumStr = document.getElementById("arduino_ID").value = null;
			return;
		}
		
		// Style device number for print to the screen
		devNumStr = devNumStr.fontsize(3);
		devNumStr = devNumStr.fontcolor("white");
		
		// Make sure the Arduino exists
		var arduinoName = "arduino_" + devNum;
		var arduinos = Parse.Object.extend("Arduinos");
		var query = new Parse.Query(arduinos);
		query.equalTo("name", arduinoName);
		query.find({
			success: function(results)
			{
				// Arduino doesn't exist in the database
				if(results.length == 0)
				{
					document.getElementById("content").innerHTML = "<p>Arduino " + devNumStr + " cannot be found in our database.</p>";
					document.getElementById("arduino_ID").value = null;
					return;
				}
				
				// Save the data so we do not need to repeat the query
				parseObject = results[0];
				loadArduinoInformation();
				enableElements();
				
				// Print success message to screen
				document.getElementById('content').innerHTML = "<p>Device Found: Arduino " + devNumStr + "</p>";
				
				var recordOptionsBar = document.createElement("div");
				recordOptionsBar.setAttribute("id", "recordBar");
				
				// Create Record, Stop, and Clear buttons
				var recordButton = createButtons("Record", "record(" + devNum + ")");
				var stopButton = createButtons("Stop", "stopRecording()");
				var clearButton = createButtons("Clear", "clearDisplay()");
				var mapButton = createButtons("Map", "showMap()");
				
				// Set up area where graphs will be displayed
				var dataWindow = document.createElement("div");
				dataWindow.setAttribute("id", "dataPlane");
				dataWindow.style.margin = "50px 5px";
				dataWindow.style.padding = "5px 5px";
				dataWindow.style.width = "755px";
				dataWindow.style.height = "700px";
				dataWindow.style.background = "#E8E8E8";
				dataWindow.style.color = "black";
				
				// Show all of the elements created above
				document.getElementById('content').appendChild(recordOptionsBar);
				document.getElementById('recordBar').appendChild(recordButton);
				document.getElementById('recordBar').appendChild(stopButton);
				document.getElementById('recordBar').appendChild(clearButton);
				document.getElementById("recordBar").appendChild(mapButton);
				document.getElementById('content').appendChild(dataWindow);
				
			},
			
			// Arduino doesn't exist in the database or there was a connection issue
			// Treat both errors the same
			error: function(error) 
			{
				document.getElementById("content").innerHTML = "<p>Arduino " + devNumStr + " cannot be found in our database.</p>";
				document.getElementById("arduino_ID").value = null;
				return;
			}
		});
	}
		
	// Loads the information about the current Arduino from the
	// Parse database
	function loadArduinoInformation()
	{
		// Load all information about the Arduino from the database
		var location = parseObject.get("location");
		if(location != null)
		{
			document.getElementById("latitude").value = location.latitude;
			document.getElementById("longitude").value = location.longitude;
		}
		else
		{
			document.getElementById("latitude").placeholder = "Latitude";
			document.getElementById("longitude").placeholder = "Longitude";
		}
		
		var tree = parseObject.get("tree");
		if(tree != null)
		{
			document.getElementById("tree").value = tree;
		}
		else
		{
			document.getElementById("tree").placeholder = "Enter tree type";
		}
		
		var notes = parseObject.get("notes");
		if(notes != null)
		{
			document.getElementById("notes").value = notes;
		}
		else
		{
			document.getElementById("notes").placeholder = "Write notes here"
		}
	}	
	
	// Helper function that enables all input and button elements
	function enableElements()
	{
		// Enable all input and button elements
		document.getElementById("latitude").disabled = false;
		document.getElementById("longitude").disabled = false;
		document.getElementById("tree").disabled = false;
		document.getElementById("notes").disabled = false;
		document.getElementById("save").disabled = false;
	}
		
	// Helper function that pushes the new information to the database
	function saveData()
	{
		// Save new data only if save button is enabled
		if(document.getElementById("save").disabled == false)
		{
			var geoPoint = new Parse.GeoPoint({
                latitude: parseFloat(document.getElementById("latitude").value),
                longitude: parseFloat(document.getElementById("longitude").value)                  
            });
			parseObject.set("location", geoPoint);
			parseObject.set("tree", document.getElementById("tree").value);
			parseObject.set("notes", document.getElementById("notes").value);
			
			// Since save is asynchronous, force it to wait until
			// save is complete before returning
			parseObject.save(null, 
			{
				success:function(obj) 
				{ 
					alert("Data was saved successfully!");
				},
				error:function(err) 
				{ 
					alert("ERROR: Could not save data.  Please try again.");
				}
			});
		}
	}	
		
	function showMap()
	{		
		if(parseObject == null)
		{
			return;
		}
		
		var location = parseObject.get("location");
		var latitude;
		var longitude;
		if(location != null)
		{
			latitude = location.latitude;
			longitude = location.longitude;
		}
		else
		{
			alert("You must provide latitude and longitude coordinates in order to display the map.");
		}
		
		var map = new google.maps.Map(document.getElementById("dataPlane"), {
			center: {lat: latitude, lng: longitude},
			zoom: 7
		});
		
		var marker = new google.maps.Marker({
			map: map,
			position: {lat: latitude, lng: longitude},
			title: parseObject.get("name")
		});
	}
		
// end hiding script from old browsers -->