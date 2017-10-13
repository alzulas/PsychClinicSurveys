var outPutCSV = [];
var myid = getCookie("userName");
if (myid != ""){
    var dataPassed;
    $.ajax({
        type: "GET",
        url: "/RSSMresult/" + myid,
        async: false,
        success: function(dataPassed){
            outPutCSV = calculateScores(dataPassed);
            console.log(outPutCSV); //Correctly calculated data
            console.log("Get request complete");
        },
    });
}

printScores();

function printScores(){
    var relationship = ["Mother", "Father", "Romantic Partner", "Ex-Romantic Partner", "Sibling", "Close Friend", "Overall"];
    i = 0;
    for (relation in relationship){
        standardResults(outPutCSV[i], outPutCSV[i+1], outPutCSV[i+2], relationship[relation]);
        i = i+3;
    }
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
    var results = []; 
    //Will be in the order of mother comp-auto-related then 
    //father comp-auto-related then
    //romantic partner comp-auto-related then
    //ex comp-auto-related then
    //sibling comp-auto-related then
    //close friend
    var currentComp = 0;
    var currentAuto = 0;
    var currentRelated = 0;
    var overallComp = 0;
    var overallAuto = 0;
    var overallRelated = 0;
    var compDenominator = 4*6;
    var autoDenominator = 4*6;
    var relatedDenominator = 4*6;
    var dataArray = dataPassed.split(",");
    //console.log(dataArray);
    var round = 0;
    for (var i = 8; i < 95; i++){
        currentComp = currentComp + Number(dataArray[i]);
        overallComp = overallComp + Number(dataArray[i]);
        if(Number(dataArray[i])==0){
            compDenominator--;
        }
        i++;
        currentAuto = currentAuto + Number(dataArray[i]);
        overallAuto = overallAuto + Number(dataArray[i]);
        if(Number(dataArray[i])==0){
            autoDenominator--;
        }
        i++;
        currentRelated = currentRelated + Number(dataArray[i]);
        overallRelated = overallRelated + Number(dataArray[i]);
        if(Number(dataArray[i])==0){
            relatedDenominator--;
        }
        round++;
        if (round > 3){
            //console.log(currentAuto + " " + currentComp + " " + currentRelated);
            currentComp = currentComp/4;
            currentAuto = currentAuto/4;
            currentRelated = currentRelated/4;
            results.push(currentComp);
            results.push(currentAuto);
            results.push(currentRelated);
            currentAuto = 0;
            currentComp = 0;
            currentRelated = 0;
            round = 0;
            i = i+3;
        }
    }
    overallComp = overallComp/compDenominator;
    overallAuto = overallAuto/autoDenominator;
    overallRelated = overallRelated/relatedDenominator;
    results.push(overallComp);
    results.push(overallAuto);
    results.push(overallRelated);
    
    //console.log(results);
    return results;
}

function standardResults(compScore, autoScore, relateScore, relation){
    if(relation == "Overall"){
        d3.select("body").append("H1").text("Your Overall RSSM Scores are: ");
        d3.select("body").append("li").text("Your competence score is " + compScore);
        standardDeviationPrint(compScore, 3.97, .74, "competancy");
        d3.select("body").append("li").text("Your autonomy score is " + autoScore);
        standardDeviationPrint(autoScore, 3.85, .73, "autonomy");
        d3.select("body").append("li").text("Your relatedness score is " + relateScore);
        standardDeviationPrint(compScore, 4.22, .69, "relatedness");
    }
    else if(compScore != 0 && autoScore != 0 && relateScore != 0){
        d3.select("body").append("H1").text("RSSM Score for you with your " + relation);
        d3.select("body").append("li").text("Your competence score is " + compScore);
        d3.select("body").append("li").text("Your autonomy score is " + autoScore);
        d3.select("body").append("li").text("Your relatedness score is " + relateScore);
    }
}

function standardDeviationPrint(Score, Mean, SD, type){
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
        d3.select("body").append("p").text("Test was inconclusive or there is an error in the survey. Please contact the web developer.");
    }
    
}