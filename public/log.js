var myapp = angular.module('myapp', ['ui', 'ui.bootstrap', 'ui.sortable']);

var TaskCtrl = function($scope, $http) {


    function reloadTickets(){
        $http.get("/logs/?status=done").success(function(data){
            $scope.ticketList = data;
            updateCalendar(data);
        });
    }

    //ready
    reloadTickets();

    // --------------------------------
    // Calender View Start
    // --------------------------------

    var width = 700,
        height = 90,
        cellSize = 12; // cell size

    var day = d3.time.format("%w"),
        week = d3.time.format("%U"),
        format = d3.time.format("%Y-%m-%d");

    var color = d3.scale.quantize()
        .domain([10, 0])
        .range(d3.range(11).map(function(d) { return "q" + d + "-11"; }));

    var thisYear = new Date().getFullYear();
    var svg = d3.select("#calendar").selectAll("svg")
        .data([thisYear])
        .enter().append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "RdYlGn")
        .append("g")
        .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");

    svg.append("text")
        .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
        .style("text-anchor", "middle")
        .text(function(d) { return d; });

    var rect = svg.selectAll(".calender-day")
        .data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
        .enter().append("rect")
        .attr("class", "calender-day")
        .attr("width", cellSize)
        .attr("height", cellSize)
        .attr("x", function(d) { return week(d) * cellSize; })
        .attr("y", function(d) { return day(d) * cellSize; })
        .datum(format);

    rect.append("title")
        .text(function(d) { return d; });

    svg.selectAll(".calender-month")
        .data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
        .enter().append("path")
        .attr("class", "calender-month")
        .attr("d", monthPath);

    function updateCalendar(ticketList){
        console.log(ticketList);
        var data = {};

        ticketList.forEach(function(item){
            var createdAt = format(new Date(item.createdAt));
            data[createdAt] = data[createdAt] ? data[createdAt]+1 : 1;
        });

        rect.filter(function(d) { return d in data; })
            .attr("class", function(d) { return "calender-day " + color(data[d]); })
            .select("title")
            .text(function(d) { return d + ": " + data[d] + " contributes"; });
    }


    function monthPath(t0) {
        var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
            d0 = +day(t0), w0 = +week(t0),
            d1 = +day(t1), w1 = +week(t1);
        return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
            + "H" + w0 * cellSize + "V" + 7 * cellSize
            + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
            + "H" + (w1 + 1) * cellSize + "V" + 0
            + "H" + (w0 + 1) * cellSize + "Z";
    }
    // --------------------------------
    // Calender View End
    // --------------------------------


};
myapp.controller('controller', TaskCtrl);
