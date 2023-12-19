
let maxPopularity, minPopularity;
let originalData, groupedData;
let useGroupedData = false; // State of the toggle
d3.select("#your-svg-container").selectAll("*").remove();

// Define dimensions and margins
const width = 800; // Adjust as needed
const height = 600; // Adjust as needed
const margin = { top: 20, right: 20, bottom: 30, left: 60 }; // Adjust as needed
const metricDescriptions = {
    "rate": "Average interactions per day, excluding those wich contain the word of interest.",
    "ratio": "Out of all the learner's interactions the ratio of them who used 2 or more different words.",
    "consistency": "What proportion of days has the learner been active since its first first press until it's last press.",
    "buttons": "On average, how many different words does the learner have available."
};

// Define a radius scale if needed
const scaleRadius = d => Math.sqrt(d); // Adjust the scale function as needed

// Create SVG canvas
const svg = d3.select('#your-svg-container')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

// Define scales
let xScale = d3.scaleLinear().range([margin.left, width - margin.right]);
let yScale;

function updateStarPlot(selectedWords, originalData) {
    // Clear existing stars
    starSvg.selectAll('path').remove();

    // Colors for the stars - you can expand or change this array as needed
    const colors = ['blue', 'red', 'green', 'orange', 'purple'];

    // Draw a star for each selected word
    selectedWords.forEach((word, index) => {
        let color = colors[index % colors.length]; // Cycle through colors
        drawStar(word, color);
    });
}


// Load CSV data
d3.csv("mean_scores_df.csv").then(loadedData => {
    originalData = loadedData;
    console.log("originalData Data Loaded");

    // Convert numeric values from strings to numbers
    originalData.forEach(d => {
        d.rate_present = +d.rate_present;
        d.rate_absent = +d.rate_absent;
        d.ratio_present = +d.ratio_present;
        d.ratio_absent = +d.ratio_absent;
        d.consistency_present = +d.consistency_present;
        d.consistency_absent = +d.consistency_absent;
        d.buttons_present = +d.buttons_present;
        d.buttons_absent = +d.buttons_absent;
        d.popularity = +d.popularity;
    });
    yScale = d3.scaleBand()
        .domain(originalData.map(d => d.word))
        .range([margin.top, height - margin.bottom])
        .padding(0.1);
    // Draw alternating stripes for background
    svg.selectAll('.stripe')
       .data(originalData)
       .enter().append('rect')
       .attr('class', 'stripe')
       .attr('x', margin.left)
       .attr('y', d => yScale(d.word))
       .attr('width', width - margin.left - margin.right)
       .attr('height', yScale.bandwidth())
       .attr('fill', (d, i) => i % 2 === 0 ? 'white' : '#e8f4f8');  // Light blue for even bands
        drawStar(selectedWords[0], 'blue');
        drawStar(selectedWords[1], 'red');

    updateVisualization('rate', false);// Initial call with default metric

    // Generate word list with checkboxes
    const wordListContainer = d3.select('#word-checkboxes');
    originalData.forEach(d => {
        wordListContainer.append('div')
            .attr('class', 'word-checkbox')
            .html(`<input type="checkbox" id="word-${d.word}" name="word" value="${d.word}">
                   <label for="word-${d.word}">${d.word}</label>`);
    });
    // Attach event listeners after checkboxes are created
    d3.selectAll('.word-checkbox input').on('change', function() {
        const word = this.value;
    
        // Update the selectedWords array based on the checkbox state
        if (this.checked) {
            selectedWords.push(word);
        } else {
            selectedWords = selectedWords.filter(w => w !== word);
        }
    
        // Uncheck all checkboxes except the last two selected
        d3.selectAll('.word-checkbox input').each(function() {
            let checkBox = d3.select(this);
            let word = checkBox.property('value');
            if (selectedWords.includes(word)) {
                // Only the last two words in the selectedWords array should remain checked
                if (selectedWords.indexOf(word) < selectedWords.length - 2) {
                    checkBox.property('checked', false);
                    selectedWords = selectedWords.filter(w => w !== word); // Remove unchecked word
                }
            }
        });
    
        // Update the star plot
        updateStarPlot(selectedWords, originalData);
            // Calculate max and min popularity here
    let maxPopularity = d3.max(groupedData, d => d.popularity);
    let minPopularity = d3.min(groupedData, d => d.popularity);

    console.log("Max popularity:", maxPopularity, "Min popularity:", minPopularity);

    // Now call drawLegend
    drawLegend(svg, maxPopularity, minPopularity, width, height, scaleRadius);

    });
    

});


