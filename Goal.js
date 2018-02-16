////////////////////////////////////////////////////////////
//  This file was authored by A. Leah Zulas             ////
//  It heavily utilizes surveyjs.io                     ////
//  It displays a survey and collevcts data             ////
//  If sends data using Ajax, to an express server      ////
//  Any questions about the below code should be sent to:///
//  alzulas@alzulas.com                                 ////
////////////////////////////////////////////////////////////

//************************************************************
//This function creates a unique ID for users who were not given an ID to begin with. 
//************************************************************
function CreateAnID (ResultsString) {
    
    var ID = "";

    //Get rid of the piece of data about the ID true or false, it's not important.
    ResultsString = ResultsString.slice(18, ResultsString.length+1);
    ResultsString = "{" + ResultsString;
    
    //This checks to see if the user needs an idea
    if (ResultsString.includes("IDName")){
        //If the person didn't have an ID, take the three pieces of information they gave and create an ID out of it. Then put that in the ID place, and return the string.
        //Split out the parts you need
        var splitString = ResultsString.split("\",\"");
        var firstName = splitString[0].slice(12, splitString[0].length);
        var lastName = splitString[1].slice(9, splitString[1].length);
        var DOB = splitString[2].slice(11, splitString[2].length);
        var mm = DOB.slice(0,2);
        var dd = DOB.slice(2,4);
        var yyyy = DOB.slice(4,8);
        
        //calculate a special ID
        if (firstName.length < 4) { //If the first name is really short (e.g., Ed), start the ID number with the first two letters of the first name
            ID = ID + firstName[1].toUpperCase();
            ID = ID + firstName[0].toUpperCase();
        }else{//If it's long enough, take the 4th and 2nd letters of the first name
            ID = ID + firstName[3].toUpperCase();
            ID = ID + firstName[1].toUpperCase();
        }
        //Then use the mother's maiden name, but just take the last two letters of the name
        ID = ID + lastName[lastName.length - 1].toUpperCase();
        ID = ID + lastName[lastName.length - 2].toUpperCase();
        
        //Then multiply the day, month, and year of DOB together, mod by 10,000. This gives a pretty random 3 digit number.  Add that onto the ID. 
        moduloNumber = (mm * dd * yyyy)%10000;
        ID = ID + moduloNumber;
        
        //location of the end of the DOB response. Slice to there. Add { ID: and the ID number
        var position = ResultsString.indexOf("IDNumber");
        position = position + 19;
        ResultsString = ResultsString.slice(position, ResultsString.length);
        ResultsString = "{\"survey\":{\"ID\":\"" + ID + ResultsString + "}";  
        
        //Returned fixed string
        return ResultsString; 
        
    }else {   //take the information if the person already had an ID, delete the section asking if they did, then return.
        ResultsString = "{\"survey\":" + ResultsString + "}";
        return ResultsString;  
    }
}

//************************************************************
//This function will fix an ID number if there is a collision (i.e., the ID already exists) and the use would like to not override the current data.
//************************************************************
function fixSurveyString(surveyString){
    var newIDAttempt
    
    //Find the ID number
    if (surveyString.includes("ID")) {
        //Find it's location and pull out the current ID
        var pos = surveyString.indexOf("ID");
        pos = pos + "ID".length + 3;
        var tempString = surveyString[pos];
        pos++;
        while (surveyString[pos] !== "\"") {
            tempString += surveyString[pos];
            pos++;
        }   
    }
    var holdMyData; //This has to exist, because dataPassed will become undefined once it's outside of the ajax request. This literally just holds the data so that it can be accessed outside of the call.
    var dataPassed;
    do {
        //Take the current ID and add on random number somewhere between 1 and 100. Math.random in JS returns a number between 0 and 1, but *100 and flooring the number allows it to be a whole number between 1 and 100. 
        newIDAttempt = tempString + (Math.floor((Math.random() * 100) + 1));
        
        //ajax call to the surver to see if the new ID exists somewhere in the list. This is a long call. The .csv is not a hashed database, so it's difficult to search. It's literally checking in O(n) time. The larger this csv becomes, the longer this check will take. 
        $.ajax({
            type: "GET",
            url: "/GOALresult/" + newIDAttempt,
            async: false,
            success: function (dataPassed) {
                //dataPassed saved in a variable that will continue outside of the call.
                holdMyData = dataPassed;
                console.log("Get request complete"); //verification that the data was retreieved.
            }
        });
    } while(holdMyData !== '');//continue to do this until "holdMyData" is empty. If it is empty, that means that the call returned nothing and the ID did not exist on the server
    
    //Find the location of the beginning of the important information.
    //Delete everything before that. Replace it with the new stuff. 
    var position = surveyString.indexOf("ID");
    position = position + 4;
    surveyString = surveyString.slice(position, surveyString.length);
    position = surveyString.indexOf(",");
    surveyString = surveyString.slice(position, surveyString.length);
    surveyString = "{\"survey\":{\"ID\":\"" + newIDAttempt + "\"" + surveyString;  
    
    //reset the cookie to the new ID
    var d = new Date();
    d.setTime(d.getTime() + (1 * 24 * 60 * 60 * 1000)); //Cookie set to self destruct in a day
    var expires = "expires=" + d.toUTCString();
    document.cookie = "userName=" + newIDAttempt + ";" + expires;
    
    //return the new string
    return surveyString;
}

//************************************************************
//This section posts the data to the server. 
//************************************************************
function postAndMoveOn(surveyString){
    //post data
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
    //go to the results page
    window.location.href = "GoalResults.html";
}

//************************************************************
//Everything else json ext
//************************************************************

