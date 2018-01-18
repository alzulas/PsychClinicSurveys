////////////////////////////////////////////////////////////
//  This file was authored by A. Leah Zulas             ////
//  It heavily utilizes D3 js                           ////
//  If retreives data using Ajax, from an express server////
//  Any questions about the below code should be sent to:///
//  alzulas@alzulas.com                                 ////
////////////////////////////////////////////////////////////


//Create CSV array and retreive cookie
var outPutCSV = [];
var myid = getCookie("userName");
var relationship = ["Mother", "Father", "Romantic Partner", "Ex-Romantic Partner", "Sibling", "Close Friend", "name1", "name2", "Negative", "Activity", "Overall"];

//Use cookie to request data from the server, so long as cookie exists.
if (myid != ""){
    var dataPassed;
    $.ajax({
        type: "GET",
        url: "/RSSMresult/" + myid,
        async: false,
        success: function(dataPassed){
            outPutCSV = calculateScores(dataPassed); //collect data and put them into the CSV
            console.log(outPutCSV); //Correctly calculated data print to console so we can see it worked
            console.log("Get request complete");//verification that the data was retreieved.
        },
    });
}

    //d3.getElementById("myDiv").style.margin = "50px 10px 20px 30px";
    //This html just explains what the participant just did.
    d3.select("body").append("p")
        .style("margin", "30px 50px 0px 50px")
        .text("The measure you completed was designed to assess your self concepts. Research has shown that rather than a single self-concept we actually possess a “family of selves”, and that we experience somewhat different “selves” when with different others or when engaged in different roles or activities. Individuals vary in how similar or different these multiple self-representations are from one another.");
    d3.select("body").append("p")
        .style("margin", "30px 50px 0px 50px")
        .text("For each self-representation, this measure assessed the extent to which basic psychological needs are being met. According to self-determination theory (Ryan & Deci, 2000), humans have three needs:");
    d3.select("body").append("li")
        .style("margin", "30px 50px 0px 50px")
        .text("Competence-refers to the experience of feeling effective and capable of achieving desired outcomes.");
    d3.select("body").append("li")
        .style("margin", "10px 50px 0px 50px")
        .text("Relatedness-refers to the experience of intimacy and genuine connection with others.");
    d3.select("body").append("li")
        .style("margin", "10px 50px 0px 50px")
        .text("Autonomy-refers to the experience of self-determination, full willingness, and volition when carrying out an activity.");
    d3.select("body").append("p")
        .style("margin", "30px 50px 0px 50px")
        .text("Research has shown that individuals who experience higher levels of their needs being satisfied are more likely to experience higher levels of psychological functioning and well-being.  In contrast, individuals who experience frustration of these needs are more likely to experience distress.");
    d3.select("body").append("p")
        .style("margin", "30px 50px 0px 50px")
        .text("To the extent that each of you experience high need satisfaction when these different selves are active, you are likely to experience greater psychological well-being. In this sense, your self-concept is adaptive, strong.");
    d3.select("body").append("p")
        .style("margin", "30px 50px 0px 50px")
        .text("For each need, use the following scale to interpret your scores:");
    d3.select("body").append("li")
        .style("margin", "10px 50px 0px 50px")
        .text("4.5 and above = a very high level of need satisfaction");
    d3.select("body").append("li") //BOLD???
        .style("margin", "10px 50px 0px 50px")
        .text("4.0 – 4.4  = high level of need satisfaction");
    d3.select("body").append("li")
        .style("margin", "10px 50px 0px 50px")
        .text("3.5 - 3.9  = average need satisfaction");
    d3.select("body").append("li")
        .style("margin", "10px 50px 0px 50px")
        .text("2.5 – 3.4 = moderate need frustration");
    d3.select("body").append("li")
        .style("margin", "10px 50px 0px 50px")
        .text("2.0 – 2.4 = high need frustration");
    d3.select("body").append("li")
        .style("margin", "10px 50px 0px 50px")
        .text("1.0 – 1.9 = very high need frustration");
    d3.select("body").append("p")
        .style("margin", "30px 50px 0px 50px")
        .text("");

//begins the process of printing scores. 
//Common was to write JS, because any variables not wrapped in a function is available in the entire namespace of the website.
printScores();

