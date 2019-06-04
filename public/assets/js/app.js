var svgwidth = 960;
var svgheight = 500;

var margin = {
    top : 20,
    right : 40,
    bottom :80,
    left: 100
};

var width = svgwidth - margin.left - margin.right;
var height = svgheight - margin.top - margin.bottom;

var svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", svgwidth)
    .attr("height", svgheight);


var chartgroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

var chosenxaxis = "poverty";

function xScale(data, chosenxaxis){
    var xlinearscale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenxaxis])*0.8,
            d3.max(data, d=> d[chosenxaxis]) * 1.2
        ])
        .range([0,width]);

    return xlinearscale;
}


function renderAxes(newxscale, xaxis){
        var bottomaxis = d3.axisBottom(newxscale);

        xaxis.transition()
            .duration(1000)
            .call(bottomaxis);
        return xaxis;
    }

    // function for updating circles group with a transition to new circle.

function renderCircles(circlesgroup, newxscale, chosenxaxis){
    circlesgroup.transition()
        .duration(1000)
        .attr("cx", d => newxscale(d[chosenxaxis]));
        return circlesgroup;
    }

    //function used for updating circles group with new tooltip

function updateToolTip(chosenxaxis, circlesgroup){
        if(chosenxaxis === "poverty"){
            var label = "In Poverty:";
        }
        else{
            var label = "age:";
        }
        var tooltip = d3.tip()
            .attr("class","tooltip")
            .offset([80,-60])
            .html(function(d){
                return(`${d.state}<br>${label}${d[chosenxaxis]}`);
        })
    circlesgroup.call(tooltip);

    circlesgroup.on("mouseover",function(data){
        tooltip.show(data);
    })
        .on("mouseout", function(data,index){
            tooltip.hide(data);
        });
        return circlesgroup
    }

    // Step 3 :Get the data.

d3.csv("/assets/data/data.csv").then(function(censusdata){
        //if (error) return console.log(error);

    // Step 4 : Parse the data
        censusdata.forEach(function(data){
            data.poverty = +data.poverty;
            data.obesity = +data.obesity;
            data.income = +data.income;
            data.healthcare = +data.healthcare;
            data.age = +data.age;
            data.smoke = +data.smoke;
            console.log(data);
    });

    var xlinearscale =xScale(censusdata,chosenxaxis);

    // // Step 5 : Create SCales for the chart
    // var xlinearscale = d3.scale.linear()
    //     .domain(d3.extent(censusdata,d => d.poverty))
    //     .range([0,width]);

    var ylinearscale = d3.scaleLinear()
            .domain([0,d3.max(censusdata, d => d.obesity)*1.02])
            .range([height,0]);

            // Initialize tooltip
    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(censusdata) {
            var stateName = censusdata.state;
            var pov = +censusdata.poverty;
            var obesity = +censusdata.obesity;
            return (
                stateName + '<br> Poverty: ' + pov + '% <br> Obesity(%): ' + obesity +'%'
            );
        });

    var bottomaxis = d3.axisBottom(xlinearscale);
    var leftaxis = d3.axisLeft(ylinearscale);


    var xaxis = chartgroup.append("g")
        .classed("x-axis", true)
        .attr("transform",`translate(0,${height})`)
        .call(bottomaxis);

    chartgroup.append("g")
        // .classed("y-axis", true)
        // .attr("transform",`translate(0,${height}-1`)
            .call(leftaxis);


    var circlesgroup = chartgroup.selectAll("circle")
        .data(censusdata)
        .enter()
        .append("circle")
        .attr("cx", d => xlinearscale(d[chosenxaxis]))
        .attr("cy", d => ylinearscale(d.obesity))
        .attr("r", 10)
        .attr("fill", "lightblue")
        .attr("opacity", ".5");

    var labelsgroup = chartgroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertylabel = labelsgroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty (%)");


    var agelabel = labelsgroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age(median)");

    var incomelabel = labelsgroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income")
        .classed("inactive", true)
        .text("Household income(Median)")


    var obeselabel = chartgroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 -margin.left)
        .attr("x", 0 - (height/2))
        .attr("dy", "1em")
        .attr("value", "obesity")
        .classed("axis-text", true)
        .text("Obesse (%)");

    var smokeslabel = chartgroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 20 -margin.left)
        .attr("x", 0 - (height/2))
        .attr("value", "smokes")
        .attr("dy", "1em")
        .classed("axis-text", true)

        .text("Smokes (%)");

      var lackhealtcharelabel = chartgroup.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 40 -margin.left)
          .attr("x", 0 - (height/2))
          .attr("value", "nohealthcare")
          .attr("dy", "1em")
          .classed("axis-text", true)
          .text("Lacks Healthcare (%)");

    var circlesgroup = updateToolTip(chosenxaxis, circlesgroup);

    labelsgroup.selectAll("text")
        .on("click", function() {
          // get value of selection
          var value = d3.select(this).attr("value");
          if (value !== chosenxaxis) {

            // replaces chosenXaxis with value
            chosenxaxis = value;

            // console.log(chosenXAxis)

            // functions here found above csv import
            // updates x scale for new data
            xlinearscale = xScale(censusdata, chosenxaxis);

            // updates x axis with transition
            xAxis = renderAxes(xlinearscale, xaxis);

            // updates circles with new x values
            circlesgroup = renderCircles(circlesgroup, xlinearscale, chosenxaxis);

            // updates tooltips with new info
            circlesgroup = updateToolTip(chosenxaxis, circlesgroup);


            // changes classes to change bold text
            if (chosenxaxis === "age") {
                agelabel
                    .classed("active", true)
                    .classed("inactive", false);
                povertylabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomelabel
                    .classed("active", true)
                    .classed("inactive",false);
            }
            else {
                agelabel
                    .classed("active", false)
                    .classed("inactive", true);
                povertylabel
                    .classed("active", true)
                    .classed("inactive", false);
                incomelabel
                    .classed("active", true)
                    .classed("inactive",false);
            }
          }
        });
        // chartgroup.selectAll("text")
        //     .on("click", function (){
        //       let value = d3.select(this).attr("value");
        //       if (value !== "obesity") {
        //
        //         // replaces chosenXaxis with value
        //         value = "obesiety";
        //
        //         // console.log(chosenXAxis)
        //
        //         // functions here found above csv import
        //         // updates x scale for new data
        //         xlinearscale = xScale(censusdata, chosenxaxis);
        //
        //         // updates x axis with transition
        //         xAxis = renderAxes(xlinearscale, xaxis);
        //
        //         // updates circles with new x values
        //         circlesgroup = renderCircles(circlesgroup, xlinearscale, chosenxaxis);
        //
        //         // updates tooltips with new info
        //         circlesgroup = updateToolTip(chosenxaxis, circlesgroup);
        //     }
        //   })
        })
