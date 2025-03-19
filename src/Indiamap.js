import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import indiaGeoJson from "./india.geojson";

const IndiaPopulationMap = () => {
  const svgRef = useRef();
  const tooltipRef = useRef();
  const [populationData, setPopulationData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Function to fetch data from Zoho Creator
    const fetchZohoData = async () => {
      try {
        setIsLoading(true);
        
        // Zoho Creator API configuration
        const config = { 
          appName: "react-widgets",
          reportName: "All_Data",
          page: 1,
          pageSize: 50 // Increased to get more records
        };
        
        // Call Zoho Creator API
        const response = await window.ZOHO.CREATOR.API.getAllRecords(config);
        
        if (response && response.data) {
          // Process the data from Zoho Creator
          const newPopulationData = {};
          
          response.data.forEach(record => {
            // Using the correct field names from Zoho Creator: State and Number_of_Peoples
            if (record.State && record.Number_of_Peoples) {
              newPopulationData[record.State] = parseInt(record.Number_of_Peoples, 10);
            }
          });
          
          // Update state with the new data if we have values
          if (Object.keys(newPopulationData).length > 0) {
            setPopulationData(newPopulationData);
          }
        }
      } catch (err) {
        console.error("Error fetching data from Zoho Creator:", err);
        setError("Failed to load data from Zoho Creator");
      } finally {
        setIsLoading(false);
      }
    };

    // Initialize ZOHO API and fetch data
    if (window.ZOHO && window.ZOHO.CREATOR) {
      // Initialize Zoho Creator SDK if needed
      window.ZOHO.CREATOR.init()
        .then(() => {
          fetchZohoData();
        })
        .catch(err => {
          console.error("Error initializing Zoho Creator SDK:", err);
          setError("Failed to initialize Zoho Creator SDK");
          setIsLoading(false);
        });
    } else {
      setError("Zoho Creator SDK not found. Make sure you've included the Zoho Creator SDK.");
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only render the map when we have data and aren't loading
    if (isLoading || !populationData) return;

    const width = 700, height = 800;
    const svg = d3.select(svgRef.current).attr("width", width).attr("height", height);
    
    // Clear any existing content
    svg.selectAll("*").remove();
    
    const tooltip = d3.select(tooltipRef.current);

            const colorScale = d3.scaleSequential(d3.interpolateReds)
      .domain([
        0,
        d3.max(Object.values(populationData)) || 100000000
      ]);

    d3.json(indiaGeoJson).then((geoData) => {
      const projection = d3.geoMercator()
        .scale(1000)
        .center([78, 22])
        .translate([width / 2, height / 2]);

      const path = d3.geoPath().projection(projection);

      // Create a legend
      const legendGroup = svg.append("g")
        .attr("transform", `translate(${width - 150}, ${height - 120})`);
      
      legendGroup.append("rect")
        .attr("width", 140)
        .attr("height", 110)
        .attr("fill", "white")
        .attr("stroke", "#ccc")
        .attr("rx", 5);
        
      legendGroup.append("text")
        .attr("x", 10)
        .attr("y", 20)
        .attr("font-weight", "bold")
        .text("Population");

      // Add legend gradient
      const legendHeight = 80;
      const legendWidth = 20;
      const legendX = 20;
      const legendY = 30;
      
      // Create gradient for legend
      const defs = svg.append("defs");
      const gradient = defs.append("linearGradient")
        .attr("id", "population-gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%");

      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", colorScale(d3.max(Object.values(populationData)) || 100000000));

      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", colorScale(d3.min(Object.values(populationData)) || 0));

      // Add legend rectangle with gradient
      legendGroup.append("rect")
        .attr("x", legendX)
        .attr("y", legendY)
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#population-gradient)");

      // Add legend labels
      legendGroup.append("text")
        .attr("x", legendX + legendWidth + 5)
        .attr("y", legendY + 10)
        .attr("text-anchor", "start")
        .style("font-size", "10px")
        .text(formatPopulation(d3.max(Object.values(populationData)) || 100000000));

      legendGroup.append("text")
        .attr("x", legendX + legendWidth + 5)
        .attr("y", legendY + legendHeight)
        .attr("text-anchor", "start")
        .style("font-size", "10px")
        .text(formatPopulation(0));

      // Draw map
      svg.selectAll("path.state")
        .data(geoData.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "state")
        .attr("fill", (d) => colorScale(populationData[d.properties.st_nm] || 0))
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5)
        .on("mouseover", function (event, d) {
          tooltip.style("display", "block")
            .html(`
              <strong>${d.properties.st_nm}</strong><br/>
              Population: ${formatPopulation(populationData[d.properties.st_nm] || "N/A")}
            `);
          d3.select(this).attr("stroke", "#000").attr("stroke-width", 1.5);
        })
        .on("mousemove", function (event) {
          tooltip.style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", function () {
          tooltip.style("display", "none");
          d3.select(this).attr("stroke", "#fff").attr("stroke-width", 0.5);
        });
    }).catch(err => {
      console.error("Error loading GeoJSON data:", err);
      setError("Failed to load map data");
    });
  }, [populationData, isLoading]);

  // Helper function to format population numbers
  const formatPopulation = (population) => {
    if (population === "N/A") return "N/A";
    
    if (population >= 10000000) {
      return (population / 10000000).toFixed(1) + " Cr";
    } else if (population >= 100000) {
      return (population / 100000).toFixed(1) + " Lakh";
    } else if (population >= 1000) {
      return (population / 1000).toFixed(1) + "K";
    }
    return population.toString();
  };

  return (
    <div className="map-container" style={{ textAlign: "center" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>India Map - Population Visualization</h2>
      
      {error && (
        <div style={{ color: "red", marginBottom: "15px" }}>
          Error: {error}
        </div>
      )}
      
      {isLoading ? (
        <div style={{ padding: "20px" }}>
          Loading data from Zoho Creator...
        </div>
      ) : (
        <div className="map-wrapper" style={{ display: "flex", justifyContent: "center" }}>
          <svg ref={svgRef}></svg>
          <div ref={tooltipRef} className="tooltip" style={{ 
            position: "absolute", 
            display: "none", 
            backgroundColor: "white", 
            padding: "5px", 
            border: "1px solid #ccc", 
            borderRadius: "4px",
            pointerEvents: "none",
            fontSize: "12px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
          }}></div>
        </div>
      )}
      
      <div style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}>
        Data source: Zoho Creator - react-widgets/All_Data
      </div>
    </div>
  );
};

export default IndiaPopulationMap;