d3.select('#toggle-group').on('change', function() {
    useGroupedData = d3.select(this).property('checked');
    console.log("Toggle changed: ", useGroupedData); // Added console log

    updateVisualization(currentMetric, useGroupedData);
});

// Load CSV data
d3.csv("mean_scores_grouped_df.csv").then(loadedData => {
    groupedData = loadedData;
    console.log("groupedData Data Loaded");

    // Convert numeric values from strings to numbers
    groupedData.forEach(d => {
        d.rate_present = +d.rate_present;
        d.rate_absent = +d.rate_absent;
        d.ratio_present = +d.ratio_present;
        d.ratio_absent = +d.ratio_absent;
        d.consistency_present = +d.consistency_present;
        d.consistency_absent = +d.consistency_absent;
        d.buttons_present = +d.buttons_present;
        d.buttons_absent = +d.buttons_absent;
        d.popularity = +d.popularity;
    });
    yScale = d3.scaleBand()
        .domain(groupedData.map(d => d.word))
        .range([margin.top, height - margin.bottom])
        .padding(0.1);
    // Draw alternating stripes for background
    svg.selectAll('.stripe')
       .data(groupedData)
       .enter().append('rect')
       .attr('class', 'stripe')
       .attr('x', margin.left)
       .attr('y', d => yScale(d.word))
       .attr('width', width - margin.left - margin.right)
       .attr('height', yScale.bandwidth())
       .attr('fill', (d, i) => i % 2 === 0 ? 'white' : '#e8f4f8');  // Light blue for even bands

    // Calculate max and min popularity here
    let maxPopularity = d3.max(loadedData, d => d.popularity);
    let minPopularity = d3.min(loadedData, d => d.popularity);

    console.log("Max popularity:", maxPopularity, "Min popularity:", minPopularity);

    // Now call drawLegend
    drawLegend(svg, maxPopularity, minPopularity, width, height);

    

    });
    


// Function to update visualization based on the selected metric
function updateVisualization(metric, useGroupData) {
    if (!originalData || (useGroupData && !groupedData)) {
        console.error("Data not loaded properly.");
        return;
    }
    let currentData = useGroupData ? groupedData : originalData;
    let metricPresent = metric + '_present';
    let metricAbsent = metric + '_absent';
    // Update yScale domain based on the current dataset
    yScale.domain(currentData.map(d => useGroupData ? d.word_category : d.word));
    // Update xScale domain
    const minScore = d3.min(currentData, d => Math.min(d[metricPresent], d[metricAbsent]));
    const maxScore = d3.max(currentData, d => Math.max(d[metricPresent], d[metricAbsent]));
    const buffer = (maxScore - minScore) * 0.05; // 5% buffer
    xScale.domain([minScore - buffer, maxScore + buffer]);
    // Calculate the vertical center of each band
    const bandCenter = yScale.bandwidth() / 2;
    // Update lines
    const lines = svg.selectAll('.line')
                     .data(currentData);

    lines.enter().append('line')
         .attr('class', 'line')
         .merge(lines)
         .transition()
         .duration(750)
         .attr('x1', d => xScale(d[metricPresent]))
         .attr('x2', d => xScale(d[metricAbsent]))
         .attr('y1', d => yScale(useGroupData ? d.word_category : d.word) + yScale.bandwidth() / 2)
         .attr('y2', d => yScale(useGroupData ? d.word_category : d.word) + yScale.bandwidth() / 2)
         .attr('stroke', 'grey');

    lines.exit().remove();

    // Update circles
    // For metricPresent
    const circlesPresent = svg.selectAll('.circle-present')
                              .data(currentData);

    circlesPresent.enter().append('circle')
                   .attr('class', 'circle-present')
                   .merge(circlesPresent)
                   .transition()
                   .duration(750)
                   .attr('cx', d => xScale(d[metricPresent]))
                   .attr('cy', d => yScale(d.word)+ bandCenter)
                   .attr('r', d => scaleRadius(d.popularity))
                   .attr('fill', 'black');

    circlesPresent.exit().remove();

    // For metricAbsent
    const circlesAbsent = svg.selectAll('.circle-absent')
                             .data(currentData);

    circlesAbsent.enter().append('circle')
                  .attr('class', 'circle-absent')
                  .merge(circlesAbsent)
                  .transition()
                  .duration(750)
                  .attr('cx', d => xScale(d[metricAbsent]))
                  .attr('cy', d => yScale(d.word)+ bandCenter)
                  .attr('r', d => scaleRadius(0))
                  .attr('fill', 'white');

                  circlesAbsent.exit().remove();
              
                  // Update Axes
                  const xAxis = d3.axisBottom(xScale);
                  svg.select('.x-axis')
                     .transition()
                     .duration(750)
                     .attr('transform', `translate(0,${height - margin.bottom})`)
                     .call(xAxis);
              
                  const yAxis = d3.axisLeft(yScale);
                  svg.select('.y-axis')
                     .transition()
                     .duration(750)
                     .call(yAxis);
              }           





