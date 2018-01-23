////////////////////////////////////////////////////////////
//  This file was authored by A. Leah Zulas             ////
//  It heavily utilizes surveyjs.io                     ////
//  It displays a survey and collevcts data             ////
//  It sends data using Ajax, to an express server      ////
//  Any questions about the below code should be sent to:///
//  alzulas@alzulas.com                                 ////
////////////////////////////////////////////////////////////

function CreateAnID (ResultsString) {
    
    //Get rid of the piece of data about the ID true or false, it's not important.
    var ID = "";
    var endOfString = ResultsString.length+1;
//    console.log(endOfString);
//    var startOfString = ResultsString.lastIndexOf("ID")-1;
//    console.log(startOfString);
    ResultsString = ResultsString.slice(18, endOfString);
    ResultsString = "{" + ResultsString;
    //console.log(ResultsString);
    
    if (ResultsString.includes("IDName")){
            //If the person didn't have an ID, take the three pieces of information they gave and create an ID out of it. Then put that in the ID place, and return the string.
        var splitString = ResultsString.split("\",\"");
        //console.log(ResultsString);
        //console.log(splitString);
        var firstName = splitString[0].slice(12, splitString[0].length);
        //console.log(firstName);
        
        var lastName = splitString[1].slice(9, splitString[1].length);
        //console.log(lastName);
        
        var DOB = splitString[2].slice(11, splitString[2].length);
        var mm = DOB.slice(0,2);
        var dd = DOB.slice(2,4);
        var yyyy = DOB.slice(4,8);
        //console.log(DOB);
        
        //calculate a special number
        if (firstName.length < 4) {
            ID = ID + firstName[1].toUpperCase();
            ID = ID + firstName[0].toUpperCase();
        }else{
            ID = ID + firstName[3].toUpperCase();
            ID = ID + firstName[1].toUpperCase();
        }
        ID = ID + lastName[lastName.length - 1].toUpperCase();
        ID = ID + lastName[lastName.length - 2].toUpperCase();
        
        moduloNumber = (mm * dd * yyyy)%10000;
        //console.log("Mod: " + moduloNumber);
        ID = ID + moduloNumber;
        //console.log("ID: " + ID);
        
        //location of the end of the DOB response. Slice to there. Add { ID: and the ID number
        var position = ResultsString.indexOf("IDNumber");
        position = position + 19;
        ResultsString = ResultsString.slice(position, ResultsString.length);
        ResultsString = "{\"survey\":{\"ID\":\"" + ID + ResultsString + "}";  
        
        //console.log(ResultsString);
        return ResultsString; 
        
    }else {   //take the information if the person already had an ID, delete the section asking if they did, then return.
        ResultsString = "{\"survey\":" + ResultsString + "}";
        return ResultsString;  
    }
}

function fixSurveyString(surveyString){
    var newIDAttempt
    if (surveyString.includes("ID")) {
        //Set a cookie with the user ID
        var pos = surveyString.indexOf("ID");
        pos = pos + "ID".length + 3;
        var tempString = surveyString[pos];
        pos++;
        while (surveyString[pos] !== "\"") {
            tempString += surveyString[pos];
            pos++;
        }   
    }
    while(dataPassed !== undefined){
        newIDAttempt = tempString + (Math.floor((Math.random() * 100) + 1));

        var dataPassed = undefined;
        $.ajax({
            type: "GET",
            url: "/BISresult/" + newIDAttempt,
            async: false,
            success: function (dataPassed) {
                console.log("data passed = " + dataPassed);
                console.log("Get request complete"); //verification that the data was retreieved.
            }
        });
    }
    var endOfString = ResultsString.length+1;
    var position = ResultsString.indexOf("ID");
    position = position + 5;
    ResultsString = ResultsString.slice(position, ResultsString.length);
    ResultsString = "{\"survey\":{\"ID\":\"" + newIDAttempt + ResultsString;  
    console.log("Result string in the fixer : " + ResultsString);
    
    return surveyString;
}

function postAndMoveOn(surveyString){
    $.ajax({
        type: "POST",
        url: "/result",
        async: false,
        data: surveyString,
        success: function (data) {
            if (data === 'done') {
                alert("Data send successful");
            }
        },
        contentType: "application/json"
    });
    window.location.href = "BISBASResults.html";
}

