


// From Rob Crocker's simple bar chart
// https://github.com/david-ma/a_simple_bar_chart/blob/master/chart.js
class Chart {
    constructor(opts) {

        this.element = opts.element;
        this.data = opts.data || [];
        this.title = opts.title || "";
        this.subtitle = opts.subtitle || "";

        this.width  = opts.width || 960;
        this.height = opts.height || 600;
        this.margin = opts.margin || { top: 70, right: 20, bottom: 50, left: 225 };

        this.svg = d3.select(opts.element).append("svg");

        this.draw();
    }

    draw() {

        // Create the parent SVG


        // Give your title and axes some space
        this.innerHeight = this.height - (this.margin.top + this.margin.bottom);
        this.innerWidth = this.width - (this.margin.right + this.margin.left);

        const svg = this.svg.attrs({
            viewBox: `0 0 ${this.width} ${this.height}`
        }).styles({
            background: "red"
        });

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