function printScores(){
    //creat array of possible relationships
    //THIS IS ONE OF THE VARIABLES TO CHANGE IF YOU WANT TO ADD NEW RELATIONSHIPS.
    var i = 0;//counter
    for (var relation in relationship){ //Go through each relationship above and...
        standardResults(outPutCSV[i], outPutCSV[i+1], outPutCSV[i+2], relationship[relation]); //calculate info about it.
        //The above hands the next part of this the comp score, auto score, relation score, and the relationship name
        i = i+3;
        //it then progresses the counter to the next relationship in the CSV
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
    var round = 0;
    //Relevant data beings at position 8 in the array from the server
    for (var i = 8; i < dataArray.length; i++){
        currentComp = currentComp + Number(dataArray[i]);//take current score for this relationship, add to previous
        overallComp = overallComp + Number(dataArray[i]);//Do for an overall score as well
        if(Number(dataArray[i])==0){
            //If there is nothing in this relationship, because they don't have one or never think of that person,
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
            //If we have all relevant scores for this relationship, then calculate averages
            currentComp = currentComp/4;
            currentAuto = currentAuto/4;
            currentRelated = currentRelated/4;
            //Push these scores onto the results array
            results.push(currentComp);
            results.push(currentAuto);
            results.push(currentRelated);
            //Reset variables for next relationship
            currentAuto = 0;
            currentComp = 0;
            currentRelated = 0;
            round = 0;

            if(calculationPassThrough==8 || calculationPassThrough==9){
                //Move forward past questions like "relationship type" and a filler question
                i = i+2;
            }else{
                if(dataArray[i]=="name1")
                { //make sure the name they gave us is in the list of printed relationships. Also skipping some stuff. 
                    i++;
                    relationship[6] = dataArray[i];
                    print("Relationship6 = " + relationship[6]);
                    i = i+2;
                }
                else if(dataArray[i]=="name2"){
                    i++;
                    relationship[7] = dataArray[i];
                    i = i+2;
                }
                else{
                    //Move forward past questions like "relationship type", "closeness" and a filler question
                    i = i+3;     
                }
            }
            calculationPassThrough++;
        }
    }
    //Once all relationship scores are calculated, an overall must be calculated
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
            .text("Your Overall RSSM Scores are: ");
        d3.select("body").append("li")
            .style("margin", "30px 50px 0px 50px")
            .text("Your competence score is " + compScore.toFixed(2));
        //These include the actal mean and SD for the population, 
        //they go to a function to calculate where the participants score lies
        standardDeviationPrint(compScore, 3.97, .74, "competancy");
        d3.select("body").append("li")
            .style("margin", "30px 50px 0px 50px")
            .text("Your autonomy score is " + autoScore.toFixed(2));
        standardDeviationPrint(autoScore, 3.85, .73, "autonomy");
        d3.select("body").append("li")
            .style("margin", "30px 50px 0px 50px")
            .text("Your relatedness score is " + relateScore.toFixed(2));
        standardDeviationPrint(compScore, 4.22, .69, "relatedness");
        createBargraph(outPutCSV);
    }
    else if(compScore != 0 && autoScore != 0 && relateScore != 0){//Print each relationship, so long as it exists
        d3.select("body").append("H1")
            .style("margin", "30px 50px 0px 50px")
            .text("RSSM Score for you with your " + relation);
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

function standardDeviationPrint(Score, Mean, SD, type){ //participants score, popMean, popSD, score type
    //Find how many deviations from the mean they are, and print the accompanying text with it.
    if (Score > Mean-SD && Score < Mean+SD){
        d3.select("body").append("ul")
            .style("margin", "15px 50px 0px 50px")
            .text("Your " + type + " score is average");
    }
    else if (Score > Mean-(SD*2) && Score < Mean-SD){
        d3.select("body").append("ul")
            .style("margin", "15px 50px 0px 50px")
            .text("Your " + type + " score is on the low side of average");
    }
    else if (Score > Mean-(SD*3) && Score < Mean-(SD*2)){
        d3.select("body").append("ul")
            .style("margin", "15px 50px 0px 50px")
            .text("Your " + type + " score is low");
    }
    else if (Score > 0 && Score < Mean-(SD*3)){
        d3.select("body").append("ul")
            .style("margin", "15px 50px 0px 50px")
            .text("Your " + type + " score is very low");
    }
    else if (Score > Mean+(SD) && Score < Mean+(SD*2)){
        d3.select("body").append("ul")
            .style("margin", "15px 50px 0px 50px")
            .text("Your " + type + " score is on the high side of average");
    }
    else if (Score > Mean+(SD*2) && Score < Mean+(SD*3)){
        d3.select("body").append("ul")
            .style("margin", "15px 50px 0px 50px")
            .text("Your " + type + " score is high");
    }
    else if (Score > Mean+(SD*3) && Score < 5){
        d3.select("body").append("ul")
            .style("margin", "15px 50px 0px 50px")
            .text("Your " + type + " score is very high");
    }
    else{
        //Something in the code failed most likely. But also, they could have not answered for any relationship.
        d3.select("body").append("p")
            .style("margin", "15px 50px 0px 50px")
            .text("Test was inconclusive or there is an error in the survey. Please contact the web developer.");
    }
    
}

function createBargraph(dataset){ //This was a test of D3
    //It creates a little BISBAS graph
    //It's not super useful
    //But I kept the code just in case.
    //If you'd like to see it, uncomment out the call to this function above.
     console.log("graphing20");
    
    var svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;

    var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
        y = d3.scaleLinear().rangeRound([height, 0]);

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.csv("dataset", function(d) {
      d.frequency = +d.frequency;
      return d;
    }, function(error, data) {
      if (error) throw error;

  x.domain(data.map(function(d) { return d.letter; }));
  y.domain([0, d3.max(data, function(d) { return d.frequency; })]);

  g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y).ticks(10, "%"))
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Frequency");

  g.selectAll(".bar")
    .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.letter); })
      .attr("y", function(d) { return y(d.frequency); })
      .attr("width", x.bandwidth())
      .attr("height", function(d) { return height - y(d.frequency); });
});

			
//			d3.select("body")//.selectAll("div")
//				.data(dataset)
//				.enter()
//				.append("div")
//				.attr("class", "bar")
//				.style("height", function(d) {
//					var barHeight = d * 5;
//					return barHeight + "px";
//				});
			
		
//    var w = 1000;
//    var h = 500;
//    var barPadding = 1;
//
//    //Create SVG element
//    var svg = d3.select("body")
//                .style("margin", "30px 50px 0px 50px")
//                .append("svg")
//                .attr("width", w)
//                .attr("height", h);
//
//    svg.selectAll("rect")
//        .data(dataset)
//        .style("height", function(d) {
//					var barHeight = d * 5;
//					return barHeight + "px";
//				})
//        .enter()
//        .append("rect")
//        .attr("x", function(d, i) {
//            return i * (w / dataset.length);
//        })
//        .attr("y", function(d) {
//            return h - (d * 4);
//        })
//        .attr("width", w / dataset.length - barPadding)
//        .attr("height", function(d) {
//            return d * 4;
//        })
//        .attr("fill", function(d) {
//            return "rgb(0, 0, " + Math.round(d * 10) + ")";
//        });
}