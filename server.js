////////////////////////////////////////////////////////////
//  This file was authored by A. Leah Zulas             ////
//  It creates an express server                        ////
//  The server takes data after the servey is complete  ////
//  It creates a CSV and then delivers data from that CSV///
//      back to be visualized for the participant       ////
//  Any questions about the below code should be sent to:///
//  alzulas@alzulas.com                                 ////
////////////////////////////////////////////////////////////

//Important for setting up express
var express        =         require("express");
var bodyParser     =         require("body-parser");
var app            =         express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('.'));


//Requesting data to visualize BISBAS results
app.get('/BISresult/:myid', function (req, res) {
  //console.log(req.params.myid);
    var myid = req.params.myid;
    var fs = require('fs');
    var IDfound = false;
    var currentLine = 0;
    //read file
    var linesOfFile = fs.readFileSync('BISBAS.csv').toString().split("\n");
    while (!IDfound) { //find ID
        var tempLine = linesOfFile[currentLine];
        if (tempLine.includes(myid)) {
            res.send(tempLine);
            IDfound = true; //If ID is found, that's the line we want. Send it out.
        } else if (tempLine === "") {
            IDfound = true;
            console.log("ID NOT FOUND");
        } else {
            currentLine++; //If not, then next line
        }
    }
});

//Same as above
app.get('/RSSMresult/:myid', function (req, res) {
  //console.log(req.params.myid);
    var myid = req.params.myid;
    var fs = require('fs');
    var IDfound = false;
    var currentLine = 0;
    var linesOfFile = fs.readFileSync('RSSM.csv').toString().split("\n");
    while (!IDfound) {
        var tempLine = linesOfFile[currentLine];
        if (tempLine.includes(myid)) {
            res.send(tempLine);
            IDfound = true;
            console.log("ID found");
        } else if (tempLine === "") {
            IDfound = true;
            console.log("ID NOT FOUND");
        } else {
            currentLine++;
        }
    }
});

//Take result of survey, put it into csv.
app.post('/result', function (req, res) {
    var surveyResult = req.body.survey;
    console.log("Results = " + JSON.stringify(surveyResult));
    res.end("yes");
    turnToCSV(surveyResult);
});

//server listens for requests on PORT 3000
app.listen(3000, function () {
    console.log("Started on PORT 3000");
});

