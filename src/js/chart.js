// jshint esversion: 6

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
        this.xLabel = opts.xLabel || "";
        this.yLabel = opts.yLabel || "";

        this.width  = opts.width || 960;
        this.height = opts.height || 600;
        this.margin = opts.margin || { top: 70, right: 70, bottom: 50, left: 70 };

        // Default colours from ColorBrewer 2.0
        // http://colorbrewer2.org/?type=qualitative&scheme=Dark2&n=8
        this.colours = opts.colours || ['#1b9e77','#d95f02','#7570b3','#e7298a','#66a61e','#e6ab02','#a6761d','#666666'];

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
            .classed("plot", true)
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
            shrink();
        } else {
            grow();
        }

        function keydownHandler(e) {
            if(e && e.keyCode && e.keyCode == 27) {
                shrink();
            }
        }

        function shrink() {
            console.log("Already fullscreen, minimise!");
            chart.fullscreen = false;

            $(`#big-chart svg`).detach().appendTo(`#${chart.element}`);
            $(`#big-chart`).remove();
            $("body").off("keydown.chart", keydownHandler);
        }

        function grow() {
            console.log("Let's make it BIG!");
            chart.fullscreen = true;

            $("<div id='big-chart' class='chart'></div>").insertBefore("body header");
            $(`#${chart.element} svg`).detach().appendTo("#big-chart");

            $("body").on("keydown.chart", keydownHandler);
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
                .tickSize(-this.innerHeight)
            );

        // Add y-axis ticks
        this.plot.append("g")
            .attr("class", "y axis")
            .attr("transform", 'translate(0, 0)')
            .call(yAxis);


        // Add axis labels
        if(this.xLabel) {
            let x = this.margin.left + (this.innerWidth / 2),
                y = this.height - 5;

            this.svg.append("g")
                .attrs({
                    transform: `translate(${x},${y})`
                }).styles({
                    "text-anchor": "middle"
                }).append("text")
                .text(this.xLabel);
        }

        if(this.yLabel) {
            let x = 5,
                y = this.margin.top + (this.innerHeight / 2);

            this.svg.append("g")
                .attrs({
                    transform: `matrix(0,1,-1,0,${x},${y})`
                }).styles({
                "text-anchor": "middle"
            }).append("text")
                .text(this.yLabel);
        }

    }

    addChart() {
        var that = this;

        var legend = that.plot.append("g")
            .classed("legend", true)
            .attr("transform", `translate(${this.innerWidth - 200},0)`);

        legend.append("rect").attrs({
            height: "100px",
            width: "200px",
            fill: "white",
            stroke: "grey"
        });

        legend.append("text")
            .attr("transform", `translate(100,24)`)
            .style("text-anchor", "middle")
            .style("font-size", "24px")
            .text("Legend");

        this.data[0].labels.forEach(function(label, i){
            legend.append("rect").attrs({
                    x: 20,
                    y: 38 + 30 * i,
                    width: 15,
                    height: 15,
                    fill: that.colours[i]
                });

            legend.append("text")
                .text(label)
                .attrs({
                    x: 40,
                    y: 50 + 30 * i
                });

            legend.append("text")
                .classed(`legend-label legend-label-${i}`, true)
                .text("")
                .attrs({
                    x: 100,
                    y: 50 + 30 * i
                });
        });


        this.plot.selectAll(".bar")
            .data(this.data)
            .enter()
            .append("g").classed("bar", true)
            .each(function(d){
                var bar = d3.select(this);

                bar.on('mouseover', function(d){
                        d.values.forEach(function(data, i){
                            legend.select(`.legend-label-${i}`)
                                .text(data);
                        });
                    }).on('mouseout', function(d){
                        legend.selectAll(`.legend-label`).text("");
                    });

                d.values.forEach(function(data, i){
                    bar.append("rect")
                        .attrs({
                            fill: that.colours[i],
                            x: that.xScale(d.values[i-1]) || 0,
                            y: that.yBand(d.name),
                            width: that.xScale(d.values[i]),
                            height: that.yBand.bandwidth()
                        });
                });
            });
    }

}














