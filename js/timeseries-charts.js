// Time Series Charts
// Phil Adams (http://philadams.net)
// Cornell Interaction Design Lab (http://idl.cornell.edu)
// Reusable elements built with D3 (http://d3js.org)
// Based on http://bost.ocks.org/mike/chart/

function timeSeriesLine() {
    var w = 800,
        h = 120,
        margin = {top: 20, right: 80, bottom: 30, left: 50},
        width = w - margin.left - margin.right,
        height = h - margin.top - margin.bottom;
    var xValue = function(d) { return d[0]; },
        yValue = function(d) { return d[1]; };
    var yDomain = null;
    var xScale = d3.time.scale()
        .range([0, width]);
    var yScale = d3.scale.linear()
        .rangeRound([height, 0]);
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .tickSubdivide(1)
        .tickSize(-height)
        .orient('bottom');
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .ticks(5)
        .orient('left');
    var line = d3.svg.line()
        .x(function(d) { return xScale(d[0]); })
        .y(function(d) { return yScale(d[1]); })
        .interpolate('linear');

    function chart(selection) {
        selection.each(function(data) {

            // convert data to standard representation
            data = data.map(function(d, i) {
                return [xValue.call(data, d, i), yValue.call(data, d, i)];
                //return d;
            });

            // scale the x and y domains based on the actual data
            xScale.domain(d3.extent(data, function(d) { return d[0]; }));
            if (!yDomain) {
                yScale.domain(d3.extent(data, function(d) { return d[1]; }));
            } else {
                yScale.domain(yDomain);
            }

            // create chart space as svg
            // note: 'this' el should not contain svg already
            var svg = d3.select(this).append('svg')
                .attr('class', 'timeserieschart')
                .data(data);

            // external dimensions
            svg.attr('width', w)
                .attr('height', h);

            // internal dimensions
            svg = svg.append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

            // x axis
            svg.append('g')
                .attr('class', 'x axis')
                .attr('transform', 'translate(0,' + height + ')')
                .call(xAxis);

            // y axis
            svg.append('g')
                .attr('class', 'y axis')
                .call(yAxis);

            // data path
            svg.append('path')
                .data(data)
                .attr('class', 'dataline')
                .attr('d', line(data));

        });
    }

    chart.x = function(_) {
        if (!arguments.length) return xValue;
        xValue = _;
        return chart;
    };

    chart.y = function(_) {
        if (!arguments.length) return yValue;
        yValue = _;
        return chart;
    };

    chart.yDomain = function(_) {
        if (!arguments.length) return yDomain;
        yDomain = _;
        return chart;
    };

    return chart;
}

function timeSeriesCategorical() {
    var w = 800,
        h = 70,
        margin = {top: 20, right: 80, bottom: 30, left: 50},
        width = w - margin.left - margin.right,
        height = h - margin.top - margin.bottom;
    var xValue = function(d) { return d[0]; },
        yValue = function(d) { return d[1]; };
    var yDomain = null;
    var yRange = d3.scale.category20().range();
    var xScale = d3.time.scale()
        .range([0, 642]);
    var yScale = d3.scale.category20();
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .tickSubdivide(1)
        .tickSize(-height)
        .orient('bottom');
    var binwidth = 20;

    function chart(selection) {
        selection.each(function(data) {

            // convert data to standard representation
            data = data.map(function(d, i) {
                return [xValue.call(data, d, i), yValue.call(data, d, i)];
            });

            // scale the x and y domains based on the actual data
            //xScale.domain(d3.extent(data, function(d) { return d[0]; }));
            // TODO fix this hack setting domain to full day
            if (data.length >= 1) {
                var td = data[0][0];
                dayStart = new Date(td.getFullYear(), td.getMonth(), td.getDate(),
                                    1, 00, 00, 000);
                dayEnd = new Date(td.getFullYear(), td.getMonth(), td.getDate(),
                                  23, 00, 00, 000);
                xScale.domain([dayStart, dayEnd]);
            } else {
                xScale.domain(d3.extent(data, function(d) { return d[0]; }));
            }
            if (!yDomain) {
                yScale.domain(d3.extent(data, function(d) { return d[1]; }));
            } else {
                yScale.domain(yDomain);
                yScale.range(yRange);
            }

            // compute binwidths for TODO better comment
            // d looks like {timestamp, category}
            data.forEach(function(d, i) {
                if (data[i+1]) {
                    w_current = xScale(data[i][0]);
                    w_next = xScale(data[i+1][0]);
                    binwidth = w_next - w_current;
                }
                d.binwidth = 2;//binwidth;
            });

            // create chart space as svg
            // note: 'this' el should not contain svg already
            var svg = d3.select(this).append('svg')
                .attr('class', 'timeserieschart')
                .data(data);

            // external dimensions
            svg.attr('width', w)
                .attr('height', h);

            // internal dimensions
            svg = svg.append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

            // x axis
            svg.append('g')
                .attr('class', 'x axis')
                .attr('transform', 'translate(0,' + height + ')')
                .call(xAxis);

            // bars
            var bars = svg.append('g');
            bars.selectAll('rect')
                .data(data)
              .enter().append('rect')
                .attr('x', function(d, i) { return xScale(d[0]); })
                .attr('width', function(d, i) { return d.binwidth; })
                .attr('height', height)
                .attr('fill', function(d, i) { return yScale(d[1]); })
                .attr('stroke', function(d, i) { return yScale(d[1]); });

            // bars legend
            var legendData = [];
            yDomain.forEach(function(d) {
                legendData.push([d, yScale(d)]);
            });
            var legend = svg.append('g')
                .attr('class', 'legend')
                .attr('height', 10)
                .attr('width', w)
                .attr('transform', 'translate(-30, -30)')
                .style('background', 'black');
            legend.selectAll('rect')
                .data(legendData)
              .enter().append('rect')
                .attr('x', function(d, i) { return i * 150; })
                .attr('y', 10)
                .attr('width', 10)
                .attr('height', 10)
                .style('fill', function(d) { return d[1]; });
            legend.selectAll('text')
                .data(legendData)
              .enter().append('text')
                .attr('x', function(d, i) { return i * 150 + 20; })
                .attr('y', 20)
                .text(function(d) { return d[0]; });

        });
    }

    chart.x = function(_) {
        if (!arguments.length) return xValue;
        xValue = _;
        return chart;
    };

    chart.y = function(_) {
        if (!arguments.length) return yValue;
        yValue = _;
        return chart;
    };

    chart.yDomain = function(_) {
        if (!arguments.length) return yDomain;
        yDomain = _;
        return chart;
    };

    chart.yRange = function(_) {
        if (!arguments.length) return yRange;
        yRange = _;
        console.log(yRange);
        return chart;
    };

    return chart;
}

