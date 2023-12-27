let svgWidth = document.getElementById('your-svg-container').clientWidth;
let svgHeight = svgWidth *0.55; // Maintain aspect ratio, e.g., 3:4
let maxPopularity, minPopularity;
let originalData, groupedData;
let useGroupedData = false; // State of the toggle
d3.select("#your-svg-container").selectAll("*").remove();
let currentSortCriteria = 'popularity'; // Default sorting criteria



// Define dimensions and margins
const width = svgWidth; // Adjust as needed
const height = svgHeight; // Adjust as needed
const margin = { top: 20, right: 20, bottom: 30, left: 60 }; // Adjust as needed
// Calculate the y position of the x-axis label
const xAxisLabelYPosition = height - margin.bottom +25; // 20 is the additional offset, adjust as needed



// Define a radius scale if needed
const scaleRadius = d => Math.sqrt(d); // Adjust the scale function as needed

// Create SVG canvas
const svg = d3.select('#your-svg-container')
    .append('svg')
    .attr('viewBox', `0 0 ${svgWidth} ${svgHeight}`)
const stripesGroup = svg.append("g").attr("class", "stripes-group");
const linesGroup = svg.append("g").attr("class", "lines-group");
const circlesGroup = svg.append("g").attr("class", "circles-group");
// Append x-axis to SVG
const xAxisGroup = svg.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${height - margin.bottom})`);

// Placeholder for x-axis label
const xAxisLabel = svg.append('text')
    .attr('class', 'x-axis-label')
    .attr('transform', `translate(${width / 2}, ${xAxisLabelYPosition})`) // Use the calculated y position
    .attr('text-anchor', 'middle')
    .style('font-size', '11px')
    .text(''); // Initially empty
// Define scales
let xScale = d3.scaleLinear().range([margin.left, width - margin.right]);
let yScale;



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
        d.entropy_present = +d.entropy_present;
        d.entropy_absent = +d.entropy_absent;
        d.popularity = +d.popularity;
    });
    yScale = d3.scaleBand()
        .domain(originalData.map(d => d.word))
        .range([margin.top, height - margin.bottom])
        .padding(0.1);
 
    updateVisualization('rate', false);// Initial call with default metric

    // Generate word list with checkboxes
    const wordListContainer = d3.select('#word-checkboxes');
    wordListContainer.selectAll('*').remove(); // Clear existing content

    originalData.forEach(d => {
        wordListContainer.append('div')
            .attr('class', 'word-checkbox')
            .append('label')
            .attr('for', `word-${d.word}`)
            .text(d.word)
            .style("cursor", "pointer") // Change cursor to pointer on hover
            .on('click', () => handleWordSelection(d.word));
    });
    // Handle word selection
    function handleWordSelection(word) {
        const index = selectedWords.indexOf(word);
    
        if (index >= 0) {
            // If the word is already selected, remove it from the selection
            selectedWords.splice(index, 1);
            delete colorMap[word]; // Remove the color mapping for the deselected word

        } else {
            // Add new word to selection
            if (selectedWords.length >= 2) {
                // If there are already two selected words, remove the first one
                delete colorMap[selectedWords[0]];

                selectedWords.shift();
            }
            colorMap[word] = colors[colorIndex % colors.length];
            colorIndex++;
            selectedWords.push(word);
        }
    
        updateStarPlot(selectedWords, originalData);
        updateWordListStyle(selectedWords);
    }

    // Attach event listeners after checkboxes are created
 
    

});

d3.select('#toggle-group-button').on('click', function() {
    useGroupedData = !useGroupedData; // Toggle the state
    d3.select(this).classed('active', useGroupedData);
    console.log("Toggle changed: ", useGroupedData); // Added console log
    updateVisualization(currentMetric, useGroupedData);
    sortBy(currentSortCriteria, currentMetric);
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
    
    

    });
    
// Event listener for the metric buttons
d3.selectAll('[data-metric]').on('click', function() {
    let selectedMetric = d3.select(this).attr('data-metric');
    // Hide all metric descriptions
    d3.selectAll('.metric-description').style("display", "none");
    d3.select(`#description-${selectedMetric}`).style("display", "block");
    // Update the visualization based on the selected metric
    updateVisualization(selectedMetric, useGroupedData);
    setActiveButton(selectedMetric);
});

