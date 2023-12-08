// Define dimensions and margins
const width = 800; // Adjust as needed
const height = 600; // Adjust as needed
const margin = { top: 20, right: 20, bottom: 30, left: 60 }; // Adjust as needed

// Define a radius scale if needed
const scaleRadius = d => Math.sqrt(d); // Adjust the scale function as needed

// Create SVG canvas outside the data load to access it later in the sort function
const svg = d3.select('#your-svg-container')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

// Load CSV data
let data;
let yScale; // Declare yScale here

d3.csv("mean_scores_df.csv").then(loadedData => {
    data = loadedData; //
    // Convert numeric values from strings to numbers
    data.forEach(d => {
        d.score_present = +d.score_present;
        d.score_absent = +d.score_absent;
        d.popularity = +d.popularity;
    });

    // Create scales
    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => Math.max(d.score_present, d.score_absent))])
        .range([margin.left, width - margin.right]);

     yScale = d3.scaleBand()
        .domain(data.map(d => d.word))
        .range([margin.top, height - margin.bottom])
        .padding(0.1);

    // Draw lines
    svg.selectAll('.line')
        .data(data)
        .enter().append('line')
        .attr('x1', d => xScale(d.score_present))
        .attr('x2', d => xScale(d.score_absent))
        .attr('y1', d => yScale(d.word))
        .attr('y2', d => yScale(d.word))
        .attr('stroke', 'grey');

    // Draw circles
    svg.selectAll('.circle')
        .data(data)
        .enter().append('circle')
        .attr('cx', d => xScale(d.score_present))
        .attr('cy', d => yScale(d.word))
        .attr('r', d => scaleRadius(d.popularity * 0.5)) // Adjust the radius
        .attr('fill', 'black')
        .attr('stroke', 'black')
        .attr('stroke-width', 1);

    svg.selectAll('.circle')
        .data(data)
        .enter().append('circle')
        .attr('cx', d => xScale(d.score_absent))
        .attr('cy', d => yScale(d.word))
        .attr('r', d => scaleRadius(50)) // Adjust the radius
        .attr('fill', 'white')
        .attr('stroke', 'black')
        .attr('stroke-width', 1);

    // Add Axes
    const xAxis = d3.axisBottom(xScale);
    svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(xAxis);

    const yAxis = d3.axisLeft(yScale);
    svg.append('g')
        .attr('class', 'y-axis') // Assign a class for identification
        .attr('transform', `translate(${margin.left},0)`)
        .call(yAxis);

    // Sort function
    function sortBy(criteria) {
        console.log("Before sorting:", data.map(d => ({ word: d.word, criteria: d[criteria] })));
    
        if (criteria === 'popularity') {
            data.sort((a, b) => d3.descending(a.popularity, b.popularity));
        } else if (criteria === 'score') {
            data.sort((a, b) => d3.descending(a.score_present, b.score_present));
        }
        console.log("After sorting:", data.map(d => ({ word: d.word, criteria: d[criteria] })));
       
        yScale.domain(data.map(d => d.word));

        // Transition the y-positions of the lines and circles
        svg.selectAll('line')
            .transition()
            .duration(750)
            .attr('y1', d => yScale(d.word))
            .attr('y2', d => yScale(d.word));
    
        svg.selectAll('circle') // Make sure this selector is correct
            .transition()
            .duration(750)
            .attr('cy', d => yScale(d.word));
        
            const yAxis = d3.axisLeft(yScale); // Create a new y-axis
        svg.select('.y-axis') // Select the y-axis group
            .transition() 
            .duration(750)
            .call(yAxis); // Update the y-axis
    function setActiveButton(selectedButtonId) {
    d3.selectAll('.btn').classed('active', false); // Remove 'active' class from all buttons
    d3.select(`#${selectedButtonId}`).classed('active', true); // Add 'active' class to the selected button
}

d3.select('#sort-popularity').on('click', () => {
    sortBy('popularity');
    setActiveButton('sort-popularity');
});

d3.select('#sort-score').on('click', () => {
    sortBy('score');
    setActiveButton('sort-score');
});
function setActiveButton(selectedButtonId) {
    d3.selectAll('.btn').classed('active', false); // Remove 'active' class from all buttons
    d3.select(`#${selectedButtonId}`).classed('active', true); // Add 'active' class to the selected button
}

d3.select('#sort-popularity').on('click', () => {
    sortBy('popularity');
    setActiveButton('sort-popularity');
});

d3.select('#sort-score').on('click', () => {
    sortBy('score');
    setActiveButton('sort-score');
});

    }

    // Event listeners for sorting
    d3.select('#sort-popularity').on('click', () => sortBy('popularity'));
    d3.select('#sort-score').on('click', () => sortBy('score'));
});