function init() {
    var MyTextValidator = (function (_super) {
    Survey.__extends(MyTextValidator, _super);
    function MyTextValidator() {
        _super.call(this);
    }
    MyTextValidator.prototype.getType = function () {
        return "mytextvalidator";
    };
    MyTextValidator.prototype.validate = function (value, name) {
        if (isNaN(value)) {
            //report an error
            return new Survey.ValidatorResult(null, new Survey.CustomError(this.getErrorText(name)));
        }else if (value.length !== 8){
            return new Survey.ValidatorResult(null, new Survey.CustomError(this.getErrorText(name)));
        }
        //return Survey.ValidatorResult object if you want to correct the entered value
        // return new Survey.ValidatorResult(youCorrectedValue);
        //return nothing if there is no any error.
        return null;
    };
    //the default error text. It shows if user do not set the 'text' property
    MyTextValidator.prototype.getDefaultErrorText = function (name) {
        return "Your entry should contain only eight numbers.";
    }
        return MyTextValidator;
    })(Survey.SurveyValidator);
    Survey.MyTextValidator = MyTextValidator;
    //add into survey Json metaData
    //
    
    Survey
        .JsonObject
        .metaData
        .addClass("mytextvalidator", [], function () {
            return new MyTextValidator();
        }, "surveyvalidator");
   
    //This is the JSON with all the questions and format in it
    var jsonBegin = {
        //Sets a title bar for the whole survey and a progress bar.
        triggers: [
        {
            type: "visible",
            name: "IDCheck",
            operator: "equal",
            value: "True",
            questions: ["ID"]
        }, {
            type: "visible",
            name: "IDCheck",
            value: "False",
            questions: ["HowToID", "IDName", "IDLast", "IDNumber"]
        }],
           
        title: " The BIS-BAS.",
        showProgressBar: "top",
        pages: [
            {questions: [
            //html questions are just information. This is a good way to introduce topics. You can use HTML mark up in these sections.
                { type: "html", name: "introAndDemographics", html: "<h2 class=\"post-title\"> Welcome to the behavioural inhibition system (BIS) and the behavioural activation system (BAS) survey.</h2> <p>General Demographic Questions.</p> <p> Remember: If at any time you feel that the text or options are too small you can hit Ctrl and the + sign in Windows or command and + in Mac on your keyboard to increase the fonts on the screen. This is an accessability feature available on all major browsers and most websites! (Note that ctrl - or command - will reduce the font sizes.) </p>"},
            
                //Checking if participant has a unique ID
                { type: "radiogroup",
                name: "IDCheck",
                title: "I was given a unique ID to take this survey", isRequired: true,
                choices: ["True", "False"]
                },
                
                //Text questions take text responses. Here, we want to know the participants ID number.
                { type: "text", name: "ID", title: "Please enter your identifying code here.", isRequired: true,
                 //visibleIf: "{IDCheck} contains 'True'",
                 visible: false, size: 15, width: "4"},
                
                { type: "html", name: "HowToID", 
                 //visibleIf: "{IDCheck} contains 'False'",
                 visible: false, html: "This section will ask you a series of questions to create a unique ID for you. None of this information will be saved by the system, but will only be used to create your number. If you give the same info each time, you will always get the same ID number, but it will be impossible for someone who has your ID number to identify you with that number."
                },
                
                //Asking various questions that will be used to create an ID
                { type: "text", name: "IDName", title: "Please enter your first name.", isRequired: true,
                 //visibleIf: "{IDCheck} contains 'False'", 
                 visible: false, size: 15, width: "4"},
                
                { type: "text", name: "IDLast", title: "Please enter your mothers maiden name.", isRequired: true,
                 //visibleIf: "{IDCheck} contains 'False'", 
                 visible: false, size: 15, width: "4"},
                
                { type: "text", name: "IDNumber", title: "Create a large number by entering your date of birth without dashes or spaces. An example would be 01041980. The number can be in whichever order you normally display numbers.", isRequired: true,
                 //visibleIf: "{IDCheck} contains 'False'", 
                 visible: false, size: 15, width: "4", validators: [
                        {
                            type: "mytextvalidator"
                        }
                    ]},
                

                //Radio groups are radio button questions. They accept a single answer. this is the gender question.
                { type: "radiogroup", name: "gender", title: "My biological sex is...", colCount: 0, choices: ["Male", "Female", "Intersex"]}
            ]},
        //By calling "question" again, we make the model inside the website page go to the next section of the questionnaire. The above questions will disappear and be replaced by these next questions.
            { questions: [
                 
                //Another radio group. This time for age. 
                {type: "radiogroup", name: "age", colCount: 3, title: "What is your age?", choices: ["16-|16 years and below", "23-30|23-30 years old", "65-74|65-74 years old", "17-19|17-19 years old", "31-45|31-45 years old", "75+|75 years and older", "20-22|20-22 years old", "46-64|46-64 years old"]}
            ]},
        
            { questions: [
                
                //Check box questions allow for multiple answers. This one is about race.
                {type: "checkbox", name: "race", title: "Choose one or more races that you consider yourself to be:", colCount: 3, hasOther: true, choices: ["White", "Black or African American", "American Indian or Alaska Native", "Asian", "Native Hawaiian or Pacific Islander", "Spanish, Hispanic, or Latino"]}
            ]},
        
            { questions: [
                
                //Check box about employment status.
                {type: "checkbox", name: "employment", title: "Are you currently... ?", colCount: 3, hasOther: true, choices: ["A college student", "Employed for wages", "Self-employed", "Out of work and looking for work", "Out of work but not currently looking for work", "A homemaker", "Military", "Retired", "Unable to work"]}
            ]},
        
            {questions: [
                
              //This HTML introduces the next section. 
                { type: "html", name: "info", html: "<p>Each of the items on this page is a statement that a person may either agree with or disagree with. For each item, indicate how much you agree with or disagree with what the item says. Please respond to all the items; do not leave any blank. Choose only one response to each statement. Please be as accurate and honest as you can be. Respond to each item as if it were the only item. That is, don't worry about being \"consistent\" in your responses."}
            ]},
            
            {questions: [
                
                //A matrix question is a set of questions using a likert or likert-like scale. So the scale goes across the top (columns), and the questions allong the side(rows). Values will be useful in the final data set. Text is what is visible to the participant.  
                { type: "matrix", name: "Quality", title: "Please respond to the following.",
                    columns: [{ value: 1, text: "Very true for me" },
                        { value: 2, text: "Somewhat true for me" },
                        { value: 3, text: "Somewhat false for me" },
                        { value: 4, text: "Very false for me" }],
                    rows: [{ value: "filler1", text: "A person's family is the most important thing in life." },
                        { value: "BIS1", text: "Even if something bad is about to happen to me, I rarely experience fear or nervousness." },
                        { value: "BASDrive1", text: "I go out of my way to get things I want." },
                        { value: "BASReward1", text: "When I'm doing well at something I love to keep at it." },
                        { value: "BASFun1", text: "I'm always willing to try something new if I think it will be fun." },
                        { value: "filler2", text: "How I dress is important to me." }]}
            ]},
            
            {questions: [
                
                { type: "matrix", name: "Quality", title: "Please respond to the following.",
                    columns: [{ value: 1, text: "Very true for me" },
                        { value: 2, text: "Somewhat true for me" },
                        { value: 3, text: "Somewhat false for me" },
                        { value: 4, text: "Very false for me" }],
                    rows: [
                        { value: "BASReward2", text: "When I get something I want, I feel excited and energized." },
                        { value: "BIS2", text: "Criticism or scolding hurts me quite a bit." },
                        { value: "BASDrive2", text: "When I want something I usually go all-out to get it." },
                        { value: "BASFun2", text: "I will often do things for no other reason than that they might be fun." },
                        { value: "filler3", text: "It's hard for me to find the time to do things such as get a haircut." },
                        { value: "BASDrive3", text: "If I see a chance to get something I want I move on it right away." }]}
            ]},
            
            {questions: [
                
                
                { type: "matrix", name: "Quality", title: "Please respond to the following.",
                    columns: [{ value: 1, text: "Very true for me" },
                        { value: 2, text: "Somewhat true for me" },
                        { value: 3, text: "Somewhat false for me" },
                        { value: 4, text: "Very false for me" }],
                    rows: [
                        { value: "BIS3", text: "I feel pretty worried or upset when I think or know somebody is angry at me." },
                        { value: "BASReward3", text: "When I see an opportunity for something I like I get excited right away." },
                        { value: "BASFun3", text: "I often act on the spur of the moment." },
                        { value: "BIS4", text: "If I think something unpleasant is going to happen I usually get pretty \"worked up.\"" },
                        { value: "filler4", text: "I often wonder why people act the way they do." },
                        { value: "BASReward4", text: "When good things happen to me, it affects me strongly." }]}
            ]},
            
            {questions: [
                
                
                { type: "matrix", name: "Quality", title: "Please respond to the following.",
                    columns: [{ value: 1, text: "Very true for me" },
                        { value: 2, text: "Somewhat true for me" },
                        { value: 3, text: "Somewhat false for me" },
                        { value: 4, text: "Very false for me" }],
                    rows: [
                        { value: "BIS5", text: "I feel worried when I think I have done poorly at something important." },
                        { value: "BASFun4", text: "I crave excitement and new sensations." },
                        { value: "BASDrive4", text: "When I go after something I use a \"no holds barred\" approach." },
                        { value: "BIS6", text: "I have very few fears compared to my friends." },
                        { value: "BASReward5", text: "It would excite me to win a contest." },
                        { value: "BIS7", text: "I worry about making mistakes." }]}
            ]}
        ]
    };
    
    //Used for debugging
    console.log(jsonBegin);
    
    //Some Bootstrappy stuff that makes it look better, style choices
    Survey.defaultBootstrapCss.navigationButton = "btn btn-primary";
    Survey.Survey.cssType = "bootstrapmaterial";
    Survey.Survey.cssType = "bootstrap";

    //Load the above JSON information into the survey model
    var model = new Survey.Model(jsonBegin);
    window.survey = model;
    
    //When you get results, turn them into a string and submit
    survey.onComplete.add(function (result) {
        document.querySelector('#surveyResult').innerHTML = "result: " + JSON.stringify(result.data);
        var surveyResult;
        var surveyString = JSON.stringify(result.data);
        surveyString = CreateAnID(surveyString);
        //Send results to the server, type of content is json
        //surveyResult = result.data;
        //console.log(JSON.stringify({survey: surveyResult}));
        if (surveyString.includes("ID")) {
            //Set a cookie with the user ID
            var pos = surveyString.indexOf("ID");
            pos = pos + "ID".length + 3;
            var tempString = surveyString[pos];
            pos++;
            while (surveyString[pos] !== "\"") {
                tempString += surveyString[pos];
                pos++;
            }
            var d = new Date();
            d.setTime(d.getTime() + (1 * 24 * 60 * 60 * 1000)); //Cookie set to self destruct in a day
            var expires = "expires=" + d.toUTCString();
            document.cookie = "userName=" + tempString + ";" + expires;
            
        }
        var holdMyData;
        var dataPassed;
        $.ajax({
            type: "GET",
            url: "/BISresult/" + tempString,
            async: false,
            success: function (dataPassed) {
                console.log("data passed = " + dataPassed);
                holdMyData = dataPassed;
                console.log("Get request complete"); //verification that the data was retreieved.
            }
        });
        console.log(holdMyData)
        if(holdMyData === undefined) {
            postAndMoveOn(surveyString);
        } else {
            if (confirm("You have entered an ID that already exists. Clicking OK will modify your current ID so it can be saved uniquely. If you do not wish to do this, hit Cancel and you will be forwarded to the results page and shown the perviously entered data.")) {
                surveyString = fixSurveyString(surveyString);
                postAndMoveOn(surveyString);
                console.log("You pressed OK!");
            } else {
                window.location.href = "BISBASResults.html";
                console.log("You pressed Cancel!");
            }
            //document.getElementById("demo").innerHTML = txt;
        }
    });
    $("#surveyElement").Survey({model: model});
    
}

//This is just the way js works. There is a thing asking if the page came up properly, and if so then run the init above. 
if (!window["%hammerhead%"]) {
    //console.log("begin"); //debugging code
    init();
}