function setActiveButton(selectedMetric) {
    console.log("Setting active button for metric:", selectedMetric);

    // Remove highlighting from all metric buttons
    d3.selectAll('[data-metric]').classed('active', false);

    // Add highlighting to the currently selected metric button
    d3.select(`[data-metric="${selectedMetric}"]`).classed('active', true);
}




function sortBy(criteria, metric) {
    let currentData = useGroupedData ? groupedData : originalData;
    if (criteria === 'popularity') {
        currentData.sort((a, b) => d3.descending(a.popularity, b.popularity));
    } else if (criteria === 'metric') {
        let metricPresent = metric + '_present';
        currentData.sort((a, b) => d3.descending(a[metricPresent], b[metricPresent]));
    }

    // Update visualization with sorted data
    updateVisualization(currentMetric, useGroupedData);
}

// Event listeners for sorting buttons
// Function to set active sort button
function setActiveSortButton(selectedSortButtonId) {
    // IDs of the sort buttons
    const sortButtonIds = ['#sort-by-popularity', '#sort-by-metric'];

    // Loop through each button ID
    sortButtonIds.forEach(buttonId => {
        // Select the button
        let button = d3.select(buttonId);

        // Check if this is the button that was clicked
        if (buttonId === `#${selectedSortButtonId}`) {
            // If it is, add the 'active' class
            button.classed('active', true);
            console.log("Added active class to:", buttonId);
        } else {
            // Otherwise, remove the 'active' class
            button.classed('active', false);
            console.log("Removed active class from:", buttonId);
        }
    });
}






// Event listeners for sorting buttons
d3.select('#sort-by-popularity').on('click', () => {
    sortBy('popularity', currentMetric);
    setActiveSortButton('sort-by-popularity');
});
d3.select('#sort-by-metric').on('click', () => {
    sortBy('metric', currentMetric);
    setActiveSortButton('sort-by-metric');
});

// Append axes to SVG
svg.append('g')
   .attr('class', 'x-axis')
   .attr('transform', `translate(0,${height - margin.bottom})`);

svg.append('g')
   .attr('class', 'y-axis')
   .attr('transform', `translate(${margin.left},0)`);


//star plot

// Assume two words are selected for comparison
let selectedWords = ['treat','play']; // Replace with actual word selection logic
let metrics = ['rate', 'ratio', 'consistency', 'buttons'];

// Function to get metrics data for a word
function getMetricsData(word) {
  return originalData.filter(d => d.word === word).map(d => ({
    rate: d.rate_norm,
    ratio: d.ratio_norm,
    consistency: d.consistency_norm,
    buttons: d.buttons_norm,    
  }))[0];
}

// Define star plot dimensions
const starPlotWidth = 400, starPlotHeight = 400;
const starRadius = Math.min(starPlotWidth, starPlotHeight) / 3;
const starCenter = { x: starPlotWidth / 2, y: starPlotHeight / 2 };

// Create star plot SVG
const starSvg = d3.select('#starplot-container')
  .append('svg')
  .attr('width', starPlotWidth)
  .attr('height', starPlotHeight);

