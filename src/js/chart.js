/*
 * David Ma - March 2018
 */
class Chart {

    // Sets variables
    constructor(opts) {

        // Set variables...
        this.element = opts.element || "chart";
        this.data = opts.data || [];
        this.title = opts.title || "";
        this.subtitle = opts.subtitle || "";

        this.width  = opts.width || 960;
        this.height = opts.height || 600;
        this.margin = opts.margin || { top: 70, right: 70, bottom: 50, left: 200 };

        this.innerHeight = this.height - (this.margin.top + this.margin.bottom);
        this.innerWidth = this.width - (this.margin.right + this.margin.left);

        this.svg = d3.select(`#${opts.element}`)
            .classed("chart", true)
            .append("svg").attrs({
                viewBox: `0 0 ${this.width} ${this.height}`
            }).styles({
                background: "rgba(0,0,0,0.05)"
            });

        this.fullscreen = false;

        this.draw();
    }

    // Draws the plot and individual parts of the plot
    draw() {
        this.plot = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

        // Add the background
        this.plot.append("rect")
            .attrs({
                fill: "white",
                x: 0,
                y: 0,
                height: this.innerHeight,
                width: this.innerWidth
            });

        this.drawNav();

        // Add the title
        this.svg.append('text')
            .attr('transform', `translate(${this.width / 2},${this.margin.top / 2})`)
            .attr("class", "chart-title")
            .attr('x', 0)
            .attr('y', 0)
            .text(this.title);
    }

    drawNav() {
        var svg = d3.select(`#${this.element}`).append("div")
            .classed("chart-nav", true);

        svg.append("div")
            .datum(this)
            .on("click", this.toggleFullscreen)
            .append("span")
            .classed("expander", true)
            .append("i").classed("fa fa-lg fa-expand", true);
    }

    toggleFullscreen(chart) {
        chart = chart || this;

        if(chart.fullscreen) {
            console.log("Already fullscreen, minimise!");
            chart.fullscreen = false;

            $(`#big-chart svg`).detach().appendTo(`#${chart.element}`);
            $(`#big-chart`).remove();
        } else {
            console.log("Let's make it BIG!");
            chart.fullscreen = true;

            $("<div id='big-chart' class='chart'></div>").insertBefore("body header");
            $(`#${chart.element} svg`).detach().appendTo("#big-chart");

        }
    }

    /*
     * This chart expects:
     * [{
     *   column title:
     * }]
     */
    columnChart(d) {
        console.log("this is d", d);
        console.log("this is the data", this.data);

        var values = [];
        this.data.forEach(function(column){
            values = values.concat(column.values);
        });


        // Call the necessary functions
        this.createScales(values);
        this.addAxes();
        // this.addTitles();
        this.addChart(values);

        return this;
    }

    createScales( values ) {
        // We set the domain to zero to make sure our bars
        // always start at zero. We don't want to truncate.
        this.xScale = d3.scaleLinear()
            .domain([0, parseInt(d3.max(values) * 1.1)])
            .range([0, this.innerWidth]);

        // Range relates to pixels
        // Domain relates to data

        this.yBand = d3.scaleBand()
            .paddingInner(0.2)
            .domain(this.data.map(d => d.name))
            .rangeRound([this.innerHeight - 20, 20]);

    }

    addAxes() {
        // Create axises to be called later
        const xAxis = d3.axisBottom()
            .scale(this.xScale);

        const yAxis = d3.axisLeft()
            .scale(this.yBand);

        // Call those axis generators
        this.plot.append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(0, ${this.innerHeight})`)
            .call(
                xAxis
                    .ticks(10)
                    .tickSize(-this.innerHeight)
                    // .tickFormat(d3.format(".3s"))
            );

        // Add y-axis ticks
        this.plot.append("g")
            .attr("class", "y axis")
            .attr("transform", 'translate(0, 0)')
            .call(yAxis);
    }

    addTitles() {
        // Add chart title
        this.plot.append('text')
            .attr("class", "chart title")
            .attr('x', 0)
            .attr('y', -30)
            .text(this.title);

        // Add chart subtitle
        this.plot.append('text')
            .attr("class", "chart subtitle")
            .attr('x', 0)
            .attr('y', -5)
            .text(this.subtitle);

        // Add x-axis title
        this.plot.append('text')
            .style("text-anchor", "end")
            .attr("class", "x axis title")
            .attr('x', this.innerWidth)
            .attr('y', this.innerHeight + 30)
            .text("EXPORTS (USD)");
    }

    addChart() {
        var that = this;
        this.plot.selectAll(".bar")
            .data(this.data)
            .enter()
            .append("g").classed("bar", true)
            .each(function(d){
                var bar = d3.select(this);

                console.log(d);

                bar.append("rect")
                    .attr("fill", "#e34a33")
                    .attr("x", 0)
                    .attr("y", d => that.yBand(d.name))
                    .attr("width", d => that.xScale(d.values[1]))
                    .attr("height", that.yBand.bandwidth());

                bar.append("rect")
                    .attr("fill", "#2ca25f")
                    .attr("x", d => that.xScale(d.values[1]))
                    .attr("y", d => that.yBand(d.name))
                    .attr("width", d => that.xScale(d.values[0]))
                    .attr("height", that.yBand.bandwidth());

            })

        // append("rect")
        //     .attr('class', "bar")
        //     .attr("x", 0)
        //     .attr("y", d => this.yBand(d.name))
        //     .attr("width", d => this.xScale(d.exports))
        //     .attr("height", this.yBand.bandwidth());
    }

}


