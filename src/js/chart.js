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
        this.margin = opts.margin || { top: 70, right: 70, bottom: 50, left: 70 };

        this.innerHeight = this.height - (this.margin.top + this.margin.bottom);
        this.innerWidth = this.width - (this.margin.right + this.margin.left);

        this.svg = d3.select(`#${opts.element}`).append("svg").attrs({
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

        this.drawNav();

        // this.svg.rect.attrs({
        //     x:
        // });

        // Call the necessary functions
        this.createScales();
        this.addAxes();
        this.addTitles();
        this.addChart();
    }

    drawNav() {
        var svg = d3.select(`#${this.element}`).append("div")
            .classed("chart-nav", true);

        svg.append("div")
            .datum(this)
            .on("click", this.toggleFullscreen)
            .append("span")
            .classed("expander", true)
            .append("i").classed("fa fa-expand", true);
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

            $("<div id='big-chart'></div>").insertBefore("body header");
            $(`#${chart.element} svg`).detach().appendTo("#big-chart");

        }
    }

    createScales() {
        // We set the domain to zero to make sure our bars
        // always start at zero. We don't want to truncate.
        this.xScale = d3.scaleLinear()
            .domain([0, d3.max(this.data, d => d.exports)])
            .range([0, this.innerWidth]);

        // Range relates to pixels
        // Domain relates to data

        this.yBand = d3.scaleBand()
            .paddingInner(0.1)
            .domain(this.data.map(d => d.exporter))
            .rangeRound([this.innerHeight, 0]);

    }

    addAxes() {
        // Create axises to be called later
        const xAxis = d3.axisBottom()
            .scale(this.xScale);

        const yAxis = d3.axisLeft()
            .scale(this.yBand);

        // Custom format to clean up tick formattin
        const siFormat = d3.format(".2s");
        const customTickFormat = function (d) {
            return siFormat(d).replace("G", "B");
        };

        // Call those axis generators
        this.plot.append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(0, ${this.innerHeight})`)
            .call(
                xAxis
                    .ticks(10)
                    .tickSize(-this.innerHeight)
                    .tickFormat(customTickFormat));

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
        this.plot.selectAll(".bar")
            .data(this.data)
            .enter().append("rect")
            .attr('class', "bar")
            .attr("x", 0)
            .attr("y", d => this.yBand(d.exporter))
            .attr("width", d => this.xScale(d.exports))
            .attr("height", this.yBand.bandwidth());
    }

}


