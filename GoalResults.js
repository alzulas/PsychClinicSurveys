////////////////////////////////////////////////////////////
//  This file was authored by A. Leah Zulas             ////
//  It heavily utilizes D3 js                           ////
//  If retreives data using Ajax, from an express server////
//  Any questions about the below code should be sent to:///
//  alzulas@alzulas.com                                 ////
////////////////////////////////////////////////////////////

//Test data set, in case you need it. 
//var testingCSV = "NOEO6624,Female,31-45,[American Indian or Alaska Native],[Out of work but not currently looking for work],Married,Mother,Never,,,,,,,,,,,,,,Father,Never,,,,,,,,,,,,,,Romantic Partner,I dont have a Romantic Partner,,,,,,,,,,,,,,Ex-Romantic Partner,Never,,,,,,,,,,,,,,Sibling,sometimes,1,2,3,3,2,3,4,3,2,1,2,3,3,Close Friend,Often,1,2,3,4,3,2,2,3,4,4,3,2,2,name1,Bob,1,2,1,2,1,2,3,2,1,2,3,2,1,name2,Alice,4,3,4,3,4,5,4,4,3,3,2,2,1,Ed,4,3,4,5,4,3,4,3,3,4,4,3,3,name4,Disco Dancer,5,4,3,3,4,5,4,4,3,4,3,3,3,]";


function printScores() {
    //creat array of possible goals
    //THIS IS ONE OF THE VARIABLES TO CHANGE IF YOU WANT TO ADD NEW GOALS.
    var i = 0;//counter
    for (var relation in goal){ //Go through each goal above and...
        standardResults(outPutCSV[i], outPutCSV[i+1], outPutCSV[i+2], goal[relation]); //calculate info about it.
        //The above hands the next part of this the comp score, auto score, relation score, and the goal name
        i = i+3;
        //it then progresses the counter to the next goal in the CSV
    }
}

function getCookie(cname) { //This function retreives the participant ID, stored as a cookie
    var name = cname + "=";
    var ca = document.cookie.split(';'); //Ask for cookie, split by ;
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) { //looking for ID in cookie called "cname"
            //inserts cookie into text line
            document.getElementById('txtID').value = c.substring(name.length, c.length);
            return c.substring(name.length, c.length); //Return ID
        }
    }
    return ""; //No ID found, return empty string
}

function calculateScores(dataPassed){ 
    //Takes data from CSV off the server, calculates relavant scores, returns array
    var results = []; 
    //Will be in the order of mother comp-auto-related then 
    //father comp-auto-related then
    //romantic partner comp-auto-related then
    //ex comp-auto-related then
    //sibling comp-auto-related then
    //close friend
    //Below are necessary variables
    var calculationPassThrough = 0;
    var currentComp = 0;
    var currentAuto = 0;
    var currentRelated = 0;
    var overallComp = 0;
    var overallAuto = 0;
    var overallRelated = 0;
    var compDenominator = 4*10;
    var autoDenominator = 4*10;
    var relatedDenominator = 4*10;
    var dataArray = dataPassed.split(","); //Takes CSV from the server, creates array
    //round counter. Because every 4th time through the data, scores are calculated
    //console.log("data array = " + dataArray);
    var round = 0;
    //Relevant data beings at position 12 in the array from the server
    //console.log("Entire log = " + dataArray);
    for (var i = 12; i < dataArray.length; i++){
        currentComp = currentComp + Number(dataArray[i]);//take current score for this goal, add to previous
        overallComp = overallComp + Number(dataArray[i]);//Do for an overall score as well
        if(Number(dataArray[i])==0){
            //If there is nothing in this goal, because they don't have one or never think of that person,
            //Then the overall score must have a different number to divide from
            compDenominator--;
        }
        //Go to next item in the array and repeat
        i++;
        currentAuto = currentAuto + Number(dataArray[i]);
        overallAuto = overallAuto + Number(dataArray[i]);
        if(Number(dataArray[i])==0){
            autoDenominator--;
        }
        //Go to next item in the array and repeat
        i++;
        currentRelated = currentRelated + Number(dataArray[i]);
        overallRelated = overallRelated + Number(dataArray[i]);
        if(Number(dataArray[i])==0){
            relatedDenominator--;
        }
        //Move forward round
        round++;
        if (round > 3){
            //If we have all relevant scores for this goal, then calculate averages
            currentComp = currentComp/4;
            currentAuto = currentAuto/4;
            currentRelated = currentRelated/4;
            //Push these scores onto the results array
            results.push(currentComp);
            results.push(currentAuto);
            results.push(currentRelated);
            //Reset variables for next goal
            currentAuto = 0;
            currentComp = 0;
            currentRelated = 0;
            round = 0;

            i= i+8;
            calculationPassThrough++;
        }
    }
    //Once all goal scores are calculated, an overall must be calculated
    overallComp = overallComp/compDenominator;
    overallAuto = overallAuto/autoDenominator;
    overallRelated = overallRelated/relatedDenominator;
    //Push these onto the results array
    results.push(overallComp);
    results.push(overallAuto);
    results.push(overallRelated);
    
    //return results to the ajax call
    return results;
}

