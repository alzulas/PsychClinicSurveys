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

//begins the process of printing scores. 
//Common was to write JS, because any variables not wrapped in a function is available in the entire namespace of the website.
printScores();

function printScores(){
    //creat array of possible relationships
    //THIS IS ONE OF THE VARIABLES TO CHANGE IF YOU WANT TO ADD NEW RELATIONSHIPS.
    var relationship = ["Mother", "Father", "Romantic Partner", "Ex-Romantic Partner", "Sibling", "Close Friend", "Overall"];
    i = 0;//counter
    for (relation in relationship){ //Go through each relationship above and...
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
    var currentComp = 0;
    var currentAuto = 0;
    var currentRelated = 0;
    var overallComp = 0;
    var overallAuto = 0;
    var overallRelated = 0;
    var compDenominator = 4*6;
    var autoDenominator = 4*6;
    var relatedDenominator = 4*6;
    var dataArray = dataPassed.split(","); //Takes CSV from the server, creates array
    //round counter. Because every 4th time through the data, scores are calculated
    var round = 0;
    //Relevant data beings at position 8 in the array from the server
    for (var i = 8; i < 95; i++){
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
            //Move forward past questions like "relationship type", "closeness" and a filler question
            i = i+3;
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
        d3.select("body").append("H1").text("Your Overall RSSM Scores are: ");
        d3.select("body").append("li").text("Your competence score is " + compScore);
        //These include the actal mean and SD for the population, 
        //they go to a function to calculate where the participants score lies
        standardDeviationPrint(compScore, 3.97, .74, "competancy");
        d3.select("body").append("li").text("Your autonomy score is " + autoScore);
        standardDeviationPrint(autoScore, 3.85, .73, "autonomy");
        d3.select("body").append("li").text("Your relatedness score is " + relateScore);
        standardDeviationPrint(compScore, 4.22, .69, "relatedness");
    }
    else if(compScore != 0 && autoScore != 0 && relateScore != 0){//Print each relationship, so long as it exists
        d3.select("body").append("H1").text("RSSM Score for you with your " + relation);
        d3.select("body").append("li").text("Your competence score is " + compScore);
        d3.select("body").append("li").text("Your autonomy score is " + autoScore);
        d3.select("body").append("li").text("Your relatedness score is " + relateScore);
    }
}

function standardDeviationPrint(Score, Mean, SD, type){ //participants score, popMean, popSD, score type
    //Find how many deviations from the mean they are, and print the accompanying text with it.
    if (Score > Mean-SD && Score < Mean+SD){
        d3.select("body").append("ul").text("Your " + type + " score is average");
    }
    else if (Score > Mean-(SD*2) && Score < Mean-SD){
        d3.select("body").append("ul").text("Your " + type + " score is on the low side of average");
    }
    else if (Score > Mean-(SD*3) && Score < Mean-(SD*2)){
        d3.select("body").append("ul").text("Your " + type + " score is low");
    }
    else if (Score > 0 && Score < Mean-(SD*3)){
        d3.select("body").append("ul").text("Your " + type + " score is very low");
    }
    else if (Score > Mean+(SD) && Score < Mean+(SD*2)){
        d3.select("body").append("ul").text("Your " + type + " score is on the high side of average");
    }
    else if (Score > Mean+(SD*2) && Score < Mean+(SD*3)){
        d3.select("body").append("ul").text("Your " + type + " score is high");
    }
    else if (Score > Mean+(SD*3) && Score < 5){
        d3.select("body").append("ul").text("Your " + type + " score is very high");
    }
    else{
        //Something in the code failed most likely. But also, they could have not answered for any relationship.
        d3.select("body").append("p").text("Test was inconclusive or there is an error in the survey. Please contact the web developer.");
    }
    
}