// jshint esversion: 6

import * as d3 from 'd3';
import 'd3-selection';
import 'd3-transition';
import 'd3-selection-multi';

import $ from 'jquery';
import 'datatables.net';

/*
 * David Ma - March 2018
 */
class Chart {
    opts    : any;
    element : string;
    data    : any;
    title   : string;
    xLabel  : string;
    yLabel  : string;
    width   : number;
    height  : number;
    margin  : {top : number, right: number, bottom: number, left: number};
    colours : Array<string>;
    innerHeight : number;
    innerWidth  : number;
    fullscreen  : boolean;

    svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
    plot: any;
    xScale: d3.ScaleLinear<number, number>;
    yBand: d3.ScaleBand<string>;

    // Sets variables
    constructor(opts) {

        // Set variables...
        this.opts = opts;
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
            .append("svg").attr(
                'viewBox', `0 0 ${this.width} ${this.height}`
            ).style(
                'background', "rgba(0,0,0,0.05)"
            );

        this.fullscreen = false;

        if(this.xLabel) {
            this.addxLabel();
        }

        if(this.yLabel) {
            this.addyLabel();
        }

        this.draw();
    }

    // Draws the plot and individual parts of the plot
    draw() {
        this.plot = this.svg.append('g')
            .classed("plot", true)
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

        // Add the background
        this.plot.append("rect")
            .attr('fill', 'white')
            .attr('x', 0)
            .attr('y', 0)
            .attr('height', this.innerHeight)
            .attr('width', this.innerWidth);
            // .attrs({
            //     fill: "white",
            //     x: 0,
            //     y: 0,
            //     height: this.innerHeight,
            //     width: this.innerWidth
            // });

        if ( this.opts.nav !== false ) {
            this.drawNav();
        }

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

        $(`#${this.element}`).dblclick(() => this.toggleFullscreen());
    }

    toggleFullscreen(chart?) {
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

    cumulativeLineChart() {
        console.log("Drawing cumulative chart", this.data);
        const svg       : any    = this.plot,
              data      : string = this.data[0],
              authors   : string = this.data[1],
              width     : number = this.innerWidth,
              height    : number = this.innerHeight;

        // set the ranges
        const x = d3.scaleTime().range([0, width]);
        const y = d3.scaleLinear().range([height, 0]);

        // define the line
        const valueline = d3.line()
            // .curve(d3.curveBasis)
            .x((d:any) => x(d.x))
            .y((d:any) => y(d.value));

        // Scale the range of the data
        x.domain(d3.extent(data, (d:any) => d.x ));
        y.domain([0, d3.max(data, (d:any) => d.value )]);

        //
        // Object.keys(samples).forEach(function(sample){
        //     sampleData[sample] = [];
        //     sampleData[sample] = Object.keys(samples[sample]).map(function(something){
        //
        //         return {
        //             rawDate: something,
        //             date: d3.timeMonth(parseTime(something)),
        //             value: samples[sample][something]
        //         };
        //     }).sort((a,b) => a.date - b.date);
        //
        // });

        // console.log("this is...", this);
        // var months = {};
        // var weeks = {};
        //
        // data.forEach(function(point){
        //     months[point.month] = months[point.month] || {
        //         rawDate: point.rawDate,
        //         value: 0
        //     };
        //     months[point.month].value += point.value;
        //
        //     weeks[point.week] = weeks[point.week] || {
        //         rawDate: point.rawDate,
        //         value: 0
        //     };
        //     weeks[point.week].value += point.value;
        // });

        // months = Object.keys(months).map(function(month){
        //     return {
        //         month: parseTime(months[month].rawDate),
        //         value: months[month].value
        //     };
        // });
        //
        // weeks = Object.keys(weeks).map(function(week){
        //     return {
        //         week: parseTime(weeks[week].rawDate),
        //         value: weeks[week].value
        //     };
        // });

console.log(data);
        // Add the valueline path.
        // this.plot.append("path")
        //     .data([data])
        //     .attr("class", "line")
        //     .attr("d", valueline);

        //
        // y.domain([0, d3.max(weeks, function(d) { return d.value; })]);
        // this.plot.append("path")
        //     .data([weeks])
        //     .attr("class", "line")
        //     .style("stroke", "red")
        //     .attr("d", valueline.x(function(d) { return x(d.week); }));

        // y.domain([0, d3.max(months, function(d) { return d.value; })]);
        // this.plot.append("path")
        //     .data([months])
        //     .attr("class", "line")
        //     .style("stroke", "black")
        //     .attr("d", valueline.x(function(d) { return x(d.month); }));


        // var that = this;

        // console.log("Here is our sample data", sampleData);
        var that = this;

        Object.keys(authors).forEach(function(author, i){

            var data = {};

            authors[author].forEach(function(commit){
                data[commit.x] = data[commit.x] || {
                    date: commit.x,
                    value: 0
                };
                data[commit.x].value++;
                // data[commit.x].value += commit.value;
            });
            console.log(data);

            data = Object.keys(data).map(function(date){
                return {
                    date: data[date].date,
                    value: data[date].value
                };
            });

            that.plot.append("path")
                .data([data])
                .attr("class", "line")
                .style("stroke", that.colours[i])
                .attr("d", valueline.x(function(d:any) { return x(d.date); }));
        });

        this.plot.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));

