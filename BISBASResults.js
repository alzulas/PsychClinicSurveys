var BISPopulationMean =  19.99;
var BISPopulationStd = 3.79;
var BASRewardPopulationMean = 17.59;
var BASRewardPopulationStd = 2.14;
var BASDrviePopulationMean = 12.05;
var BASDrviePopulationStd = 2.36;
var BASFunPopulationMean = 12.43;
var BASFunPopulationStd = 2.26;
var BASOverallPopulationMean = 38.6;
var BASOverallPopulationStd = 6.5;

var outPutCSV = [];
var myid = getCookie("userName");
if (myid != ""){
    var dataPassed;
    $.ajax({
        type: "GET",
        url: "/BISresult/" + myid,
        async: false,
        success: function(dataPassed){
            outPutCSV = calculateScores(dataPassed);
            console.log(outPutCSV); //Correctly calculated data
            console.log("Get request complete");
        },
    });
}


showBISResults(outPutCSV);
showBASResults(outPutCSV);
console.log(outPutCSV);//empty set
createBargraph(outPutCSV);

function createBargraph(dataset){
    var w = 400;
    var h = 100;
    var barPadding = 1;

    //Create SVG element
    var svg = d3.select("body")
                .append("svg")
                .attr("width", w)
                .attr("height", h);

    svg.selectAll("rect")
        .data(dataset)
        .enter()
        .append("rect")
        .attr("x", function(d, i) {
            return i * (w / dataset.length);
        })
        .attr("y", function(d) {
            return h - (d * 4);
        })
        .attr("width", w / dataset.length - barPadding)
        .attr("height", function(d) {
            return d * 4;
        })
        .attr("fill", function(d) {
            return "rgb(0, 0, " + Math.round(d * 10) + ")";
        });
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function calculateScores(dataPassed){
    var BISScore = 0;
    var BASDriveScore = 0;
    var BASRewardScore = 0;
    var BASFunScore = 0;
    var scoresCSV = [];
    var dataArray = dataPassed.split(",");
    console.log(dataArray);
    for (var i = 5; i < 12; i++){
        BISScore = Number(dataArray[i])+BISScore;
    }
    for (var i = 12; i < 16; i++){
        BASDriveScore = Number(dataArray[i])+BASDriveScore;
    }
    for (var i = 16; i < 21; i++){
        BASRewardScore = Number(dataArray[i])+BASRewardScore;
    }
    for (var i = 21; i < 25; i++){
        BASFunScore = Number(dataArray[i])+BASFunScore;
    }
    console.log(BISScore + " " + BASDriveScore + " " + BASRewardScore + " " + BASFunScore);
    scoresCSV.push(BISScore);
    scoresCSV.push(BASDriveScore);
    scoresCSV.push(BASRewardScore);
    scoresCSV.push(BASFunScore);
    console.log(scoresCSV);
    return scoresCSV;
}


function showBISResults(outPutCSV){
    d3.select("body").append("H1").text("BIS Results")
    d3.select("body").append("p").text("The first temperament assessed was the Behavioral Inhibition System (BIS). This behavioral inhibition system involves a set of brain structures that leads to inhibition in response to anticipated or actual punishers and is associated with the experience of anxiety and fear.");
    d3.select("body").append("p").text("You can think of BIS as a psychic brake pedal, or a stop-and-throw-into-reverse pedal! BIS is activated for situations you perceive as novel, threatening, or challenging. People who score high on BIS experience anxiety/fear more readily and persistently in such situations.");
    d3.select("body").append("p").text("On the plus side, they are likely to be very careful and to consider consequences before acting and may be more systematic in thinking things through. On the down side, they may be more vulnerable to problems with anxiety.");
    d3.select("body").append("p").text("On this measure of behavioral inhibition, you scored a " + outPutCSV[0]);

    var veryHighBIS = "Your score for behavioral inhibition was in the Very High range. This means that compared to the average person, you are in the top 2% of people who experience anxiety more readily in response to novel, challenging, or threatening events.";
    var highBIS = "Your score for behavioral inhibition was in the High range. This means that compared to the average person, you are in the top 10% of people who experience anxiety more readily in response to novel, challenging, or threatening events.";
    var highAverageBIS = "Your score for behavioral inhibition was in the High Average range. This means that compared to the average person, you are in the top 25% of people who experience anxiety more readily in response to novel, challenging, or threatening events.";
    var averageBIS = "Your score for behavioral inhibition was in the Average range. This means that you experience anxiety in response to novel, challenging, or threatening events at a fairly typical level.";
    var lowAverageBIS = "Your score for behavioral inhibition was in the Low Average range. This means that compared to the average person, you are in the lower 25% of people who experience anxiety in response to novel, challenging, or threatening events.";
    var lowBIS = "Your score for behavioral inhibition was in the Low range. This means that compared to the average person, you are in the lower 10% of people who experience anxiety in response to novel, challenging, or threatening events.";
    var veryLowBIS = "Your score for behavioral inhibition was in the Very Low range. This means that compared to the average person, you are in the lower 2% of people who experience anxiety in response to novel, challenging, or threatening events.";


    if (outPutCSV[0] > BISPopulationMean-BISPopulationStd && outPutCSV[0] < BISPopulationMean+BISPopulationStd){
        d3.select("body").append("p").text(averageBIS);
    }
    else if (outPutCSV[0] > BISPopulationMean-(BISPopulationStd*2) && outPutCSV[0] < BISPopulationMean-BISPopulationStd){
        d3.select("body").append("p").text(lowAverageBIS);
    }
    else if (outPutCSV[0] > BISPopulationMean-(BISPopulationStd*3) && outPutCSV[0] < BISPopulationMean-(BISPopulationStd*2)){
        d3.select("body").append("p").text(lowBIS);
    }
    else if (outPutCSV[0] > 6 && outPutCSV[0] < BISPopulationMean-(BISPopulationStd*3)){
        d3.select("body").append("p").text(veryLowBIS);
    }
    else if (outPutCSV[0] > BISPopulationMean+(BISPopulationStd) && outPutCSV[0] < BISPopulationMean+(BISPopulationStd*2)){
        d3.select("body").append("p").text(highAverageBIS);
    }
    else if (outPutCSV[0] > BISPopulationMean+(BISPopulationStd*2) && outPutCSV[0] < BISPopulationMean+(BISPopulationStd*3)){
        d3.select("body").append("p").text(highBIS);
    }
    else if (outPutCSV[0] > BISPopulationMean+(BISPopulationStd*3) && outPutCSV[0] < 29){
        d3.select("body").append("p").text(veryHighBIS);
    }
    else{
        d3.select("body").append("p").text("Test was inconclusive or there is an error in the survey. Please contact the web developer.");
    }
}

function showBASResults(outPutCSV){
    var overallBAS = (outPutCSV[1]+outPutCSV[2]+outPutCSV[3]);
    d3.select("body").append("H1").text("BAS Results");
    d3.select("body").append("p").text("The second temperament assessed was the Behavioral Activation System (BAS). The behavioral activation system involves a set of brain structures that promote movement toward incentives, things we want. You can think of BAS as a psychic gas pedal, a go system. BAS is activated for situations you want, situations that are enticing, attractive, positive. People who score high on BAS experience positive emotions more readily and persistently in such situations. On the plus side, they are likely to be motivated to approach positive situations with gusto. On the down side, they may have problems with being too impulsive.");
    d3.select("body").append("p").text("On this measure of behavioral activation, you scored " + overallBAS);
    d3.select("body").append("li").text("Your BAS Drive score is " + outPutCSV[1]);
    d3.select("body").append("li").text("Your BAS Reward score is " + outPutCSV[2]);
    d3.select("body").append("li").text("Your BAS Fun score is " + outPutCSV[3]);

    var VeryHighBAS = "Your score for behavioral activation was in the Very High range. This means that compared to the average person, you are in the top 2% of people who experience positive emotion (e.g., excitement, enthusiasm) and motivation in response to positive events, such as rewards or incentives.";
    var highBAS = "Your score for behavioral activation was in the High range. This means that compared to the average person, you are in the top 10% of people who experience positive emotion (e.g., excitement, enthusiasm) and motivation in response to positive events, such as rewards or incentives.";
    var highAverageBAS = "Your score for behavioral activation was in the High Average range. This means that compared to the average person, you are in the top 25% of people who experience positive emotion (e.g., excitement, enthusiasm) and motivation in response to positive events, such as rewards or incentives.";
    var averageBAS = "Your score for behavioral activation was in the Average range. This means that you experience positive emotion (e.g., excitement, enthusiasm) and motivation in response to positive events, such as rewards or incentives, as much as the typical person.";
    var lowAverageBAS = "Your score for behavioral activation was in the Low Average range. This means that compared to the average person, you are in the lower 25% of people who experience positive emotion (e.g., excitement, enthusiasm) and motivation in response to positive events, such as rewards or incentives."
    var lowBAS = "Your score for behavioral activation was in the Low range. This means that compared to the average person, you are in the lower 10% of people who experience positive emotion (e.g., excitement, enthusiasm) and motivation in response to positive events, such as rewards or incentives.";
    var veryLowBAS = "Your score for behavioral activation was in the Very Low range. This means that compared to the average person, you are in the lower 2% of people who experience positive emotion (e.g., excitement, enthusiasm) and motivation in response to positive events, such as rewards or incentives.";
    
    if (overallBAS > BASOverallPopulationMean-BASOverallPopulationStd && overallBAS < BASOverallPopulationMean+BASOverallPopulationStd){
        d3.select("body").append("p").text(averageBAS);
    }
    else if (overallBAS > BASOverallPopulationMean-(BASOverallPopulationStd*2) && overallBAS < BASOverallPopulationMean-BASOverallPopulationStd){
        d3.select("body").append("p").text(lowAverageBAS);
    }
    else if (overallBAS > BASOverallPopulationMean-(BASOverallPopulationStd*3) && overallBAS < BASOverallPopulationMean-(BASOverallPopulationStd*2)){
        d3.select("body").append("p").text(lowBAS);
    }
    else if (overallBAS > 12 && overallBAS < BASOverallPopulationMean-(BASOverallPopulationStd*3)){
        d3.select("body").append("p").text(veryLowBAS);
    }
    else if (overallBAS > BASOverallPopulationMean+(BASOverallPopulationStd) && overallBAS < BASOverallPopulationMean+(BASOverallPopulationStd*2)){
        d3.select("body").append("p").text(highAverageBAS);
    }
    else if (overallBAS > BASOverallPopulationMean+(BASOverallPopulationStd*2) && overallBAS < BASOverallPopulationMean+(BASOverallPopulationStd*3)){
        d3.select("body").append("p").text(highBAS);
    }
    else if (overallBAS > BASOverallPopulationMean+(BASOverallPopulationStd*3) && overallBAS < 53){
        d3.select("body").append("p").text(VeryHighBAS);
    }
    else{
        d3.select("body").append("p").text("Test was inconclusive or there is an error in the survey. Please contact the web developer.");
    }

}