function standardResults(compScore, autoScore, relateScore, relation){
    //Printing scores to the screen.
    if(relation == "Overall"){//Print overall scores last
        d3.select("body").append("H1")
            .style("margin", "30px 50px 0px 50px")
            .text("Your Overall Goal Scores are: ");
        d3.select("body").append("li")
            .style("margin", "30px 50px 0px 50px")
            .text("Your competence score is " + compScore.toFixed(2));
        //These include the actal mean and SD for the population, 
        //they go to a function to calculate where the participants score lies
        if (compScore !== undefined){
            standardDeviationPrint(compScore, 3.97, .74, "competancy");
            d3.select("body").append("li")
                .style("margin", "30px 50px 0px 50px")
                .text("Your autonomy score is " + autoScore.toFixed(2));
            standardDeviationPrint(autoScore, 3.85, .73, "autonomy");
            d3.select("body").append("li")
                .style("margin", "30px 50px 0px 50px")
                .text("Your relatedness score is " + relateScore.toFixed(2));
            standardDeviationPrint(compScore, 4.22, .69, "relatedness");
        }
    } else if(compScore !== 0 && autoScore !== 0 && relateScore !== 0) {//Print each goal, so long as it exists
        d3.select("body").append("H1")
            .style("margin", "30px 50px 0px 50px")
            .text("Goal Score for you with your " + relation);
        d3.select("body").append("li")
            .style("margin", "15px 50px 0px 50px")
            .text("Your competence score is " + compScore);
        d3.select("body").append("li")
            .style("margin", "10px 50px 0px 50px")
            .text("Your autonomy score is " + autoScore);
        d3.select("body").append("li")
            .style("margin", "10px 50px 0px 50px")
            .text("Your relatedness score is " + relateScore);
    }
}




function standardDeviationPrint(Score, Mean, SD, type) { //participants score, popMean, popSD, score type
    //Find how many deviations from the mean they are, and print the accompanying text with it.
    if (Score > Mean-SD && Score < Mean+SD) {
        d3.select("body").append("ul")
            .style("margin", "15px 50px 0px 50px")
            .text("Your " + type + " score is average");
    } else if (Score > Mean-(SD*2) && Score < Mean-SD) {
        d3.select("body").append("ul")
            .style("margin", "15px 50px 0px 50px")
            .text("Your " + type + " score is on the low side of average");
    } else if (Score > Mean-(SD*3) && Score < Mean-(SD*2)) {
        d3.select("body").append("ul")
            .style("margin", "15px 50px 0px 50px")
            .text("Your " + type + " score is low");
    } else if (Score > 0 && Score < Mean-(SD*3)) {
        d3.select("body").append("ul")
            .style("margin", "15px 50px 0px 50px")
            .text("Your " + type + " score is very low");
    } else if (Score > Mean+(SD) && Score < Mean+(SD*2)) {
        d3.select("body").append("ul")
            .style("margin", "15px 50px 0px 50px")
            .text("Your " + type + " score is on the high side of average");
    } else if (Score > Mean+(SD*2) && Score < Mean+(SD*3)) {
        d3.select("body").append("ul")
            .style("margin", "15px 50px 0px 50px")
            .text("Your " + type + " score is high");
    } else if (Score > Mean+(SD*3) && Score < 5) {
        d3.select("body").append("ul")
            .style("margin", "15px 50px 0px 50px")
            .text("Your " + type + " score is very high");
    } else {
        //Something in the code failed most likely. But also, they could have not answered for any goal.
        d3.select("body").append("p")
            .style("margin", "15px 50px 0px 50px")
            .text("Test was inconclusive or there is an error in the survey. Please contact the web developer.");
    }   
}