        // Add the Y Axis
        this.plot.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y));

    }

    lineChart() {
        console.log("Drawing line chart", this.data);

        var all = {};

        var samples = {};

        this.data.forEach(function(sample){
            // console.log(`First pass of: ${sample}`)
            var sampleName = sample.name;
            samples[sampleName] = {};

            sample.values.forEach(function(d){
                all[d] = all[d] || 0;
                all[d]++;

                samples[sampleName][d] = samples[sampleName][d] || 0;
                samples[sampleName][d]++;
            });
        });

        var parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");

        console.log("here is all", all);
        console.log("count", Object.keys(all).length);
        var data = Object.keys(all).map(function(date){
            var parsedDate = parseTime(date);
            return {
                rawDate: date,
                date: parsedDate,
                week: d3.timeWeek(parsedDate),
                month: d3.timeMonth(parsedDate),
                value: all[date]
            };
        });

        console.log(samples);
        var sampleData = {};

        Object.keys(samples).forEach(function(sample){

            sampleData[sample] = [];

            sampleData[sample] = Object.keys(samples[sample]).map(function(something){

                return {
                    rawDate: something,
                    date: d3.timeMonth(parseTime(something)),
                    value: samples[sample][something]
                };
            }).sort((a,b) => (a.date as any) - (b.date as any));

        });

        console.log(sampleData);

        data = data.sort((a,b) => (a.date as any) - (b.date as any));

        // set the ranges
        var x = d3.scaleTime().range([0, this.innerWidth]);
        var y = d3.scaleLinear().range([this.innerHeight, 0]);

        // define the line
        var valueline = d3.line()
            // .curve(d3.curveBasis)
            .x(function(d:any) { return x(d.date); })
            .y(function(d:any) { return y(d.value); });

        // Scale the range of the data
        x.domain(d3.extent(data, function(d) { return d.date; }));
        y.domain([0, d3.max(data, function(d) { return d.value; })]);

        console.log("Date extent...",d3.extent(data, function(d) { return d.date; }));

        console.log("this is...", this);
        var monthSet  : any = {};
        var weeks   : any = {};

        data.forEach(function(point:any){
            monthSet[point.month] = monthSet[point.month] || {
                rawDate: point.rawDate,
                value: 0
            };
            monthSet[point.month].value += point.value;

            weeks[point.week] = weeks[point.week] || {
                rawDate: point.rawDate,
                value: 0
            };
            weeks[point.week].value += point.value;
        });

        var months:Array<any> = Object.keys(monthSet).map(function(month){
            return {
                month: parseTime(monthSet[month].rawDate),
                value: monthSet[month].value
            };
        });

        weeks = Object.keys(weeks).map(function(week){
            return {
                week: parseTime(weeks[week].rawDate),
                value: weeks[week].value
            };
        });

        // Add the valueline path.
        // this.plot.append("path")
        //     .data([data])
        //     .attr("class", "line")
        //     .attr("d", valueline);
        //
        // y.domain([0, d3.max(weeks, function(d) { return d.value; })]);
        // this.plot.append("path")
        //     .data([weeks])
        //     .attr("class", "line")
        //     .style("stroke", "red")
        //     .attr("d", valueline.x(function(d) { return x(d.week); }));

        y.domain([0, d3.max(months, function(d:any) { return d.value; })]);
        this.plot.append("path")
            .data([months])
            .attr("class", "line")
            .style("stroke", "black")
            .attr("d", valueline.x(function(d:any) { return x(d.month); }));


        var that = this;

        console.log("Here is our sample data", sampleData);

        Object.keys(sampleData).forEach(function(sample, i){
            console.log("doing sample...", sample);
            var data = {};

            sampleData[sample].forEach(function(point){
                data[point.date] = data[point.date] || {
                    rawDate: point.rawDate,
                    value: 0
                };
                data[point.date].value += point.value;
            });
            console.log(data);

            data = Object.keys(data).map(function(date){
                return {
                    date: parseTime(data[date].rawDate),
                    value: data[date].value
                };
            });

            that.plot.append("path")
                .data([data])
                .attr("class", "line")
                .style("stroke", that.colours[i])
                .attr("d", valueline.x(function(d:any) { return x(d.date); }));
        });

        this.plot.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + this.innerHeight + ")")
            .call(d3.axisBottom(x));

        // Add the Y Axis
        this.plot.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y));

    }



    /*
     *
     */
    barGraph() {
        console.log("Drawing bar graph", this.data);

        var values:Array<any> = [];
        this.data.forEach(function(bar){
            values = values.concat(bar.values);
        });


        // Call the necessary functions
        this.createScales(values);
        this.addAxes();
        this.addChart();

        return this;
    }

    createScales( values:Array<any> ) {
        console.log("values for scales", values);

        // We set the domain to zero to make sure our bars
        // always start at zero. We don't want to truncate.
        this.xScale = d3.scaleLinear()
            .domain([0, parseInt(d3.max(values)) * 1.1])
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
        const xAxis = d3.axisBottom(this.xScale)
            .scale(this.xScale);

        const yAxis = d3.axisLeft(this.yBand)
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

    }

    addxLabel() {
        let x = this.margin.left + (this.innerWidth / 2),
            y = this.height - 5;

        this.svg.append("g")
            .attr(
                'transform', `translate(${x},${y})`
            ).style(
                "text-anchor","middle"
            ).append("text")
            .text(this.xLabel);
    }

    addyLabel() {
        let x = 5,
            y = this.margin.top + (this.innerHeight / 2);

        this.svg.append("g")
            .attr('transform', `matrix(0,1,-1,0,${x},${y})`)
            .style("text-anchor", "middle")
            .append("text")
            .text(this.yLabel);
    }

    addChart() {
        var that = this;

        var legend = that.plot.append("g")
            .classed("legend", true)
            .attr("transform", `translate(${this.innerWidth - 270},0)`);

        legend.append("rect")
            .attr('height', '100px')
            .attr('width', '270px')
            .attr('fill', 'white')
            .attr('stroke', 'grey');
        // .attrs({
        //     height: "100px",
        //     width: "270px",
        //     fill: "white",
        //     stroke: "grey"
        // });

        legend.append("text")
            .attr("transform", `translate(100,24)`)
            .style("text-anchor", "middle")
            .style("font-size", "24px")
            .text("Legend");

        this.data[0].labels.forEach(function(label, i){
            legend.append("rect")
                .attr('x', 20)
                .attr('y', 38 + (30*i))
                .attr('width', 15)
                .attr('height', 15)
                .attr('fill', that.colours[i]);
            
            // .attrs({
            //     x: 20,
            //     y: 38 + 30 * i,
            //     width: 15,
            //     height: 15,
            //     fill: that.colours[i]
            // });

            legend.append("text")
                .text(label)
                .attr('x', 40)
                .attr('y', 50 + (30*i));

            legend.append("text")
                .classed(`legend-label legend-label-${i}`, true)
                .text("")
                .attr('x', 100)
                .attr('y', 50 + (30 * i));

        });


        this.plot.selectAll(".bar")
            .data(this.data)
            .enter()
            .append("g").classed("bar", true)
            .each(function(d){
                let bar = d3.select(this);

                // bar.on('mouseover', function(d){
                //         d.values.forEach(function(data, i){
                //             legend.select(`.legend-label-${i}`)
                //                 .text(data);
                //         });
                //     }).on('mouseout', function(d){
                //         legend.selectAll(`.legend-label`).text("");
                //     });

                d.values.forEach(function(data, i){
                    let text = `${d.values[i]} m\u00B2`;
                    bar.append("rect")
                        .attr('data-toggle', 'tooltip')
                        .attr('data-placement', 'top')
                        .attr('title', text)
                        .attr('fill', that.colours[i])
                        .attr('x', that.xScale(d.values[i-1]) || 0)
                        .attr('y', that.yBand(d.name))
                        .attr('width', that.xScale(d.values[i]))
                        .attr('height',that.yBand.bandwidth());

                    bar.append("text")
                        .attr('x', (that.xScale(d.values[i])) + 3)
                        .attr('y', (that.yBand(d.name) + (that.yBand.bandwidth() / 2)) + 3)
                        .text(text);
                });
            });


        // Um. This is a dumb typescript error workaround. Please import "tooltip" type definition.
        var blah:any = $(".bar rect");
        blah.tooltip();

    }

    circle() {
        let width = this.innerWidth,
            height = this.innerHeight,
            svg = this.plot;

        console.log("Drawing a circle...", this.data);
        // console.log(this.data);



        const x = this.innerWidth * 2 / 3,
              y = this.innerHeight / 2,
              radius = y * 0.9;

        const ratio = radius / Math.sqrt(173);
        const blockHeight = radius / 10;

        svg.append("g").selectAll('circle')
            .data(this.data)
            .enter()
            .append("circle")
            .attr('id',  (d) => `circle-${camelize(d.name)}`)
            .attr('stroke',  "black")
            .attr('fill',  "rgba(0,0,0,0.05)")
            .attr('cx',  x)
            .attr('cy',  (d) => y + radius - ratio * Math.sqrt(d.values[0]))
            .attr('r',  (d) => ratio * Math.sqrt(d.values[0]));

        let table = svg.append("g")
            .attr("transform", `translate(${this.innerHeight * 0.05} ${this.innerHeight * 0.05})`);

        table.append('rect')
            .attr('x',  0)
            .attr('y',  0)
            .attr('height',  radius * 2)
            .attr('width',  200)
            .attr('fill',  'lightgrey')
            .attr('stroke',  'black');

        table.selectAll(".row")
            .data(this.data)
            .enter()
            .append("g")
            .attr("transform", (d, i) => `translate(0, ${i * blockHeight})`)
            .each(function(d, i){
                // console.log(d);
                const row = d3.select(this);

                row.on("mouseover", function(){
                    // console.log("hello!");
                    d3.select(`#circle-${camelize(d.name)}`)
                        .attr("fill", d3.schemeCategory10[i % 10]);
                }).on("mouseout", function(){
                    // console.log("hello!");
                    d3.select(`#circle-${camelize(d.name)}`)
                        .attr("fill", "rgba(0,0,0,0.05)");
                });

                row.append("rect")
                    .attr('width',  200)
                    .attr('height',  blockHeight)
                    .attr('stroke',  'black')
                    .attr('fill',  d3.schemeCategory10[i % 10]);

                row.append("text")
                    .text(d.name)
                    .attr('x',  10)
                    .attr('y',  15);

                row.append("text")
                    .text(`${d.values[0]} m\u00B2`)
                    .attr('x',  190)
                    .attr('y',  15)
                    .style('text-anchor',  "end")

                // console.log("doing stuff...", d);

            });

        return this;
    }

    squares() {
        let width = this.innerWidth,
            height = this.innerHeight,
            svg = this.plot;

        console.log("Drawing squares...", this.data);

        const x = width * 1 / 3,
              y = height * 0.95,
              edge = height * 0.9;

        const ratio = edge / Math.sqrt(173);
        const blockHeight = edge / 20;

        svg.append("g").selectAll('circle')
            .data(this.data)
            .enter()
            .append("rect")
            .attr('id', (d) => `square-${camelize(d.name)}`)
            .attr('stroke', "black")
            .attr('fill', "rgba(0,0,0,0.05)")
            .attr('x', x)
            .attr('y', (d) => y - ( ratio * Math.sqrt(d.values[0])))
            .attr('height', (d) => ratio * Math.sqrt(d.values[0]))
            .attr('width', (d) => ratio * Math.sqrt(d.values[0]));

        let table = svg.append("g")
            .attr("transform", `translate(${this.innerHeight * 0.05} ${this.innerHeight * 0.05})`);

        table.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('height', edge)
            .attr('width', 200)
            .attr('fill', 'lightgrey')
            .attr('stroke', 'black')

        table.selectAll(".row")
            .data(this.data)
            .enter()
            .append("g")
            .attr("transform", (d, i) => `translate(0, ${i * blockHeight})`)
            .each(function(d, i){
                // console.log(d);
                const row = d3.select(this);

                row.on("mouseover", function(){
                    // console.log("hello!");
                    d3.select(`#square-${camelize(d.name)}`)
                        .attr("fill", d3.schemeCategory10[i % 10]);
                }).on("mouseout", function(){
                    // console.log("hello!");
                    d3.select(`#square-${camelize(d.name)}`)
                        .attr("fill", "rgba(0,0,0,0.05)");
                });

                row.append("rect")
                    .attr('width', 200)
                    .attr('height', blockHeight)
                    .attr('stroke', 'black')
                    .attr('fill', d3.schemeCategory10[i % 10]);

                row.append("text")
                    .text(d.name)
                    .attr('x', 10)
                    .attr('y', 15);

                row.append("text")
                    .text(`${d.values[0]} m\u00B2`)
                    .attr('x', 190)
                    .attr('y', 15)
                    .style('text-anchor', 'end');

                // console.log("doing stuff...", d);

            });
        // .append("rect")
        // .attrs({
        //     id: (d) => `table-${camelize(d.name)}`
        //
        //
        //
        //     // stroke: "black",
        //     // fill: "rgba(0,0,0,0.05)",
        //     // cx: x,
        //     // cy: (d) => y + radius - ratio * d.values[0],
        //     // r: (d) => ratio * d.values[0]
        // });

        //
        // svg.append("circle")
        //     .attrs({
        //         fill: 'red',
        //         cx: x,
        //         cy: y,
        //         r: (d) => 5
        //     });




        return this;
    }

    treemap() {
        let width = this.innerWidth,
            height = this.innerHeight,
            // margin = this.margin,
            // data = this.data,
            svg = this.plot;

        let fader = function(color) { return d3.interpolateRgb(color, "#fff")(0.2); },
            color = d3.scaleOrdinal(d3.schemeCategory10.map(fader)),
            format = d3.format(",d");

        console.log("this data is....", this.data);

        let data = {
            "name": "cluster",
            "children": this.data.map(function (d) {
                return {
                    name: d.name,
                    size: parseInt(d.values[0]),
                    blob: d.blob
                };
            })
        };

        var treemap = d3.treemap()
            .tile(d3.treemapResquarify)
            .size([width, height])
            .round(true)
            .paddingInner(1);


        var root = d3.hierarchy(data)
            .eachBefore(function(d:any) { d.data.id = (d.parent ? d.parent.data.id + "." : "") + camelize(d.data.name); })
            .sum(sumBySize)
            .sort(function(a, b) { return b.height - a.height || b.value - a.value; });

        treemap(root);

        console.log("Root leaves are..?", root.leaves());

        var cell = svg.selectAll("g")
            .data(root.leaves())
            .enter().append("g")
            .attr("transform", function(d) { return "translate(" + d.x0 + "," + d.y0 + ")"; });

        cell.append("rect")
            .attr("id", (d) => `rect-${d.data.id}` )
            .attr("width", (d) => d.x1 - d.x0)
            .attr("height", (d) => d.y1 - d.y0)
            .attr("fill", function(d) { return color(d.parent.data.id); });

        cell.append("image")
            .attr("id", (d) => `image-${d.data.id}` )
            .attr('x', 3)
            .attr('y', 3)
            // .attr("width", (d) => Math.max(d.x1 - d.x0, d.y1 - d.y0))
            // .attr("height", (d) => Math.max(d.x1 - d.x0, d.y1 - d.y0))
            .attr("width", (d) => d.x1 - d.x0 - 6)
            .attr("height", (d) => d.y1 - d.y0 - 6)
            .attr("preserveAspectRatio", "xMidYMid slice")
            // .attr("meetOrSlice", "meet")
            .attr("xlink:href", (d) => `/data/mm/2018-05-28/photos/${d.data.blob.photo}`);
            // .attr("fill", function(d) { return color(d.parent.data.id); });


        cell.append("clipPath")
            .attr("id", function(d) { return "clip-" + d.data.id; })
            .append("use")
            .attr("xlink:href", function(d) { return "#" + d.data.id; });

        cell.append("text")
            .attr("clip-path", function(d) { return "url(#clip-" + d.data.id + ")"; })
            .selectAll("tspan")
            .data(function(d) { return d.data.name.split(/(?=[A-Z][^A-Z])/g); })
            .enter().append("tspan")
            .attr("x", 4)
            .attr("y", function(d, i) { return 13 + i * 10; })
            .text(function(d) { return d; });

        cell.append("title")
            .text(function(d) { return d.data.id + "\n" + format(d.value); });

        d3.selectAll("input")
            .data([sumBySize, sumByCount], function(d:any) { return d.name })
        // .data([sumBySize, sumByCount], function(d) { return d ? d.name : this.value; })
            .on("change", changed);

        var timeout = d3.timeout(function() {
            d3.select("input[value=\"sumByCount\"]")
                .property("checked", true)
                .dispatch("change");
        }, 2000);

        function changed(sum) {
            timeout.stop();

            treemap(root.sum(sum));

            cell.transition()
                .duration(750)
                .attr("transform", function(d) { return "translate(" + d.x0 + "," + d.y0 + ")"; })
                .select("rect")
                .attr("width", function(d) { return d.x1 - d.x0; })
                .attr("height", function(d) { return d.y1 - d.y0; });
        }

    }

    scratchpad(callback){
        callback(this);
    }

    venn(options) {
        const svg = this.plot,
              data = this.data,
              width = this.innerWidth,
              height = this.innerHeight;

        const radius = height * 0.4,
              midpoint = height * 0.45;

        const leftCenter = width/3,
            rightCenter = leftCenter * 2;

        svg.classed("vennDiagram", true);


        // // colours
        // const c = [
        //     [
        //         "hsl(0, 100%, 60%)",
        //         "hsl(0, 100%, 70%)"
        //     ],
        //     [
        //         "hsl(300, 66%, 40%)",
        //         "hsl(300, 66%, 50%)"
        //     ],
        //     [
        //         "hsl(220, 100%, 60%)",
        //         "hsl(220, 100%, 70%)"
        //     ]
        // ];


        const left = svg
            .append("g")
            .classed("left", true)
            .classed("activeShape", true);

        left.append("circle")
            .attr('cx', leftCenter)
            .attr('cy', midpoint)
            .attr('r', radius);

        const right = svg
            .append("g")
            .classed("right", true)
            .classed("activeShape", true);

        right.append("circle")
            .attr('cx', rightCenter)
            .attr('cy', midpoint)
            .attr('r', radius);

        const arcx = width/2,
              dx = arcx - leftCenter,
              dy = Math.sqrt( radius * radius - dx * dx ),
              arcy1 = midpoint - dy,
              arcy2 = midpoint + dy;

        const mid = svg
            .append("g")
            .classed("mid", true)
            .classed("activeShape", true);

        mid.append("path")
            .attr("d",
                `M ${arcx} ${arcy1}
                 A ${radius} ${radius}, 0, 0, 0, ${arcx} ${arcy2}
                 A ${radius} ${radius}, 0, 0, 0, ${arcx} ${arcy1}`
            );

        $(".activeShape")
            .addClass("selected")
            .on("click", function(d){
                const el = $(this);
                el.toggleClass("selected");

                if (el.hasClass("left")) el.on("click", options.leftAction);
                if (el.hasClass("mid")) el.on("click", options.midAction);
                if (el.hasClass("right")) el.on("click", options.rightAction);

            });


        svg.append("text")
            .text(options.left)
            .attr('x', leftCenter)
            .attr('y', height * 0.9)
            .style('text-anchor', 'middle')
            .style('font-size', '24px');

        svg.append("text")
            .text(options.right)
            .attr('x', rightCenter)
            .attr('y', height * 0.9)
            .style('text-anchor', 'middle')
            .style('font-size', '24px');

        const results = {
            left: [],
            both: [],
            right: []
        };

        Object.keys(data).forEach(function (key) {
            if(data[key][options.rightKey]) {
                if(data[key].hash) {
                    results.both.push(data[key]);
                } else {
                    results.right.push(data[key]);
                }
            } else {
                if(data[key][options.leftKey]) {
                    results.left.push(data[key]);
                } else {
                    console.error(data[key]);
                    alert("What the hell, this isn't possible");
                }
            }
        });

        left.append("text")
            .text(results.left.length)
            .attr('x', leftCenter - 30)
            .attr('y', midpoint)
            .style('text-anchor', 'middle')
            .style('font-size', '36px');

        mid.append("text")
            .text(results.both.length)
            .attr('x', width/2)
            .attr('y', midpoint)
            .style('text-anchor', 'middle')
            .style('font-size', '36px');


        right.append("text")
            .text(results.right.length)
            .attr('x', rightCenter + 30)
            .attr('y', midpoint)
            .style('text-anchor', 'middle')
            .style('font-size', '36px');

        console.log(results);

    }

}