function timeSeriesBar() {
    var w = 800,
        h = 120,
        margin = {top: 20, right: 80, bottom: 30, left: 50},
        width = w - margin.left - margin.right,
        height = h - margin.top - margin.bottom;
    var xValue = function(d) { return d[0]; },
        yValue = function(d) { return d[1]; };
    var yDomain = null;
    var xScale = d3.time.scale()
        .range([0, 642]);
    var yScale = d3.scale.linear()
        .rangeRound([height, 0])
        .clamp(true);
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .tickSubdivide(2)
        .tickSize(-height)
        .orient('bottom');
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .ticks(5)
        .orient('left');
    var binwidth = 10;

    function chart(selection) {
        selection.each(function(data) {

            // convert data to standard representation
            data = data.map(function(d, i) {
                return [xValue.call(data, d, i), yValue.call(data, d, i)];
            });

            // scale the x and y domains based on the actual data
            //xScale.domain(d3.extent(data, function(d) { return d[0]; }));
            // TODO: fix this hack (explicitly setting range to one day)
            if (data.length >= 1) {
                var td = data[0][0];
                dayStart = new Date(td.getFullYear(), td.getMonth(), td.getDate(),
                                    1, 00, 00, 000);
                dayEnd = new Date(td.getFullYear(), td.getMonth(), td.getDate(),
                                  23, 00, 00, 000);
                xScale.domain([dayStart, dayEnd]);
            } else {
                xScale.domain(d3.extent(data, function(d) { return d[0]; }));
            }
            if (!yDomain) {
                yScale.domain(d3.extent(data, function(d) { return d[1]; }));
            } else {
                yScale.domain(yDomain);
            }

            // create chart space as svg
            // note: 'this' el should not contain svg already
            var svg = d3.select(this).append('svg')
                .attr('class', 'timeserieschart')
                .data(data);

            // external dimensions
            svg.attr('width', w)
                .attr('height', h);

            // internal dimensions
            svg = svg.append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

            // x axis
            svg.append('g')
                .attr('class', 'x axis')
                .attr('transform', 'translate(0,' + height + ')')
                .call(xAxis);

            // y axis
            svg.append('g')
                .attr('class', 'y axis')
                .call(yAxis);

            // bars
            var bars = svg.append('g');
            bars.selectAll('rect')
                .data(data)
              .enter().append('rect')
                .attr('x', function(d, i) { return xScale(d[0]) - .5; })
                //.attr('y', function(d) { return height - yScale(d[1]) - .5; })
                .attr('y', function(d) { return yScale(d[1]) - .5; })
                //.attr('y', 10)
                .attr('width', binwidth)
                .attr('height', function(d) { return height - yScale(d[1]); })
                .attr('fill', 'steelblue')
                .attr('stroke', 'white');

        });
    }

    chart.x = function(_) {
        if (!arguments.length) return xValue;
        xValue = _;
        return chart;
    };

    chart.y = function(_) {
        if (!arguments.length) return yValue;
        yValue = _;
        return chart;
    };

    chart.yDomain = function(_) {
        if (!arguments.length) return yDomain;
        yDomain = _;
        return chart;
    };

    return chart;
}