// Create a radial scale
const radialScale = d3.scaleLinear()
  .domain([0, 1]) // Assuming metrics are normalized between 0 and 1
  .range([0, starRadius]);

// Draw axes for star plot
metrics.forEach((metric, i) => {
  let angle = Math.PI * 2 / metrics.length * i;
  let lineCoords = polarToCartesian(starCenter.x, starCenter.y, starRadius, angle);
  starSvg.append('text')
    .attr('x', lineCoords.x)
    .attr('y', lineCoords.y)
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'middle')
    .text(metric);

  starSvg.append('line')
    .attr('x1', starCenter.x)
    .attr('y1', starCenter.y)
    .attr('x2', lineCoords.x)
    .attr('y2', lineCoords.y)
    .attr('stroke', 'black');
});

// Function to convert polar coordinates to Cartesian
function polarToCartesian(centerX, centerY, radius, angleInRadians) {
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

// Function to draw the star for a word
function drawStar(word, color) {
  let metricsData = getMetricsData(word);
  let points = metrics.map((metric, i) => {
    let value = metricsData[metric];
    let angle = Math.PI * 2 / metrics.length * i;
    return polarToCartesian(starCenter.x, starCenter.y, radialScale(value), angle);
  });

  // Draw the star shape
  let starPath = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')} Z`;

  starSvg.append('path')
    .attr('d', starPath)
    .attr('stroke', color)
    .attr('fill', color)
    .attr('fill-opacity', 0.5);
}

// Function to show tooltip
function showTooltip(selectedMetric, element) {
    let description = metricDescriptions[selectedMetric];
    let tooltip = d3.select("#tooltip");
    let metricSelectorContainer = d3.select("#metric-selector-container").node().getBoundingClientRect();

    tooltip
        .style("display", "block")
        .html(description)
        .style("background-color", "#343a40") // Bootstrap darker grey color
        .style("color", "white") // White text for better contrast
        .style("padding", "10px")
        .style("border-radius", "5px");

    // Align with the left border of the leftmost button
    let leftPosition = metricSelectorContainer.left + window.scrollX;

    tooltip
        .style("left", `${leftPosition}px`)
        .style("top", `${element.getBoundingClientRect().bottom + window.scrollY}px`); // Directly below the button
}







// Event listener for the metric selector
let currentMetric = 'rate'; // Default metric
d3.selectAll('[data-metric]').on('click', function() {
    let selectedMetric = d3.select(this).attr('data-metric');
    showTooltip(selectedMetric, this); // Pass 'this' as the button element
    currentMetric = selectedMetric; // Update the current metric
    updateVisualization(currentMetric, useGroupedData); // Pass the grouped data state
    setActiveButton(selectedMetric);
});





// Hide tooltip when clicking outside
d3.select("body").on("click", function(event) {
    if (event.target.getAttribute("data-metric") === null) {
        d3.select("#tooltip").style("display", "none");
        currentTooltipMetric = null; // Reset current tooltip metric
    }
});




// Function to draw the legend
// Function to draw the legend
// Function to draw the legend
function drawLegend(svg, maxPopularity, minPopularity, width, height) {
    console.log("Drawing legend with maxPopularity:", maxPopularity, "and minPopularity:", minPopularity);

    const legendGroup = svg.append("g")
                           .attr("class", "legend")
                           .attr("transform", `translate(100, 50)`); // Adjusted to position at top left

    // Add legend title
    legendGroup.append("text")
               .attr("x", 0)
               .attr("y", 0)
               .text("Popularity Scale")
               .style("font-size", "12px");

    // Max popularity
    legendGroup.append("circle")
               .attr("cx", 10)
               .attr("cy", 20)
               .attr("r", scaleRadius(maxPopularity))
               .attr("fill", "grey");

    legendGroup.append("text")
               .attr("x", 30)
               .attr("y", 25)
               .text(`Max: ${maxPopularity}`)
               .style("font-size", "10px");

    // Min popularity
    legendGroup.append("circle")
               .attr("cx", 10)
               .attr("cy", 50)
               .attr("r", scaleRadius(minPopularity))
               .attr("fill", "grey");

    legendGroup.append("text")
               .attr("x", 30)
               .attr("y", 55)
               .text(`Min: ${minPopularity}`)
               .style("font-size", "10px");

    console.log("Legend drawn.");
}