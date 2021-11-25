// Creates variables for the current day and a variable containing current day minus 30 days.
var timeNow = new Date().toISOString().substr(0, 10);
var changeTime = new Date();
changeTime.setDate(changeTime.getDate()-30);

var coin = "BTC-EUR";

// Change the search results to 30, 60 or 180 days back from current date
function changeDates(selectObject){
    var value = selectObject.value;
    var changeTime = new Date();
    changeTime.setDate(changeTime.getDate()-value);
   
    console.log(changeTime)
}
// Change currency
function changeCoin(selectObject){
    var value = selectObject.value;
    coin = value;
}

//Json API request with custom variables for the time period and for BTC or ETHERUM
function getRates(){
d3.json("https://api.pro.coinbase.com/products/" + coin + "/candles?start=" + changeTime.toISOString().substr(0, 10) + "&end=" + timeNow + "&granularity=86400")
    .then(function(d) {
        createChart(d);
});
}
function createChart(rawData) {

    var chartData = [];
    var chartDataLow = [];
    var chartDataHigh = [];
    var chartDataOpen = [];
    var chartDataClose = [];
    var chartDataVolume = [];
    var time = [];
    
    
    for (let i = 0; i < rawData.length; i++) {
        chartData.push(rawData[i].slice(1));
        
        // Converts epoch-time
        var tiden = new Date(0);
        tiden.setUTCSeconds(rawData[i][0]);
        var nyTid = tiden.getDate() + "/" + (tiden.getMonth() + 1);
        time.push(nyTid);
    }

    for (let j = 0; j < chartData.length; j++) {
        chartDataLow.push(chartData[j][0]);
        chartDataHigh.push(chartData[j][1]);
        chartDataOpen.push(chartData[j][2]);
        chartDataClose.push(chartData[j][3]);
        chartDataVolume.push(chartData[j][4]);
    }
    
    var leftMargin = 45;
    var bottomMargin = 20;
    var width = 1200;
    var height = 500;

    var chart = d3.select("#chart")
        .append("svg")
            .attr("height", height)
            .attr("width", width)
            .style("background", "#ddeeff")
    // Creates a scale between the minimum and maximum values of selected currency
    var yGuideScale = d3.scaleLinear()
        .domain([d3.min(chartDataLow) * 0.95, d3.max(chartDataHigh) * 1.05])
        .range([height, 0]);

    var y = d3.scaleLinear()
        .domain([d3.min(chartDataLow) * 0.95, d3.max(chartDataHigh) * 1.05])
        .range([0, -height]);

    var yTicks = d3.axisLeft(yGuideScale)
        .ticks(20);

    var xGuideScale = d3.scaleTime()
        .domain([new Date(changeTime), new Date(timeNow)])
        .range([0, width-leftMargin]);
    
    var xTicks = d3.axisBottom(xGuideScale)
        .ticks(30);

    // Creates a g element inside the svg element and adds the y axis to it by calling the axisLeft function
    d3.select("#chart svg").append("g")
                .attr("transform", "translate("+leftMargin+",0)")
                .call(yTicks)
    
    d3.select("#chart svg").append("g")
                .attr("class", "lineG")
                .attr("transform", "translate("+leftMargin+","+(height-bottomMargin)+")")
                .call(xTicks)

    d3.select(".lineG").selectAll("g")
                    .data(chartDataLow)
                    .enter().selectAll("g")
                    // Using each() to call the specific function for each selected HTML element
                    .each(function(d,i) {
                        d3.select(this).selectAll("g")
                                .data([d])
                                .enter()
                    .append("line")
                            .attr("y1", function() {
                                return y(chartDataLow[i]) + bottomMargin;
                            })
                            .attr("y2", function() {
                                return y(chartDataHigh[i]) + bottomMargin;
                            })
                            .style("stroke", "black")
                        })
                        
    d3.select(".lineG").selectAll("g")
                        .data(chartDataClose)
                        .enter().selectAll("g")
                        .each(function(d,i) {
                            d3.select(this).selectAll("g")
                                    .data([d])
                                    .enter()
                        .append("line")
                                .attr("y1", function() {
                                    // If the closing price is less than the opening price, each opening price is returned as position y1
                                    if(chartDataClose[i] < chartDataOpen[i]){
                                        return y(chartDataOpen[i]) + bottomMargin;
                                    } else {
                                        return y(chartDataClose[i]) + bottomMargin;
                                    }
                                })
                                .attr("y2", function() {
                                    if(chartDataClose[i] > chartDataOpen[i]){
                                        return y(chartDataOpen[i]) + bottomMargin;
                                    } else {
                                        return y(chartDataClose[i]) + bottomMargin;
                                    }
                                })
                                .attr("stroke-width", 10)
                                .style("stroke", d => chartDataOpen[i] > chartDataClose[i] ? d3.schemeSet1[0]
                                : chartDataClose[i] > chartDataOpen[i] ? d3.schemeSet1[2]
                                : d3.schemeSet1[8])
                                .attr("class", "tooltip")
                                .attr("data-toggle","popover")
                                .attr("title", "Open: " + chartDataOpen[i] + "\nHigh: " + chartDataHigh[i] + "\nLow: " + chartDataLow[i] + "\nClose: " + chartDataClose[i])
                                .attr("data-content","Some content inside the popover")
                                .attr("data-placement","top")
                            })
                            $(document).ready(function(){
                                $('line[data-toggle="popover"]').tooltip()  
                            });
}