function init(goals) {
    //Validator looks to make sure that when you enter in the ID it's 8 characters long and only numbers. It has very specific text to set it up. Just don't touch it. 
    var MyTextValidator = (function (_super) {
    Survey.__extends(MyTextValidator, _super);
    function MyTextValidator() {
        _super.call(this);
    }
    MyTextValidator.prototype.getType = function () {
        return "mytextvalidator";
    };
    MyTextValidator.prototype.validate = function (value, name) {
        if (isNaN(value)) {//If it's Not a Number (NaN)
            //report an error
            return new Survey.ValidatorResult(null, new Survey.CustomError(this.getErrorText(name)));
        }else if (value.length !== 8){ //If it's not exactly 8 characters long report an error
            return new Survey.ValidatorResult(null, new Survey.CustomError(this.getErrorText(name)));
        }
        //return nothing if there is no any error.
        return null;
    };
    //the default error text. It shows if user do not set the ID text property
    MyTextValidator.prototype.getDefaultErrorText = function (name) {
        return "Your entry should contain only eight numbers.";
    }
        return MyTextValidator;
    })(Survey.SurveyValidator);
    Survey.MyTextValidator = MyTextValidator;
    
    //add validator into survey Json metaData
    Survey
        .JsonObject
        .metaData
        .addClass("mytextvalidator", [], function () {
            return new MyTextValidator();
        }, "surveyvalidator");
    
    var subtext = ["(e.g. drive to Walmarts to do my shift, go to school to get a degree, try to impress my boss, invest money in stocks, etc.)", "", "(with boyfriend/girlfriend, husband/wife, love, and intimacy)", "(with family, relatives, friends, acquaintances)", "(e.g., want to be less depressed, happier, more honest, etc.)", "", "(e.g., want to lose weight, manage my diabetes, be more fit, etc.)", "(learn how to play tennis, the guitar, read )", ""];

    //This is the JSON with all the questions and format in it
    var jsonBegin = {
        
        //These triggers show the right next questions depending on how users respond to the "Do I have an ID" question.
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
        
        //Sets a title bar for the whole survey and a progress bar.
        title: "Goals Measure",
        showProgressBar: "top",
        pages: [
            {
                //how to create a unique identifier 
                questions: [
              
                    //html questions are just information. This is a good way to introduce topics. You can use HTML mark up in these sections.
                    { type: "html", name: "introAndDemographics", html: "<h2 class=\"post-title\">Welcome to the Goals Measure.</h2> <p>General Demographic Questions.</p> <p> Remember: If at any time you feel that the text or options are too small you can hit Ctrl and the + sign in Windows or command and + in Mac on your keyboard to increase the fonts on the screen. This is an accessability feature available on all major browsers and most websites! (Note that ctrl - or command - will reduce the font sizes.) </p>"},
            
            
                   //Checking if participant has a unique ID
                { type: "radiogroup",
                name: "IDCheck",
                title: "I was given a unique ID to take this survey", isRequired: true,
                choices: ["True", "False"]
                },
                
                //Text questions take text responses. Here, we want to know the participants ID number.
                { type: "text", name: "ID", title: "Please enter your identifying code here.", isRequired: true,
                 visible: false, size: 15, width: "4"},
                
                { type: "html", name: "HowToID", 
                 visible: false, html: "This section will ask you a series of questions to create a unique ID for you. None of this information will be saved by the system, but will only be used to create your number. If you give the same info each time, you will always get the same ID number, but it will be impossible for someone who has your ID number to identify you with that number."
                },
                
                //Asking various questions that will be used to create an ID
                { type: "text", name: "IDName", title: "Please enter your first name.", isRequired: true,
                 visible: false, size: 15, width: "4"},
                
                { type: "text", name: "IDLast", title: "Please enter your mothers maiden name.", isRequired: true, visible: false, size: 15, width: "4"},
                
                { type: "text", name: "IDNumber", title: "Create a large number by entering your date of birth without dashes or spaces. An example would be 01041980. The number can be in whichever order you normally display numbers.", isRequired: true,
                 visible: false, size: 15, width: "4", validators: [
                        {
                            type: "mytextvalidator"
                        }
                    ]},
                
            
                    //Radio groups are radio button questions. They accept a single answer. this is the gender question.
                { type: "radiogroup", name: "gender", title: "My biological sex is...", colCount: 0, width: "4", choices: ["Male", "Female", "Intersex"]
                }
                ]
            },
            //By calling "question" again, we make the model inside the website page go to the next section of the questionnaire. The above questions will disappear and be replaced by these next questions.
            { questions: [
            
                
                //Another radio group. This time for age. 
                {type: "radiogroup", name: "age", colCount: 4, title: "What is your age?", choices: ["16-|16 years and below", "23-30|23-30 years old", "65-74|65-74 years old", "17-19|17-19 years old", "31-45|31-45 years old", "75+|75 years and older", "20-22|20-22 years old", "46-64|46-64 years old"]
                    }
            ]},
            {
                questions: [
                //Check box questions allow for multiple answers. This one is about race.
                    {type: "checkbox", name: "race", title: "Choose one or more races that you consider yourself to be:", colCount: 3, hasOther: true, choices: ["White", "Black or African American", "American Indian or Alaska Native", "Asian", "Native Hawaiian or Pacific Islander", "Spanish, Hispanic, or Latino"]}
                ]
            },
            { questions: [
            //Check box about employment status.
                {type: "checkbox", name: "employment", title: "Are you currently... ?", colCount: 3, hasOther: true, choices: ["A college student", "Employed for wages", "Self-employed", "Out of work and looking for work", "Out of work but not currently looking for work", "A homemaker", "Military", "Retired", "Unable to work"]}
            ]},
        
            { questions: [
            //Radio button question about marrital status
                {type: "radiogroup", name: "marritalStatus", title: "Are you never married, now married, widowed, divorced, or separated?", colCount: 0, choices: ["Never married", "Married", "Widowed", "Divorced", "Separated"]}
            ]},
            
            {questions: [
              //This HTML introduces the next section. 
                { type: "html", name: "info", html: "<p> Most of us have goals--situations, conditions, states we are trying to make happen in the future.  In this measure, you will identify and describe the most important goals that you have had, that you are typically or characteristically trying to make happen.</p><p>Do not write down new goals that you create just for the purpose of this measure.  Only write down goals that have been on your mind before now, that you have already been directing effort towards and acting upon.</p><p> To help you identify your most important goals, you will first complete a brainstorming exercise.</p><p>"}
            ]},
            
            {questions: [
                { type: "html", name: "info", html: "<b>Brainstorming</b></p><p> To help you identify your most important goals, you will first reflect on what you typically do in different life areas or domains.  After you reflect on what you are typically doing, you will then be asked if you have a goal in that life area, and if so, to describe that goal.</p>"},
                { type: "html", name: "title", html: "<b>" + goals[0] + "</b>"
                },
                {
                type: "comment",
                name: "work",
                title: "First, describe what you typically do that is related to making money, work, job, or career.  What daily actions or typical behaviors do you exhibit that  relate to " + goals[0] + "? What type of situations do you typically seek out, put yourself in, that are situations related to " + goals[0] + "? " + subtext[0]
                }
            ]},
                        
            {questions: [
                {
                    type: "radiogroup",
                    name: "workGoalBool",
                    isRequired: true,
                    title: "After reflecting on your actions in this area, and the situations you put yourself in, do you think that you have had a goal in your mind--before you were asked to complete this measure--related to " + goals[0] + "?",
                    choices: ["Yes", "No"]
                },
                {
                    type: "comment",
                    name: "workGoal",
                    visibleIf: "{workGoalBool} contains 'Yes'", visible: false, 
                    title: "Write your most important goal you have related to " + goals[0] + "."
                }
            ]}, 
            
            {questions: [
                {
                    type: "radiogroup",
                    name: "largerGoalBool0",
                    isRequired: true,
                    visibleIf: "{workGoalBool} contains 'Yes'", visible: false, 
                    title: "Is your goal a part of a broader, larger goal related to " + goals[0] + "? For instance, a goal to pass a class may relate to a larger goal of attaining a meaningful and rewarding career.",
                    choices: ["Yes", "No"]
                },
                {
                    type: "comment",
                    name: "largerGoal0",
                    visibleIf: "{largerGoalBool0} contains 'Yes'", visible: false,
                    title: "Write whatever is your broadest or largest goal related to " + goals[0] + ":"
                }
            ]}, 
            
            {questions: [
                {//Radio group asking about how freuqnetly the person thinks about the goals they are answering about.
                    type: "radiogroup",
                    name: "thoughts0",
                    visibleIf: "{workGoalBool} contains 'Yes'", visible: false,
                    title: "How often are thoughts of your " + goals[0] + " goal on your mind?",
                    colCount: 0,
                    isRequired: true,
                    choices: ["Never", "Rarely", "sometimes|Occasionally/sometimes", "Often", "time|Most of the Time", "Always"]
                }
            ]},
            {questions: [
                
                //A matrix question is a set of questions using a likert or likert-like scale. So the scale goes across the top (columns), and the questions allong the side(rows). Values will be useful in the final data set. Text is what is visible to the participant.   
                { type: "matrix", name: "Qualitygoal0", title: "When I think about my " + goals[0] + " goal or when I am doing activities related to my " + goals[0] + " goal, I feel: ", visibleIf: "{thoughts0} contains 'Always' or {thoughts0}='Often' or {thoughts0}='time' or {thoughts0}='sometimes' or {thoughts0}='Rarely'", visible: false, isRequired: true,
                        columns: [{ value: 1, text: "Not True At All" },
                            { value: 2, text: " " },
                            { value: 3, text: " " },
                            { value: 4, text: " " },
                            { value: 5, text: "Completely True" }],
                        rows: [{ value: "competence1goal0", text: "confident I can actually do what is required." },
                            { value: "autonomy1goal0", text: "a sense of choice and freedom in the things I undertake." },
                            { value: "relatedness1goal0", text: "caring towards others and cared for by others." },
                            { value: "compentence2goal0", text: "capable at what I am doing." },
                            { value: "autonomy2goal0", text: "my decisions reflect what I really want." },
                            { value: "relatedness2goal0", text: "close to people who are important to me." },
                            { value: "competentce3goal0", text: "competent to achieve my goal." },
                            { value: "autonomy3goal0", text: "my choices express who I really am." },
                            { value: "relatedness3goal0", text: "a warm feeling with the people I am spending time with." },
                            { value: "compentence4goal0", text: "I can successfully complete difficult goal-related tasks." },
                            { value: "autonomy4goal0", text: "I have been doing what really interests me." },
                            { value: "relatedness4goal0", text: "connected with people who care for me, and for whom I care." },
                            { value: "valencegoal0", text: "good about myself." }
                        ]}
            ]},
            {questions: [
                { type: "html", name: "title", html: "<b>" + goals[1] + "</b>"
                },
                {
                type: "comment",
                name: "home",
                title: "First, describe what you typically do that is related to " + goals[1] + ".  What daily actions or typical behaviors do you exhibit that  relate to " + goals[1] + "? What type of situations do you typically seek out, put yourself in, that are situations related to " + goals[1] + "? " + subtext[1]
                }
            ]},
            
            {questions: [
                {
                    type: "radiogroup",
                    name: "homeGoalBool",
                    isRequired: true,
                    title: "After reflecting on your actions in this area, and the situations you put yourself in, do you think that you have had a goal in your mind--before you were asked to complete this measure--related to " + goals[1] + "?",
                    choices: ["Yes", "No"]
                },
                {
                    type: "comment",
                    name: "homeGoal",
                    visibleIf: "{homeGoalBool} contains 'Yes'", visible: false, 
                    title: "Write your most important goal you have related to " + goals[1] + "."
                }
            ]}, 
            
            {questions: [
                {
                    type: "radiogroup",
                    name: "largerGoalBool1",
                    isRequired: true,
                    visibleIf: "{homeGoalBool} contains 'Yes'", visible: false,
                    title: "Is your goal a part of a broader, larger goal related to " + goals[1] + "? For instance, a goal to pass a class may relate to a larger goal of attaining a meaningful and rewarding career.",
                    choices: ["Yes", "No"]
                },
                {
                    type: "comment",
                    name: "largerGoal1",
                    visibleIf: "{largerGoalBool1} contains 'Yes'", visible: false,
                    title: "Write whatever is your broadest or largest goal related to " + goals[1] + ":"
                }
            ]}, 
            
            {questions: [
                {//Radio group asking about how freuqnetly the person thinks about the goals they are answering about.
                    type: "radiogroup",
                    name: "thoughts1",
                    visibleIf: "{homeGoalBool} contains 'Yes'", visible: false,
                    title: "How often are thoughts of your " + goals[1] + " goal on your mind?",
                    colCount: 0,
                    isRequired: true,
                    choices: ["Never", "Rarely", "sometimes|Occasionally/sometimes", "Often", "time|Most of the Time", "Always"]
                }
            ]},
            {questions: [
                
                //A matrix question is a set of questions using a likert or likert-like scale. So the scale goes across the top (columns), and the questions allong the side(rows). Values will be useful in the final data set. Text is what is visible to the participant.   
                { type: "matrix", name: "Qualitygoal1", title: "When I think about my " + goals[1] + " goal or when I am doing activities related to my " + goals[1] + " goal, I feel: ", visibleIf: "{thoughts1} contains 'Always' or {thoughts1}='Often' or {thoughts1}='time' or {thoughts1}='sometimes' or {thoughts1}='Rarely'", visible: false, isRequired: true,
                        columns: [{ value: 1, text: "Not True At All" },
                            { value: 2, text: " " },
                            { value: 3, text: " " },
                            { value: 4, text: " " },
                            { value: 5, text: "Completely True" }],
                        rows: [{ value: "competence1goal1", text: "confident I can actually do what is required." },
                            { value: "autonomy1goal1", text: "a sense of choice and freedom in the things I undertake." },
                            { value: "relatedness1goal1", text: "caring towards others and cared for by others." },
                            { value: "compentence2goal1", text: "capable at what I am doing." },
                            { value: "autonomy2goal1", text: "my decisions reflect what I really want." },
                            { value: "relatedness2goal1", text: "close to people who are important to me." },
                            { value: "competentce3goal1", text: "competent to achieve my goal." },
                            { value: "autonomy3goal1", text: "my choices express who I really am." },
                            { value: "relatedness3goal1", text: "a warm feeling with the people I am spending time with." },
                            { value: "compentence4goal1", text: "I can successfully complete difficult goal-related tasks." },
                            { value: "autonomy4goal1", text: "I have been doing what really interests me." },
                            { value: "relatedness4goal1", text: "connected with people who care for me, and for whom I care." },
                            { value: "valencegoal1", text: "good about myself." }
                        ]}
            ]},
            {questions: [
                { type: "html", name: "title", html: "<b>" + goals[2] + "</b>"
                },
                {
                type: "comment",
                name: "Intimate",
                title: "First, describe what you typically do that is related to " + goals[2] + ".  What daily actions or typical behaviors do you exhibit that  relate to " + goals[2] + "? What type of situations do you typically seek out, put yourself in, that are situations related to " + goals[2] + "? " + subtext[2]
                }
            ]},
            
            {questions: [
                {
                    type: "radiogroup",
                    name: "IntimateGoalBool",
                    isRequired: true,
                    title: "After reflecting on your actions in this area, and the situations you put yourself in, do you think that you have had a goal in your mind--before you were asked to complete this measure--related to " + goals[2] + "?",
                    choices: ["Yes", "No"]
                },
                {
                    type: "comment",
                    name: "IntimateGoal",
                    visibleIf: "{IntimateGoalBool} contains 'Yes'", visible: false, 
                    title: "Write your most important goal you have related to " + goals[2] + "."
                }
            ]}, 
            
            {questions: [
                {
                    type: "radiogroup",
                    name: "largerGoalBool2",
                    isRequired: true,
                    visibleIf: "{IntimateGoalBool} contains 'Yes'", visible: false,
                    title: "Is your goal a part of a broader, larger goal related to " + goals[2] + "? For instance, a goal to pass a class may relate to a larger goal of attaining a meaningful and rewarding career.",
                    choices: ["Yes", "No"]
                },
                {
                    type: "comment",
                    name: "largerGoal2",
                    visibleIf: "{largerGoalBool2} contains 'Yes'", visible: false,
                    title: "Write whatever is your broadest or largest goal related to " + goals[2] + ":"
                }
            ]}, 
            
            {questions: [
                {//Radio group asking about how freuqnetly the person thinks about the goals they are answering about.
                    type: "radiogroup",
                    name: "thoughts2",
                    visibleIf: "{IntimateGoalBool} contains 'Yes'", visible: false,
                    title: "How often are thoughts of your " + goals[2] + " goal on your mind?",
                    colCount: 0,
                    isRequired: true,
                    choices: ["Never", "Rarely", "sometimes|Occasionally/sometimes", "Often", "time|Most of the Time", "Always"]
                }
            ]},
            {questions: [
                
                //A matrix question is a set of questions using a likert or likert-like scale. So the scale goes across the top (columns), and the questions allong the side(rows). Values will be useful in the final data set. Text is what is visible to the participant.   
                { type: "matrix", name: "Qualitygoal2", title: "When I think about my " + goals[2] + " goal or when I am doing activities related to my " + goals[2] + " goal, I feel: ", visibleIf: "{thoughts2} contains 'Always' or {thoughts2}='Often' or {thoughts2}='time' or {thoughts2}='sometimes' or {thoughts2}='Rarely'", visible: false, isRequired: true,
                        columns: [{ value: 1, text: "Not True At All" },
                            { value: 2, text: " " },
                            { value: 3, text: " " },
                            { value: 4, text: " " },
                            { value: 5, text: "Completely True" }],
                        rows: [{ value: "competence1goal2", text: "confident I can actually do what is required." },
                            { value: "autonomy1goal2", text: "a sense of choice and freedom in the things I undertake." },
                            { value: "relatedness1goal2", text: "caring towards others and cared for by others." },
                            { value: "compentence2goal2", text: "capable at what I am doing." },
                            { value: "autonomy2goal2", text: "my decisions reflect what I really want." },
                            { value: "relatedness2goal2", text: "close to people who are important to me." },
                            { value: "competentce3goal2", text: "competent to achieve my goal." },
                            { value: "autonomy3goal2", text: "my choices express who I really am." },
                            { value: "relatedness3goal2", text: "a warm feeling with the people I am spending time with." },
                            { value: "compentence4goal2", text: "I can successfully complete difficult goal-related tasks." },
                            { value: "autonomy4goal2", text: "I have been doing what really interests me." },
                            { value: "relatedness4goal2", text: "connected with people who care for me, and for whom I care." },
                            { value: "valencegoal2", text: "good about myself." }
                        ]}
            ]},
            {questions: [
                { type: "html", name: "title", html: "<b>" + goals[3] + "</b>"
                },
                {
                type: "comment",
                name: "NonIntimate",
                title: "First, describe what you typically do that is related to " + goals[3] + ".  What daily actions or typical behaviors do you exhibit that  relate to " + goals[3] + "? What type of situations do you typically seek out, put yourself in, that are situations related to " + goals[3] + "? " + subtext[3]
                }
            ]},
            
            {questions: [
                {
                    type: "radiogroup",
                    name: "NonIntimateGoalBool",
                    isRequired: true,
                    title: "After reflecting on your actions in this area, and the situations you put yourself in, do you think that you have had a goal in your mind--before you were asked to complete this measure--related to " + goals[3] + "?",
                    choices: ["Yes", "No"]
                },
                {
                    type: "comment",
                    name: "NonIntimateGoal",
                    visibleIf: "{NonIntimateGoalBool} contains 'Yes'", visible: false, 
                    title: "Write your most important goal you have related to " + goals[3] + "."
                }
            ]}, 
            
            {questions: [
                {
                    type: "radiogroup",
                    name: "largerGoalBool3",
                    isRequired: true,
                    visibleIf: "{NonIntimateGoalBool} contains 'Yes'", visible: false,
                    title: "Is your goal a part of a broader, larger goal related to " + goals[3] + "? For instance, a goal to pass a class may relate to a larger goal of attaining a meaningful and rewarding career.",
                    choices: ["Yes", "No"]
                },
                {
                    type: "comment",
                    name: "largerGoal3",
                    visibleIf: "{largerGoalBool3} contains 'Yes'", visible: false,
                    title: "Write whatever is your broadest or largest goal related to " + goals[3] + ":"
                }
            ]}, 
            
            {questions: [
                {//Radio group asking about how freuqnetly the person thinks about the goals they are answering about.
                    type: "radiogroup",
                    name: "thoughts3",
                    visibleIf: "{NonIntimateGoalBool} contains 'Yes'", visible: false,
                    title: "How often are thoughts of your " + goals[3] + " goal on your mind?",
                    colCount: 0,
                    isRequired: true,
                    choices: ["Never", "Rarely", "sometimes|Occasionally/sometimes", "Often", "time|Most of the Time", "Always"]
                }
            ]},
            {questions: [
                
                //A matrix question is a set of questions using a likert or likert-like scale. So the scale goes across the top (columns), and the questions allong the side(rows). Values will be useful in the final data set. Text is what is visible to the participant.   
                { type: "matrix", name: "Qualitygoal3", title: "When I think about my " + goals[3] + " goal or when I am doing activities related to my " + goals[3] + " goal, I feel: ", visibleIf: "{thoughts3} contains 'Always' or {thoughts3}='Often' or {thoughts3}='time' or {thoughts3}='sometimes' or {thoughts3}='Rarely'", visible: false, isRequired: true,
                        columns: [{ value: 1, text: "Not True At All" },
                            { value: 2, text: " " },
                            { value: 3, text: " " },
                            { value: 4, text: " " },
                            { value: 5, text: "Completely True" }],
                        rows: [{ value: "competence1goal3", text: "confident I can actually do what is required." },
                            { value: "autonomy1goal3", text: "a sense of choice and freedom in the things I undertake." },
                            { value: "relatedness1goal3", text: "caring towards others and cared for by others." },
                            { value: "compentence2goal3", text: "capable at what I am doing." },
                            { value: "autonomy2goal3", text: "my decisions reflect what I really want." },
                            { value: "relatedness2goal3", text: "close to people who are important to me." },
                            { value: "competentce3goal3", text: "competent to achieve my goal." },
                            { value: "autonomy3goal3", text: "my choices express who I really am." },
                            { value: "relatedness3goal3", text: "a warm feeling with the people I am spending time with." },
                            { value: "compentence4goal3", text: "I can successfully complete difficult goal-related tasks." },
                            { value: "autonomy4goal3", text: "I have been doing what really interests me." },
                            { value: "relatedness4goal3", text: "connected with people who care for me, and for whom I care." },
                            { value: "valencegoal3", text: "good about myself." }
                        ]}
            ]},
            {questions: [
                { type: "html", name: "title", html: "<b>" + goals[4] + "</b>"
                },
                {
                type: "comment",
                name: "Self",
                title: "First, describe what you typically do that is related to " + goals[4] + ".  What daily actions or typical behaviors do you exhibit that  relate to " + goals[4] + "? What type of situations do you typically seek out, put yourself in, that are situations related to " + goals[4] + "? "  + subtext[4]
                }
            ]},
            
            {questions: [
                {
                    type: "radiogroup",
                    name: "SelfGoalBool",
                    isRequired: true,
                    title: "After reflecting on your actions in this area, and the situations you put yourself in, do you think that you have had a goal in your mind--before you were asked to complete this measure--related to " + goals[4] + "?",
                    choices: ["Yes", "No"]
                },
                {
                    type: "comment",
                    name: "SelfGoal",
                    visibleIf: "{SelfGoalBool} contains 'Yes'", visible: false, 
                    title: "Write your most important goal you have related to " + goals[4] + "."
                }
            ]}, 
            
            {questions: [
                {
                    type: "radiogroup",
                    name: "largerGoalBool4",
                    isRequired: true,
                    visibleIf: "{SelfGoalBool} contains 'Yes'", visible: false,
                    title: "Is your goal a part of a broader, larger goal related to " + goals[4] + "? For instance, a goal to pass a class may relate to a larger goal of attaining a meaningful and rewarding career.",
                    choices: ["Yes", "No"]
                },
                {
                    type: "comment",
                    name: "largerGoal4",
                    visibleIf: "{largerGoalBool4} contains 'Yes'", visible: false,
                    title: "Write whatever is your broadest or largest goal related to " + goals[4] + ":"
                }
            ]}, 
            
            {questions: [
                {//Radio group asking about how freuqnetly the person thinks about the goals they are answering about.
                    type: "radiogroup",
                    name: "thoughts4",
                    visibleIf: "{SelfGoalBool} contains 'Yes'", visible: false,
                    title: "How often are thoughts of your " + goals[4] + " goal on your mind?",
                    colCount: 0,
                    isRequired: true,
                    choices: ["Never", "Rarely", "sometimes|Occasionally/sometimes", "Often", "time|Most of the Time", "Always"]
                }
            ]},
            {questions: [
                
                //A matrix question is a set of questions using a likert or likert-like scale. So the scale goes across the top (columns), and the questions allong the side(rows). Values will be useful in the final data set. Text is what is visible to the participant.   
                { type: "matrix", name: "Qualitygoal4", title: "When I think about my " + goals[4] + " goal or when I am doing activities related to my " + goals[4] + " goal, I feel: ", visibleIf: "{thoughts4} contains 'Always' or {thoughts4}='Often' or {thoughts4}='time' or {thoughts4}='sometimes' or {thoughts4}='Rarely'", visible: false, isRequired: true,
                        columns: [{ value: 1, text: "Not True At All" },
                            { value: 2, text: " " },
                            { value: 3, text: " " },
                            { value: 4, text: " " },
                            { value: 5, text: "Completely True" }],
                        rows: [{ value: "competence1goal4", text: "confident I can actually do what is required." },
                            { value: "autonomy1goal4", text: "a sense of choice and freedom in the things I undertake." },
                            { value: "relatedness1goal4", text: "caring towards others and cared for by others." },
                            { value: "compentence2goal4", text: "capable at what I am doing." },
                            { value: "autonomy2goal4", text: "my decisions reflect what I really want." },
                            { value: "relatedness2goal4", text: "close to people who are important to me." },
                            { value: "competentce3goal4", text: "competent to achieve my goal." },
                            { value: "autonomy3goal4", text: "my choices express who I really am." },
                            { value: "relatedness3goal4", text: "a warm feeling with the people I am spending time with." },
                            { value: "compentence4goal4", text: "I can successfully complete difficult goal-related tasks." },
                            { value: "autonomy4goal4", text: "I have been doing what really interests me." },
                            { value: "relatedness4goal4", text: "connected with people who care for me, and for whom I care." },
                            { value: "valencegoal4", text: "good about myself." }
                        ]}
            ]},
            {questions: [
                { type: "html", name: "title", html: "<b>" + goals[5] + "</b>"
                },
                {
                type: "comment",
                name: "learning",
                title: "First, describe what you typically do that is related to " + goals[5] + ".  What daily actions or typical behaviors do you exhibit that  relate to " + goals[5] + "? What type of situations do you typically seek out, put yourself in, that are situations related to " + goals[5] + "? "  + subtext[5]
                }
            ]},
            
            {questions: [
                {
                    type: "radiogroup",
                    name: "learningGoalBool",
                    isRequired: true,
                    title: "After reflecting on your actions in this area, and the situations you put yourself in, do you think that you have had a goal in your mind--before you were asked to complete this measure--related to " + goals[5] + "?",
                    choices: ["Yes", "No"]
                },
                {
                    type: "comment",
                    name: "learningGoal",
                    visibleIf: "{learningGoalBool} contains 'Yes'", visible: false, 
                    title: "Write your most important goal you have related to " + goals[5] + "."
                }
            ]}, 
            
            {questions: [
                {
                    type: "radiogroup",
                    name: "largerGoalBool5",
                    isRequired: true,
                    visibleIf: "{learningGoalBool} contains 'Yes'", visible: false,
                    title: "Is your goal a part of a broader, larger goal related to " + goals[5] + "? For instance, a goal to pass a class may relate to a larger goal of attaining a meaningful and rewarding career.",
                    choices: ["Yes", "No"]
                },
                {
                    type: "comment",
                    name: "largerGoal5",
                    visibleIf: "{largerGoalBool5} contains 'Yes'", visible: false,
                    title: "Write whatever is your broadest or largest goal related to " + goals[5] + ":"
                }
            ]}, 
            
            {questions: [
                {//Radio group asking about how freuqnetly the person thinks about the goals they are answering about.
                    type: "radiogroup",
                    name: "thoughts5",
                    visibleIf: "{learningGoalBool} contains 'Yes'", visible: false,
                    title: "How often are thoughts of your " + goals[5] + " goal on your mind?",
                    colCount: 0,
                    isRequired: true,
                    choices: ["Never", "Rarely", "sometimes|Occasionally/sometimes", "Often", "time|Most of the Time", "Always"]
                }
            ]},
            {questions: [
                
                //A matrix question is a set of questions using a likert or likert-like scale. So the scale goes across the top (columns), and the questions allong the side(rows). Values will be useful in the final data set. Text is what is visible to the participant.   
                { type: "matrix", name: "Qualitygoal5", title: "When I think about my " + goals[5] + " goal or when I am doing activities related to my " + goals[5] + " goal, I feel: ", visibleIf: "{thoughts5} contains 'Always' or {thoughts5}='Often' or {thoughts5}='time' or {thoughts5}='sometimes' or {thoughts5}='Rarely'", visible: false, isRequired: true,
                        columns: [{ value: 1, text: "Not True At All" },
                            { value: 2, text: " " },
                            { value: 3, text: " " },
                            { value: 4, text: " " },
                            { value: 5, text: "Completely True" }],
                        rows: [{ value: "competence1goal5", text: "confident I can actually do what is required." },
                            { value: "autonomy1goal5", text: "a sense of choice and freedom in the things I undertake." },
                            { value: "relatedness1goal5", text: "caring towards others and cared for by others." },
                            { value: "compentence2goal5", text: "capable at what I am doing." },
                            { value: "autonomy2goal5", text: "my decisions reflect what I really want." },
                            { value: "relatedness2goal5", text: "close to people who are important to me." },
                            { value: "competentce3goal5", text: "competent to achieve my goal." },
                            { value: "autonomy3goal5", text: "my choices express who I really am." },
                            { value: "relatedness3goal5", text: "a warm feeling with the people I am spending time with." },
                            { value: "compentence4goal5", text: "I can successfully complete difficult goal-related tasks." },
                            { value: "autonomy4goal5", text: "I have been doing what really interests me." },
                            { value: "relatedness4goal5", text: "connected with people who care for me, and for whom I care." },
                            { value: "valencegoal5", text: "good about myself." }
                        ]}
            ]},
            {questions: [
                { type: "html", name: "title", html: "<b>" + goals[6] + "</b>"
                },
                {
                type: "comment",
                name: "health",
                title: "First, describe what you typically do that is related to " + goals[6] + ".  What daily actions or typical behaviors do you exhibit that  relate to " + goals[6] + "? What type of situations do you typically seek out, put yourself in, that are situations related to " + goals[6] + "? "  + subtext[6]
                }
            ]},
            
            {questions: [
                {
                    type: "radiogroup",
                    name: "healthGoalBool",
                    isRequired: true,
                    title: "After reflecting on your actions in this area, and the situations you put yourself in, do you think that you have had a goal in your mind--before you were asked to complete this measure--related to " + goals[6] + "?",
                    choices: ["Yes", "No"]
                },
                {
                    type: "comment",
                    name: "healthGoal",
                    visibleIf: "{healthGoalBool} contains 'Yes'", visible: false, 
                    title: "Write your most important goal you have related to " + goals[6] + "."
                }
            ]}, 
            
            {questions: [
                {
                    type: "radiogroup",
                    name: "largerGoalBool6",
                    isRequired: true,
                    visibleIf: "{healthGoalBool} contains 'Yes'", visible: false,
                    title: "Is your goal a part of a broader, larger goal related to " + goals[6] + "? For instance, a goal to pass a class may relate to a larger goal of attaining a meaningful and rewarding career.",
                    choices: ["Yes", "No"]
                },
                {
                    type: "comment",
                    name: "largerGoal6",
                    visibleIf: "{largerGoalBool6} contains 'Yes'", visible: false,
                    title: "Write whatever is your broadest or largest goal related to " + goals[6] + ":"
                }
            ]}, 
            
            {questions: [
                {//Radio group asking about how freuqnetly the person thinks about the goals they are answering about.
                    type: "radiogroup",
                    name: "thoughts6",
                    visibleIf: "{healthGoalBool} contains 'Yes'", visible: false,
                    title: "How often are thoughts of your " + goals[6] + " goal on your mind?",
                    colCount: 0,
                    isRequired: true,
                    choices: ["Never", "Rarely", "sometimes|Occasionally/sometimes", "Often", "time|Most of the Time", "Always"]
                }
            ]},
            {questions: [
                
                //A matrix question is a set of questions using a likert or likert-like scale. So the scale goes across the top (columns), and the questions allong the side(rows). Values will be useful in the final data set. Text is what is visible to the participant.   
                { type: "matrix", name: "Qualitygoal6", title: "When I think about my " + goals[6] + " goal or when I am doing activities related to my " + goals[6] + " goal, I feel: ", visibleIf: "{thoughts6} contains 'Always' or {thoughts6}='Often' or {thoughts6}='time' or {thoughts6}='sometimes' or {thoughts6}='Rarely'", visible: false, isRequired: true,
                        columns: [{ value: 1, text: "Not True At All" },
                            { value: 2, text: " " },
                            { value: 3, text: " " },
                            { value: 4, text: " " },
                            { value: 5, text: "Completely True" }],
                        rows: [{ value: "competence1goal6", text: "confident I can actually do what is required." },
                            { value: "autonomy1goal6", text: "a sense of choice and freedom in the things I undertake." },
                            { value: "relatedness1goal6", text: "caring towards others and cared for by others." },
                            { value: "compentence2goal6", text: "capable at what I am doing." },
                            { value: "autonomy2goal6", text: "my decisions reflect what I really want." },
                            { value: "relatedness2goal6", text: "close to people who are important to me." },
                            { value: "competentce3goal6", text: "competent to achieve my goal." },
                            { value: "autonomy3goal6", text: "my choices express who I really am." },
                            { value: "relatedness3goal6", text: "a warm feeling with the people I am spending time with." },
                            { value: "compentence4goal6", text: "I can successfully complete difficult goal-related tasks." },
                            { value: "autonomy4goal6", text: "I have been doing what really interests me." },
                            { value: "relatedness4goal6", text: "connected with people who care for me, and for whom I care." },
                            { value: "valencegoal6", text: "good about myself." }
                        ]}
            ]},
            {questions: [
                { type: "html", name: "title", html: "<b>" + goals[7] + "</b>"
                },
                {
                type: "comment",
                name: "leisure",
                title: "First, describe what you typically do that is related to " + goals[7] + ".  What daily actions or typical behaviors do you exhibit that  relate to " + goals[7] + "? What type of situations do you typically seek out, put yourself in, that are situations related to " + goals[7] + "? "  + subtext[7]
                }
            ]},
            
            {questions: [
                {
                    type: "radiogroup",
                    name: "leisureGoalBool",
                    isRequired: true,
                    title: "After reflecting on your actions in this area, and the situations you put yourself in, do you think that you have had a goal in your mind--before you were asked to complete this measure--related to " + goals[7] + "?",
                    choices: ["Yes", "No"]
                },
                {
                    type: "comment",
                    name: "leisureGoal",
                    visibleIf: "{leisureGoalBool} contains 'Yes'", visible: false, 
                    title: "Write your most important goal you have related to " + goals[7] + "."
                }
            ]}, 
            
            {questions: [
                {
                    type: "radiogroup",
                    name: "largerGoalBool7",
                    isRequired: true,
                    visibleIf: "{leisureGoalBool} contains 'Yes'", visible: false,
                    title: "Is your goal a part of a broader, larger goal related to " + goals[7] + "? For instance, a goal to pass a class may relate to a larger goal of attaining a meaningful and rewarding career.",
                    choices: ["Yes", "No"]
                },
                {
                    type: "comment",
                    name: "largerGoal7",
                    visibleIf: "{largerGoalBool7} contains 'Yes'", visible: false,
                    title: "Write whatever is your broadest or largest goal related to " + goals[7] + ":"
                }
            ]}, 
            
            {questions: [
                {//Radio group asking about how freuqnetly the person thinks about the goals they are answering about.
                    type: "radiogroup",
                    name: "thoughts7",
                    visibleIf: "{leisureGoalBool} contains 'Yes'", visible: false,
                    title: "How often are thoughts of your " + goals[7] + " goal on your mind?",
                    colCount: 0,
                    isRequired: true,
                    choices: ["Never", "Rarely", "sometimes|Occasionally/sometimes", "Often", "time|Most of the Time", "Always"]
                }
            ]},
            {questions: [
                
                //A matrix question is a set of questions using a likert or likert-like scale. So the scale goes across the top (columns), and the questions allong the side(rows). Values will be useful in the final data set. Text is what is visible to the participant.   
                { type: "matrix", name: "Qualitygoal7", title: "When I think about my " + goals[7] + " goal or when I am doing activities related to my " + goals[7] + " goal, I feel: ", visibleIf: "{thoughts7} contains 'Always' or {thoughts7}='Often' or {thoughts7}='time' or {thoughts7}='sometimes' or {thoughts7}='Rarely'", visible: false, isRequired: true,
                        columns: [{ value: 1, text: "Not True At All" },
                            { value: 2, text: " " },
                            { value: 3, text: " " },
                            { value: 4, text: " " },
                            { value: 5, text: "Completely True" }],
                        rows: [{ value: "competence1goal7", text: "confident I can actually do what is required." },
                            { value: "autonomy1goal7", text: "a sense of choice and freedom in the things I undertake." },
                            { value: "relatedness1goal7", text: "caring towards others and cared for by others." },
                            { value: "compentence2goal7", text: "capable at what I am doing." },
                            { value: "autonomy2goal7", text: "my decisions reflect what I really want." },
                            { value: "relatedness2goal7", text: "close to people who are important to me." },
                            { value: "competentce3goal7", text: "competent to achieve my goal." },
                            { value: "autonomy3goal7", text: "my choices express who I really am." },
                            { value: "relatedness3goal7", text: "a warm feeling with the people I am spending time with." },
                            { value: "compentence4goal7", text: "I can successfully complete difficult goal-related tasks." },
                            { value: "autonomy4goal7", text: "I have been doing what really interests me." },
                            { value: "relatedness4goal7", text: "connected with people who care for me, and for whom I care." },
                            { value: "valencegoal7", text: "good about myself." }
                        ]}
            ]},
            {questions: [
                { type: "html", name: "title", html: "<b>" + goals[8] + "</b>"
                },
                {
                type: "comment",
                name: "other",
                title: "First, describe what you typically do that is related to " + goals[8] + ".  What daily actions or typical behaviors do you exhibit that  relate to " + goals[8] + "? What type of situations do you typically seek out, put yourself in, that are situations related to " + goals[8] + "? " + subtext[8]
                }
            ]},
            
            {questions: [
                {
                    type: "radiogroup",
                    name: "otherGoalBool",
                    isRequired: true,
                    title: "After reflecting on your actions in this area, and the situations you put yourself in, do you think that you have had a goal in your mind--before you were asked to complete this measure--related to " + goals[8] + "?",
                    choices: ["Yes", "No"]
                },
                {
                    type: "comment",
                    name: "otherGoal",
                    visibleIf: "{otherGoalBool} contains 'Yes'", visible: false, 
                    title: "Write your most important goal you have related to " + goals[8] + "."
                }
            ]}, 
            
            {questions: [
                {
                    type: "radiogroup",
                    name: "largerGoalBool8",
                    isRequired: true,
                    visibleIf: "{otherGoalBool} contains 'Yes'", visible: false,
                    title: "Is your goal a part of a broader, larger goal related to " + goals[8] + "? For instance, a goal to pass a class may relate to a larger goal of attaining a meaningful and rewarding career.",
                    choices: ["Yes", "No"]
                },
                {
                    type: "comment",
                    name: "largerGoal8",
                    visibleIf: "{largerGoalBool8} contains 'Yes'", visible: false,
                    title: "Write whatever is your broadest or largest goal related to " + goals[8] + ":"
                }
            ]}, 
            
            {questions: [
                {//Radio group asking about how freuqnetly the person thinks about the goals they are answering about.
                    type: "radiogroup",
                    name: "thoughts8",
                    visibleIf: "{otherGoalBool} contains 'Yes'", visible: false,
                    title: "How often are thoughts of your " + goals[8] + " goal on your mind?",
                    colCount: 0,
                    isRequired: true,
                    choices: ["Never", "Rarely", "sometimes|Occasionally/sometimes", "Often", "time|Most of the Time", "Always"]
                }
            ]},
            {questions: [
                
                //A matrix question is a set of questions using a likert or likert-like scale. So the scale goes across the top (columns), and the questions allong the side(rows). Values will be useful in the final data set. Text is what is visible to the participant.   
                { type: "matrix", name: "Qualitygoal8", title: "When I think about my " + goals[8] + " goal or when I am doing activities related to my " + goals[8] + " goal, I feel: ", visibleIf: "{thoughts8} contains 'Always' or {thoughts8}='Often' or {thoughts8}='time' or {thoughts8}='sometimes' or {thoughts8}='Rarely'", visible: false, isRequired: true,
                        columns: [{ value: 1, text: "Not True At All" },
                            { value: 2, text: " " },
                            { value: 3, text: " " },
                            { value: 4, text: " " },
                            { value: 5, text: "Completely True" }],
                        rows: [{ value: "competence1goal8", text: "confident I can actually do what is required." },
                            { value: "autonomy1goal8", text: "a sense of choice and freedom in the things I undertake." },
                            { value: "relatedness1goal8", text: "caring towards others and cared for by others." },
                            { value: "compentence2goal8", text: "capable at what I am doing." },
                            { value: "autonomy2goal8", text: "my decisions reflect what I really want." },
                            { value: "relatedness2goal8", text: "close to people who are important to me." },
                            { value: "competentce3goal8", text: "competent to achieve my goal." },
                            { value: "autonomy3goal8", text: "my choices express who I really am." },
                            { value: "relatedness3goal8", text: "a warm feeling with the people I am spending time with." },
                            { value: "compentence4goal8", text: "I can successfully complete difficult goal-related tasks." },
                            { value: "autonomy4goal8", text: "I have been doing what really interests me." },
                            { value: "relatedness4goal8", text: "connected with people who care for me, and for whom I care." },
                            { value: "valencegoal8", text: "good about myself." }
                        ]}
            ]},
            
        ]
    };
    //Used for debugging
    console.log(jsonBegin);
    
    //Some Bootstrappy stuff that makes it look better, style choices
    Survey.defaultBootstrapCss.navigationButton = "btn btn-primary";
    //Survey.Survey.cssType = "bootstrapmaterial";
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
        //This has to exist, because dataPassed will become undefined once it's outside of the ajax request. This literally just holds the data so that it can be accessed outside of the call.
        var holdMyData;
        var dataPassed;
        //Check to see if this ID has been used before.
        $.ajax({
            type: "GET",
            url: "/GOALresult/" + tempString,
            async: false,
            success: function (dataPassed) {
                holdMyData = dataPassed;
                //verification that the data was retreieved.
            }
        });
        if(holdMyData === '') {//if it's not been used before. Post and move to the results
            postAndMoveOn(surveyString);
        } else {//If it's been used before, show a pop up asking whether the user wants to create a new Unique ID or just retreive the old user data. 
            if (confirm("You have entered an ID that already exists. Clicking OK will modify your current ID so it can be saved uniquely. If you do not wish to do this, hit Cancel and you will be forwarded to the results page and shown the perviously entered data.")) {
                //If they want to create a new ID, go to fuction to do that.
                surveyString = fixSurveyString(surveyString);
                //Then post and move on.
                postAndMoveOn(surveyString);
                console.log("You pressed OK!");
            } else {
                //If they want to see the old data, then just move on. Post nothing. 
                window.location.href = "GoalResults.html";
                console.log("You pressed Cancel!");
            }
        }
    });
    //Important survey posting line. Don't touch. 
    $("#surveyElement").Survey({model: model});

}

//This is just the way js works. There is a thing asking if the page came up properly, and if so then run the init above. 
if (!window["%hammerhead%"]) {
    //console.log("begin"); //debugging code.
    init(["Work/Job/Career", "Home and Household matters", "Intimate Relationships", "Non-Intimate Relationships", "Self-Change/Self-Growth", "Learning/Education", "Health and Medical Matters", "Leisure/Recreation", "Other Life Area Not Previously Mentioned"]);
    
}