//Function to turn data from website into CSV 
function turnToCSV(dataString) {
    //List needed to add which relationship each group of answers is
    var relationship = ["Mother", "Father", "Romantic Partner", "Ex-Romantic Partner", "Sibling", "Close Friend", "name1", "name2", "name3", "name4"];
    
    //All of the various points we're trying to track for RSSM
    var RSSMHeadings = ["ID", "gender", "age", "race", "employment", "marritalStatus", "relativeTyperel0", "thoughtsrel0", "competence1rel0", "autonomy1rel0", "relatedness1rel0", "compentence2rel0", "autonomy2rel0", "relatedness2rel0", "competentce3rel0", "autonomy3rel0", "relatedness3rel0", "compentence4rel0", "autonomy4rel0", "relatedness4rel0", "valencerel0", "relativeTyperel1", "thoughtsrel1", "competence1rel1", "autonomy1rel1", "relatedness1rel1", "compentence2rel1", "autonomy2rel1", "relatedness2rel1", "competentce3rel1", "autonomy3rel1", "relatedness3rel1", "compentence4rel1", "autonomy4rel1", "relatedness4rel1", "valencerel1", "relativeTyperel2", "thoughtsrel2", "competence1rel2", "autonomy1rel2", "relatedness1rel2", "compentence2rel2", "autonomy2rel2", "relatedness2rel2", "competentce3rel2", "autonomy3rel2", "relatedness3rel2", "compentence4rel2", "autonomy4rel2", "relatedness4rel2", "valencerel2", "relativeTyperel3", "thoughtsrel3", "competence1rel3", "autonomy1rel3", "relatedness1rel3", "compentence2rel3", "autonomy2rel3", "relatedness2rel3", "competentce3rel3", "autonomy3rel3", "relatedness3rel3", "compentence4rel3", "autonomy4rel3", "relatedness4rel3", "valencerel3", "relativeTyperel4", "thoughtsrel4", "competence1rel4", "autonomy1rel4", "relatedness1rel4", "compentence2rel4", "autonomy2rel4", "relatedness2rel4", "competentce3rel4", "autonomy3rel4", "relatedness3rel4", "compentence4rel4", "autonomy4rel4", "relatedness4rel4", "valencerel4", "relativeTyperel5", "thoughtsrel5", "competence1rel5", "autonomy1rel5", "relatedness1rel5", "compentence2rel5", "autonomy2rel5", "relatedness2rel5", "competentce3rel5", "autonomy3rel5", "relatedness3rel5", "compentence4rel5", "autonomy4rel5", "relatedness4rel5", "valencerel5", "relativeTyperel6", "name1", "competence1rel6", "autonomy1rel6", "relatedness1rel6", "compentence2rel6", "autonomy2rel6", "relatedness2rel6", "competentce3rel6", "autonomy3rel6", "relatedness3rel6", "compentence4rel6", "autonomy4rel6", "relatedness4rel6", "valencerel6", "relativeTyperel7", "name2", "competence1rel7", "autonomy1rel7", "relatedness1rel7", "compentence2rel7", "autonomy2rel7", "relatedness2rel7", "competentce3rel7", "autonomy3rel7", "relatedness3rel7", "compentence4rel7", "autonomy4rel7", "relatedness4rel7", "valencerel7", "relativeTyperel8", "name3", "competence1rel8", "autonomy1rel8", "relatedness1rel8", "compentence2rel8", "autonomy2rel8", "relatedness2rel8", "competentce3rel8", "autonomy3rel8", "relatedness3rel8", "compentence4rel8", "autonomy4rel8", "relatedness4rel8", "valencerel8", "relativeTyperel9", "name4", "competence1rel9", "autonomy1rel9", "relatedness1rel9", "compentence2rel9", "autonomy2rel9", "relatedness2rel9", "competentce3rel9", "autonomy3rel9", "relatedness3rel9", "compentence4rel9", "autonomy4rel9", "relatedness4rel9", "valencerel9"];

    //All data we are trying to track for BISBAS
    var BISBASHeadings = ["ID", "gender", "age", "race", "employment", "BIS1", "BIS2", "BIS3", "BIS4", "BIS5", "BIS6", "BIS7", "BASDrive1", "BASDrive2", "BASDrive3", "BASDrive4", "BASReward1", "BASReward2", "BASReward3", "BASReward4", "BASReward5", "BASFun1", "BASFun2", "BASFun3", "BASFun4"];
    
    //turn JSON into a string
    //console.log(dataString);
    var allDataAsString = JSON.stringify(dataString);
    //console.log(allDataAsString);
    //Data string must be parsed correctly.
    var dataHeadings;
    //if it's BISBAS, use those headings, if RSSM, use those, Else call failure
    if (allDataAsString.includes("BIS")) {
        dataHeadings = BISBASHeadings;
    } else if (allDataAsString.includes("thoughts")) {
        dataHeadings = RSSMHeadings;
    } else {
        console.log("FAILED TO LOAD DATA TYPES!");
    }
    //Where am I in relationships
    var relationshipHeading = 0;
    var fileName;
    var csv = [];
    //go through all the data headings we set earlier
    for (var i = 0; i < dataHeadings.length; i++) {
        //If the string includes the heading we are looking for
            if (allDataAsString.includes(dataHeadings[i])){
                //Find the position of that heading
                var pos = allDataAsString.indexOf(dataHeadings[i]);
                //Find the beginning of the data I want
                var beginPosition = pos+dataHeadings[i].length+2;
                //If it's a bracket, look for the next bracket
                if (allDataAsString[beginPosition]=="["){
                    //put the first piece of the data into a string
                    var tempString = allDataAsString[beginPosition];
                    beginPosition++;
                    //Then do the entire string until I find the next bracket
                    while (allDataAsString[beginPosition] != "]"){
                        if (allDataAsString[beginPosition] == "\""){
                            tempString += "";
                        //Get rid of JSON nonsense chars
                        } else if (allDataAsString[beginPosition] == ",") {
                            //No commas in the string, because it creates a new piece in the excel file.
                            tempString += " & ";
                        } else {
                            tempString += allDataAsString[beginPosition];
                        }
                    beginPosition++;    
                    }
                //add the final bracket and push onto the CSV array
                tempString += "]";
                csv.push(tempString);
            } else if (allDataAsString[beginPosition]=="\"") {
                //if the first character is a " save the string until the next "
                var tempString = allDataAsString[++beginPosition];
                beginPosition++;
                while (allDataAsString[beginPosition] != "\""){
                    tempString += allDataAsString[beginPosition];
                    beginPosition++;
                }
                //if the data is the ID, set that as the fileName
                if (dataHeadings=="ID"){
                    fileName = tempString;
                }
                //Push onto CSV array
                csv.push(tempString);
            } else {
                //If the addition failed for any reason. 
                console.log("ERROR IN DATA LOGGING");
            }
        } else if(dataHeadings[i].includes("relativeType")) {
            //if the string is a relative type, then push onto the array the relationship from the above list, and go next
            csv.push(relationship[relationshipHeading]);
            relationshipHeading++;
        } else {
            //If none of the above, then the participant didn't answer that question, and push an empty string onto the spot.
            csv.push("");
        }
    }
    //Push a return character, so that the next time we do this, the CSV will start a new line for the new participant
    csv.push("\n");
    
    if (allDataAsString.includes("BIS")){
        //If BIS BAS, put the array into the file BISBAS.csv
        
        var fs = require('fs');
        
        fs.appendFile("BISBAS.csv", csv, function(err) {
            if(err) {
                //If failed, error
                return console.log(err);
            }
        //If not, return a saved log
        console.log("The file was saved!");
        });
    }
    else if (allDataAsString.includes("thoughts")){
        //If RSSM, put the array into the file RSSM.csv
        var fs = require('fs');
        fs.appendFile("RSSM.csv", csv, function(err) {
            if(err) {
                //If failed, error
                return console.log(err);
            }
        //If not, return a saved log
        console.log("The file was saved!");
        });
    }
    else{
        //If anything goes wrong, fail.
        console.log("FAILED TO SAVE!");
    } 
}
  