// I'm dumping utility functions here...
// These are probably available from underscore or jquery or whatever

function sumByCount(d) {
    return d.children ? 0 : 1;
}

function sumBySize(d) {
    return d.size;
}

function average( array:Array<any> ) {
    try {
        return array.reduce((a, b) => parseFloat(a) + parseFloat(b)) / array.length;
    } catch (e) {
        console.error(e);
        return null;
    }
}

function camelize(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
        if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
        return index == 0 ? match.toLowerCase() : match.toUpperCase();
    });
}

function injectStyles(rule) {
    var div = $("<div />", {
        html: '&shy;<style>' + rule + '</style>'
    }).appendTo("body");
}

function log(message){
    "use strict";
    message = message ? ` - ${message}` : "";
    const   formatTime = d3.timeFormat("%H:%M:%S"),
            date = new Date();
    // console.info(`${formatTime(date)}${message}`);
}


function decorateTable(dataset:any, newOptions?:any) {
    const element = newOptions ? newOptions.element : "#dataset table";

    var options: DataTables.Settings = {
        info: false,
        paging: false,
        search: false,
        searching: false,
        data: dataset,
        pageLength: 25,
        order: [[0, 'desc']],
        columns: dataset.columns.map(function(d){ return {
            title: d,
            data: d
        };})
    };
    if (newOptions) {
        Object.keys(newOptions).forEach(function(key) {
            options[key] = newOptions[key];
        });
        if(newOptions.titles) {
            newOptions.titles.forEach((d,i) => options.columns[i].title = d );
        }
        if(newOptions.render) {
            options.columns.forEach((d) => d.render = newOptions.render );
        }
    }
    $(element).DataTable(options);
}



export { Chart, decorateTable };