function createBargraph(dataset){ //This was a test of D3
    //It creates a little Goals graph
    //It's not super useful
    //But I kept the code just in case.
    //If you'd like to see it, uncomment out the call to this function above.
     //console.log("graphing20");
    var newCSV=[];
    
    var i = 0;
    for(j = 0; j < goal.length; j++){
            var line = {Goal: goal[j],Competance: dataset[i],Autonomy: dataset[i+1],Relatedness: dataset[i+2]};
            i = i+3;
            newCSV.push(line);
            //console.log(line);
    }
    //console.log(newCSV);
             

    var svg = d3.select("svg"),
        margin = {top: 20, right: 30, bottom: 30, left: 100},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x0 = d3.scaleBand()
        .rangeRound([0, width])
        .paddingInner(0.1);

    var x1 = d3.scaleBand()
        .padding(0.05);

    var y = d3.scaleLinear()
        .rangeRound([height, 0]);

    var z = d3.scaleOrdinal()
        .range(["#ccebff", "#66c2ff", "#007acc", "#005c99"]);
    
      var data = newCSV;
      var keys = ["Competance", "Autonomy", "Relatedness"];  
      
      x0.domain(data.map(function(d) { return d.Goal; }));
      x1.domain(keys).rangeRound([0, x0.bandwidth()]);
      y.domain([0, 5]).nice();
        //console.log(data);

      g.append("g")
        .selectAll("g")
        .data(data)
        .enter().append("g")
          .attr("transform", function(d) { return "translate(" + x0(d.Goal) + ",0)"; })
        .selectAll("rect")
        .data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })
        .enter().append("rect")
          .attr("x", function(d) { return x1(d.key); })
          .attr("y", function(d) { return y(d.value); })
          .attr("width", x1.bandwidth())
          .attr("height", function(d) { return height - y(d.value); })
          .attr("fill", function(d) { return z(d.key); });

      g.append("g")
          .attr("class", "axis")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x0));

      g.append("g")
          .attr("class", "axis")
          .call(d3.axisLeft(y).ticks(null, "s"))
        .append("text")
          .attr("font-size", 12)
          .attr("transform", "rotate(-90)")
          .attr("x", 0 - (height / 2))
          .attr("y", 0 - 30)
          .attr("dy", "0.1em")
          .attr("fill", "#000")
          .attr("font-weight", "bold")
          .attr("text-anchor", "middle")
          .text("Level of Need");
    //console.log(y(y.ticks().pop()) + 0.5);
        
        g.append("g")
          .attr("class", "axis")
          .call(d3.axisLeft(y).ticks(null, "s"))
        .append("text")
          .attr("font-size", 12)
          .attr("x", 2)
          .attr("y", y(y.ticks().pop()) + 0.5)
          .attr("dy", "0.32em")
          .attr("fill", "#000")
          .attr("font-weight", "bold")
          .attr("text-anchor", "start")
          .text("Satisfaction");
    
        g.append("g")
          .attr("class", "axis")
          .call(d3.axisLeft(y).ticks(null, "s"))
        .append("text")
          .attr("font-size", 12)
          .attr("x", 2)
          .attr("y", 450)
          .attr("dy", "0.1em")
          .attr("fill", "#000")
          .attr("font-weight", "bold")
          .attr("text-anchor", "start")
          .text("Frustration");
       
      var legend = g.append("g")
          .attr("font-family", "sans-serif")
          .attr("font-size", 12)
          .attr("text-anchor", "end")
        .selectAll("g")
        .data(keys.slice().reverse())
        .enter().append("g")
          .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

      legend.append("rect")
          .attr("x", width - 19)
          .attr("width", 19)
          .attr("height", 19)
          .attr("fill", z);

      legend.append("text")
          .attr("x", width - 24)
          .attr("y", 9.5)
          .attr("dy", "0.32em")
          .text(function(d) { return d; });
       
}

//When the button on the page is clicked.
var el = document.getElementById("clickMe");

el.onclick = function (event){//reset the cookie and reload the page
    var newID = document.getElementById('txtID').value;
    var d = new Date();
    d.setTime(d.getTime() + (1 * 24 * 60 * 60 * 1000)); //Cookie set to self destruct in a day
    var expires = "expires=" + d.toUTCString();
    document.cookie = "userName=" + newID + ";" + expires;

    location.reload();
    runPage();
};

//Use cookie to request data from the server, so long as cookie exists.
function runPage(){
    if (myid !== "") {
        var dataPassed;
        $.ajax({
            type: "GET",
            url: "/GOALresult/" + myid,
            async: false,
            success: function (dataPassed) {
                outPutCSV = calculateScores(dataPassed); //collect data and put them into the CSV
                //console.log(outPutCSV); //Correctly calculated data print to console so we can see it worked
                console.log("Get request complete");//verification that the data was retreieved.
            },
        });
    }
        
    //begins the process of printing scores. 
    //Common was to write JS, because any variables not wrapped in a function is available in the entire namespace of the website.
    createBargraph(outPutCSV);
    printScores();
}

//Create CSV array and retreive cookie
var outPutCSV = [];
var myid = getCookie("userName");
var goal = ["Work/Job/Career", "Home and Household matters", "Intimate Relationships", "Non-Intimate Relationships", "Self-Change/Self-Growth", "Learning/Education", "Health and Medical Matters", "Leisure/Recreation", "Other Life Area Not Previously Mentioned"];

runPage();