// Function to update visualization based on the selected metric
function updateVisualization(metric, useGroupData) {
    if (!originalData || (useGroupData && !groupedData)) {
        console.error("Data not loaded properly.");
        return;
    }
    const currentData = useGroupData ? groupedData : originalData;
    yScale.domain(currentData.map(d => useGroupData ? d.word_category : d.word));
    // Define metric labels
    const metricAxisLabels = {
        'rate': 'Average Number of Interactions per Day',
        'ratio': 'Ratio of Multi-button Interactions',
        'consistency': 'Ratio of Active Days',
        'buttons': 'Buttons Available',
        'entropy': 'H (bits)'
    };

    // Update x-axis label
    xAxisLabel.text(metricAxisLabels[metric] || '');
    
    stripesGroup.selectAll('.stripe')
        .data(currentData)
        .join('rect')
        .attr('class', 'stripe')
        .attr('x', margin.left)
        .attr('y', d => yScale(useGroupData ? d.word_category : d.word))
        .attr('width', width - margin.left - margin.right)
        .attr('height', yScale.bandwidth())
        .attr('fill', (d, i) => i % 2 === 0 ? '#AED6F1' : '#e8f4f8');

    let metricPresent = metric + '_present';
    let metricAbsent = metric + '_absent';
       // Draw alternating stripes for background
    
    // Update yScale domain based on the current dataset
        // Clear existing stripes and other elements

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

    let maxPopularity = d3.max(currentData, d => d.popularity);
    let minPopularity = d3.min(currentData, d => d.popularity);
    drawLegend(svg, maxPopularity, minPopularity, width, height, scaleRadius);

}           





function setActiveButton(selectedMetric) {
    console.log("Setting active button for metric:", selectedMetric);

    // Remove highlighting from all metric buttons
    d3.selectAll('[data-metric]').classed('active', false);

    // Add highlighting to the currently selected metric button
    d3.select(`[data-metric="${selectedMetric}"]`).classed('active', true);
}



function sortBy(criteria, metric) {
    currentSortCriteria = criteria
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
let selectedWords = []; // Replace with actual word selection logic
let metrics = ['rate', 'ratio', 'consistency', 'buttons','entropy'];

// Function to get metrics data for a word
function getMetricsData(word) {
  return originalData.filter(d => d.word === word).map(d => ({
    rate: d.rate_norm,
    ratio: d.ratio_norm,
    consistency: d.consistency_norm,
    buttons: d.buttons_norm, 
    entropy: d.entropy_norm
  }))[0];
}

// Define star plot dimensions

let starPlotWidth = document.getElementById('starplot-container').clientWidth;

// Define star plot dimensions
const starPlotHeight = starPlotWidth*0.85; // Maintain aspect ratio, e.g., 3:4

const starRadius = Math.min(starPlotWidth, starPlotHeight) / 3;
const starCenter = { x: starPlotWidth / 2, y: starPlotHeight / 2 };

// Create star plot SVG
const starSvg = d3.select('#starplot-container')
  .append('svg')
  .attr('width', starPlotWidth)
  .attr('height', starPlotHeight);

const buffer = 0.3; // Example buffer value, adjust as needed

  // Adjust the radial scale to include the buffer
const radialScale = d3.scaleLinear()
    .domain([-buffer, 1 + buffer]) // Extend the domain beyond 0 and 1
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
let colorMap = {}; // Object to store colors for each word
const colors = ['blue', 'green', 'orange']; // Your colors
let colorIndex = 0; // To track which color to assign next

function updateStarPlot(selectedWords, originalData) {
    // Clear existing stars
    starSvg.selectAll('path').remove();

    // Assign colors and draw stars for each selected word
    selectedWords.forEach(word => {
        if (!colorMap[word]) {
            // Assign a color and move to the next color
            colorMap[word] = colors[colorIndex % colors.length];
            colorIndex++;
        }
        drawStar(word, colorMap[word]);
    });
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
        .style("color", "black") 
        .style("padding", "10px")

    // Align with the left border of the leftmost button
    let leftPosition = metricSelectorContainer.left + window.scrollX;

    tooltip
        .style("left", `${leftPosition}px`)
        .style("top", `${element.getBoundingClientRect().bottom + window.scrollY}px`); // Directly below the button
}







// Event listener for the metric selector
let currentMetric = 'rate'; // Default metric






// Hide tooltip when clicking outside
d3.select("body").on("click", function(event) {
    if (event.target.getAttribute("data-metric") === null) {
        d3.select("#tooltip").style("display", "none");
        currentTooltipMetric = null; // Reset current tooltip metric
    }
});



// Function to draw the legend
function drawLegend(svg, maxPopularity, minPopularity, width, height) {
    svg.select(".legend").remove();

    console.log("Drawing legend with maxPopularity:", maxPopularity, "and minPopularity:", minPopularity);

    const legendGroup = svg.append("g")
                           .attr("class", "legend")
                           .attr("transform", `translate(620,315)`); // Adjusted to position at top left

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

    legendGroup.append("text")
               .attr("x", 30)
               .attr("y", 55)
               .text(`Min: ${minPopularity}`)
               .style("font-size", "10px");

    console.log("Legend drawn.");
}


function updateWordListStyle(selectedWords) {
    // Reset all labels to default style
    d3.selectAll('.word-checkbox label').style("font-weight", "normal").style("color", "black");

    // Update style for selected words
    selectedWords.forEach(word => {
        if (!colorMap[word]) {
            // Assign a color and move to the next color
            colorMap[word] = colors[colorIndex % colors.length];
            colorIndex++;
        }
        d3.select(`label[for='word-${word}']`).style("font-weight", "bold").style("color", colorMap[word]);
    });
}


updateWordListStyle(selectedWords);
updateStarPlot(selectedWords);