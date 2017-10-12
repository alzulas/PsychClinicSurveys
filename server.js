var express        =         require("express");
var bodyParser     =         require("body-parser");
var app            =         express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('.'));

app.get('/',function(req,res){
  res.sendfile("index.html");
});
app.get('/RSSM.html',function(req,res){
  res.sendfile("RSSM.html");
});
app.get('/RSSM.js',function(req,res){
  res.sendfile("RSSM.js");
});
app.get('/BISBAS.html',function(req,res){
  res.sendfile("BISBAS.html");
});
app.get('/BISBAS.js',function(req,res){
  res.sendfile("BISBAS.js");
});
app.get('/BISBASResults.html',function(req,res){
  res.sendfile("BISBASResults.html");
});
app.get('/BISBASResults.js',function(req,res){
  res.sendfile("BISBASResults.js");
});
app.get('/BISresult/:myid', function (req, res) {
  console.log(req.params.myid);
  var myid = req.params.myid;
  var fs = require('fs');
  var IDfound = false;
  var currentLine = 0;
  var linesOfFile = fs.readFileSync('BISBAS.csv').toString().split("\n");
  while (!IDfound){
    var tempLine = linesOfFile[currentLine];
    if (tempLine.includes(myid)){
        res.send(tempLine);
        IDfound = true;
    }
    else{
        currentLine++;
    }
  } 
})


app.post('/',function(req,res){
  var surveyResult=req.body.survey;
  console.log("Results = "+JSON.stringify(surveyResult));
  res.end("yes");
  turnToCSV(surveyResult);
});
app.listen(3000,function(){
  console.log("Started on PORT 3000");
})

function turnToCSV(dataString){
    var relationship = ["Mother", "Father", "Romantic Partner", "Ex-Romantic Partner", "Sibling", "Close Friend"];
    
    var RSSMHeadings =["ID","gender","age","race","employment","marritalStatus","relativeTyperel0","thoughtsrel0","competence1rel0","autonomy1rel0","relatedness1rel0","compentence2rel0","autonomy2rel0","relatedness2rel0","competentce3rel0","autonomy3rel0","relatedness3rel0","compentence4rel0","autonomy4rel0","relatedness4rel0","valencerel0","relativeTyperel1","thoughtsrel1","competence1rel1","autonomy1rel1","relatedness1rel1","compentence2rel1","autonomy2rel1","relatedness2rel1","competentce3rel1","autonomy3rel1","relatedness3rel1","compentence4rel1","autonomy4rel1","relatedness4rel1","valencerel1","relativeTyperel2","thoughtsrel2","competence1rel2","autonomy1rel2","relatedness1rel2","compentence2rel2","autonomy2rel2","relatedness2rel2","competentce3rel2","autonomy3rel2","relatedness3rel2","compentence4rel2","autonomy4rel2","relatedness4rel2","valencerel2","relativeTyperel3","thoughtsrel3","competence1rel3","autonomy1rel3","relatedness1rel3","compentence2rel3","autonomy2rel3","relatedness2rel3","competentce3rel3","autonomy3rel3","relatedness3rel3","compentence4rel3","autonomy4rel3","relatedness4rel3","valencerel3","relativeTyperel4","thoughtsrel4","competence1rel4","autonomy1rel4","relatedness1rel4","compentence2rel4","autonomy2rel4","relatedness2rel4","competentce3rel4","autonomy3rel4","relatedness3rel4","compentence4rel4","autonomy4rel4","relatedness4rel4","valencerel4","relativeTyperel5","thoughtsrel5","competence1rel5","autonomy1rel5","relatedness1rel5","compentence2rel5","autonomy2rel5","relatedness2rel5","competentce3rel5","autonomy3rel5","relatedness3rel5","compentence4rel5","autonomy4rel5","relatedness4rel5","valencerel5"];

    var BISBASHeadings = ["ID","gender","age","race","employment","BIS1","BIS2","BIS3","BIS4","BIS5","BIS6","BIS7","BASDrive1","BASDrive2","BASDrive3","BASDrive4","BASReward1","BASReward2","BASReward3","BASReward4","BASReward5","BASFun1","BASFun2","BASFun3","BASFun4"];

    var allDataAsString = JSON.stringify(dataString);
    //Data string must be parsed correctly.
    var dataHeadings;
    if (allDataAsString.includes("BIS")){
        dataHeadings = BISBASHeadings;
    }
    else if (allDataAsString.includes("relativeType")){
        dataHeadings = RSSMHeadings;
    }
    else{
        console.log("FAILED TO LOAD DATA TYPES!");
    }
    var relationshipHeading = 0;
    var fileName;
    var csv = [];
    for (i = 0; i < dataHeadings.length; i++)
    {
        if (allDataAsString.includes(dataHeadings[i])){
            var pos = allDataAsString.indexOf(dataHeadings[i]);
            var beginPosition = pos+dataHeadings[i].length+2;
            if (allDataAsString[beginPosition]=="["){
                //console.log("bracket");
                var tempString = allDataAsString[beginPosition];
                beginPosition++;
                while (allDataAsString[beginPosition] != "]"){
                    if (allDataAsString[beginPosition] == "\""){
                        tempString += "";
                    }
                    else if (allDataAsString[beginPosition] == ","){
                        tempString += " & ";
                    }
                    else{
                        tempString += allDataAsString[beginPosition];
                    }
                    beginPosition++;    
                }
                tempString += "]";
                console.log("brackets temp string: " + tempString);
                csv.push(tempString);
            }
            else if (allDataAsString[beginPosition]=="\""){
                //console.log("quotes");
                var tempString = allDataAsString[++beginPosition];
                beginPosition++;
                while (allDataAsString[beginPosition] != "\""){
                    tempString += allDataAsString[beginPosition];
                    beginPosition++;
                }
                //tempString += "],";
                console.log("quotes temp string: " + tempString);
                if (dataHeadings=="ID"){
                    fileName = tempString;
                }
                csv.push(tempString);
            }
            else{
                console.log("ERROR IN DATA LOGGING");
            }
        }
        else if(dataHeadings[i].includes("relativeType")){
            csv.push(relationship[relationshipHeading]);
            relationshipHeading++;
        }
        else{
            csv.push("");
        }
    }
    csv.push("\n");
    console.log(csv);
    if (allDataAsString.includes("BIS")){
        var fs = require('fs');
        fs.appendFile("BISBAS.csv", csv, function(err) {
            if(err) {
                return console.log(err);
            }
        console.log("The file was saved!");
        });
    }
    else if (allDataAsString.includes("relativeType")){
        var fs = require('fs');
        fs.appendFile("RSSM.csv", csv, function(err) {
            if(err) {
                return console.log(err);
            }
        console.log("The file was saved!");
        });
    }
    else{
        console.log("FAILED TO SAVE!");
    } 
}
  