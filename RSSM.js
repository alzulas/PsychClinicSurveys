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
        var moduloNumber = (mm * dd * yyyy)%10000;
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
            url: "/RSSMresult/" + newIDAttempt,
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
    window.location.href = "RSSMResults.html";
}

//************************************************************
//Everything else json ext
//************************************************************

function init(relationship) {
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
        title: "RSSM- Psychological Needs Assessment.",
        showProgressBar: "top",
        pages: [
            {
                //how to create a unique identifier 
                questions: [
              
                    //html questions are just information. This is a good way to introduce topics. You can use HTML mark up in these sections.
                    { type: "html", name: "introAndDemographics", html: "<h2 class=\"post-title\">Welcome to the Relational Self Schema Measure.</h2> <p>General Demographic Questions.</p> <p> Remember: If at any time you feel that the text or options are too small you can hit Ctrl and the + sign in Windows or command and + in Mac on your keyboard to increase the fonts on the screen. This is an accessability feature available on all major browsers and most websites! (Note that ctrl - or command - will reduce the font sizes.) </p>"},
            
            
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
                { type: "html", name: "info", html: "<p><b>The Relational Self Schema Measure</b></p><p> Most people think differently about themselves depending on who they are with and what they are doing.  This questionnaire is trying to get at how you think about yourself when you are with different people and when you are in different roles in your life.</p>"}
            ]},
            
            {questions: [
                {//Radio group asking about how freuqnetly the person thinks about the relationship they are answering about.
                    type: "radiogroup",
                    name: "thoughtsrel0",
                    title: "How often are thoughts of your " + relationship[0] + " on your mind?",
                    colCount: 0,
                    isRequired: true,
                    choices: ["I don't have a " + relationship[0], "Never", "Rarely", "sometimes|Occasionally/sometimes", "Often", "time|Most of the Time", "Always"]
                }
            ]},
            {questions: [
    
                //This html describes how to think about the next set of questions.
                { type: "html", name: "inforel0", visibleIf: "{thoughtsrel0} contains 'Always' or {thoughtsrel0}='Often' or {thoughtsrel0}='time' or {thoughtsrel0}='sometimes' or {thoughtsrel0}='Rarely'", visible: false, html: "</p> <p> Think about a typical experience with your " + relationship[0] + ". Picture your " + relationship[0] + "’s face, and try to form a good image of your " + relationship[0] + ", getting an experience of You-with-your-" + relationship[0] + ".  It might help to imagine what typically happens between the two of you: what your " + relationship[0] + " does and says, how your " + relationship[0] + " does it, and what you do and say, how you do it, as well as what you are trying to do. </p> <p> Once you have recreated this experience of You-with-your-" + relationship[0] + ", please read each of the following items carefully, and rate the extent to which each statement is generally true for how you feel and think about yourself when you are interacting with your " + relationship[0] + " (now, at this point in your life)."},

                
                //A matrix question is a set of questions using a likert or likert-like scale. So the scale goes across the top (columns), and the questions allong the side(rows). Values will be useful in the final data set. Text is what is visible to the participant.   
                { type: "matrix", name: "Qualityrel0", title: "When I interact with my " + relationship[0] + ", I feel  ... ", visibleIf: "{thoughtsrel0} contains 'Always' or {thoughtsrel0}='Often' or {thoughtsrel0}='time' or {thoughtsrel0}='sometimes' or {thoughtsrel0}='Rarely'", visible: false, isRequired: true,
                        columns: [{ value: 1, text: "Not True At All" },
                            { value: 2, text: " " },
                            { value: 3, text: " " },
                            { value: 4, text: " " },
                            { value: 5, text: "Completely True" }],
                        rows: [{ value: "competence1rel0", text: "confident I can do things well." },
                            { value: "autonomy1rel0", text: "a sense of choice and freedom in the things I undertake." },
                            { value: "relatedness1rel0", text: "caring towards this person and cared for by this person." },
                            { value: "compentence2rel0", text: "capable at what I do." },
                            { value: "autonomy2rel0", text: "my decisions reflect what I really want." },
                            { value: "relatedness2rel0", text: "close to this person." },
                            { value: "competentce3rel0", text: "competent to achieve my goals." },
                            { value: "autonomy3rel0", text: "my choices express who I really am." },
                            { value: "relatedness3rel0", text: "I experience a warm feeling with this person." },
                            { value: "compentence4rel0", text: "I can successfully complete difficult tasks." },
                            { value: "autonomy4rel0", text: "I have been doing what really interests me." },
                            { value: "relatedness4rel0", text: "connected with this person." },
                            { value: "valencerel0", text: "good about myself." }
                        ]}
            ]},
            {questions: [
                {//Radio group asking about how freuqnetly the person thinks about the relationship they are answering about.
                    type: "radiogroup",
                    name: "thoughtsrel1",
                    title: "How often are thoughts of your " + relationship[1] + " on your mind?",
                    colCount: 0,
                    isRequired: true,
                    choices: ["I don't have a " + relationship[1], "Never", "Rarely", "sometimes|Occasionally/sometimes", "Often", "time|Most of the Time", "Always"]
                }
            ]},
            {questions: [
                //This html describes how to think about the next set of questions.
                { type: "html", name: "inforel1", visibleIf: "{thoughtsrel1} contains 'Always' or {thoughtsrel1}='Often' or {thoughtsrel1}='time' or {thoughtsrel1}='sometimes' or {thoughtsrel1}='Rarely'", visible: false, html: "</p> <p> Think about a typical experience with your " + relationship[1] + ". Picture your " + relationship[1] + "’s face, and try to form a good image of your " + relationship[1] + ", getting an experience of You-with-your-" + relationship[1] + ".  It might help to imagine what typically happens between the two of you: what your " + relationship[1] + " does and says, how your " + relationship[1] + " does it, and what you do and say, how you do it, as well as what you are trying to do. </p> <p> Once you have recreated this experience of You-with-your-" + relationship[1] + ", please read each of the following items carefully, and rate the extent to which each statement is generally true for how you feel and think about yourself when you are interacting with your " + relationship[1] + " (now, at this point in your life)."},

                
                //A matrix question is a set of questions using a likert or likert-like scale. So the scale goes across the top (columns), and the questions allong the side(rows). Values will be useful in the final data set. Text is what is visible to the participant.   
                { type: "matrix", name: "Qualityrel1", title: "When I interact with my " + relationship[1] + ", I feel  ... ", visibleIf: "{thoughtsrel1} contains 'Always' or {thoughtsrel1}='Often' or {thoughtsrel1}='time' or {thoughtsrel1}='sometimes' or {thoughtsrel1}='Rarely'", visible: false, isRequired: true,
                        columns: [{ value: 1, text: "Not True At All" },
                            { value: 2, text: " " },
                            { value: 3, text: " " },
                            { value: 4, text: " " },
                            { value: 5, text: "Completely True" }],
                        rows: [{ value: "competence1rel1", text: "confident I can do things well." },
                            { value: "autonomy1rel1", text: "a sense of choice and freedom in the things I undertake." },
                            { value: "relatedness1rel1", text: "caring towards this person and cared for by this person." },
                            { value: "compentence2rel1", text: "capable at what I do." },
                            { value: "autonomy2rel1", text: "my decisions reflect what I really want." },
                            { value: "relatedness2rel1", text: "close to this person." },
                            { value: "competentce3rel1", text: "competent to achieve my goals." },
                            { value: "autonomy3rel1", text: "my choices express who I really am." },
                            { value: "relatedness3rel1", text: "I experience a warm feeling with this person." },
                            { value: "compentence4rel1", text: "I can successfully complete difficult tasks." },
                            { value: "autonomy4rel1", text: "I have been doing what really interests me." },
                            { value: "relatedness4rel1", text: "connected with this person." },
                            { value: "valencerel1", text: "good about myself." }
                        ]}
            ]},
            {questions: [
                {
                    //Radio group asking about how freuqnetly the person thinks about the relationship they are answering about.
                    type: "radiogroup",
                    name: "thoughtsrel2",
                    title: "How often are thoughts of your " + relationship[2] + " on your mind?",
                    colCount: 0,
                    isRequired: true,
                    choices: ["I don't have a " + relationship[2], "Never", "Rarely", "sometimes|Occasionally/sometimes", "Often", "time|Most of the Time", "Always"]
                }
            ]},
            {questions: [
                //This html describes how to think about the next set of questions.
                { type: "html", name: "inforel2", visibleIf: "{thoughtsrel2} contains 'Always' or {thoughtsrel2}='Often' or {thoughtsrel2}='time' or {thoughtsrel2}='sometimes' or {thoughtsrel2}='Rarely'", visible: false, html: "</p> <p> Think about a typical experience with your " + relationship[2] + ". Picture your " + relationship[2] + "’s face, and try to form a good image of your " + relationship[2] + ", getting an experience of You-with-your-" + relationship[2] + ".  It might help to imagine what typically happens between the two of you: what your " + relationship[2] + " does and says, how your " + relationship[2] + " does it, and what you do and say, how you do it, as well as what you are trying to do. </p> <p> Once you have recreated this experience of You-with-your-" + relationship[2] + ", please read each of the following items carefully, and rate the extent to which each statement is generally true for how you feel and think about yourself when you are interacting with your " + relationship[2] + " (now, at this point in your life)."},

                

                   //A matrix question is a set of questions using a likert or likert-like scale. So the scale goes across the top (columns), and the questions allong the side(rows). Values will be useful in the final data set. Text is what is visible to the participant.   
                { type: "matrix", name: "Qualityrel2", title: "When I interact with my " + relationship[2] + ", I feel  ... ", visibleIf: "{thoughtsrel2} contains 'Always' or {thoughtsrel2}='Often' or {thoughtsrel2}='time' or {thoughtsrel2}='sometimes' or {thoughtsrel2}='Rarely'", visible: false, isRequired: true,
                        columns: [{ value: 1, text: "Not True At All" },
                            { value: 2, text: " " },
                            { value: 3, text: " " },
                            { value: 4, text: " " },
                            { value: 5, text: "Completely True" }],
                        rows: [{ value: "competence1rel2", text: "confident I can do things well." },
                            { value: "autonomy1rel2", text: "a sense of choice and freedom in the things I undertake." },
                            { value: "relatedness1rel2", text: "caring towards this person and cared for by this person." },
                            { value: "compentence2rel2", text: "capable at what I do." },
                            { value: "autonomy2rel2", text: "my decisions reflect what I really want." },
                            { value: "relatedness2rel2", text: "close to this person." },
                            { value: "competentce3rel2", text: "competent to achieve my goals." },
                            { value: "autonomy3rel2", text: "my choices express who I really am." },
                            { value: "relatedness3rel2", text: "I experience a warm feeling with this person." },
                            { value: "compentence4rel2", text: "I can successfully complete difficult tasks." },
                            { value: "autonomy4rel2", text: "I have been doing what really interests me." },
                            { value: "relatedness4rel2", text: "connected with this person." },
                            { value: "valencerel2", text: "good about myself." }
                        ]}
            ]},
            {questions: [
                {
                    //Radio group asking about how freuqnetly the person thinks about the relationship they are answering about. 
                    //BE CAREFUL HERE. THIS ONE IS DIFFERENT THAN THE ONES ABOVE, BUT THE SAME AS THE NEXT TWO
                    //Just some words added to the question
                    type: "radiogroup",
                    name: "thoughtsrel3",
                    title: "How often are thoughts of your " + relationship[3] + " on your mind? (If you have more than one " + relationship[3] + ", answer this question for the one who you think about most frequently)",
                    colCount: 0,
                    isRequired: true,
                    choices: ["I don't have a " + relationship[3], "Never", "Rarely", "sometimes|Occasionally/sometimes", "Often", "time|Most of the Time", "Always"]
                }
            ]},
            {questions: [
                //This html describes how to think about the next set of questions.
                { type: "html", name: "inforel3", visibleIf: "{thoughtsrel3} contains 'Always' or {thoughtsrel3}='Often' or {thoughtsrel3}='time' or {thoughtsrel3}='sometimes' or {thoughtsrel3}='Rarely'", visible: false, html: "</p> <p> Think about a typical experience with your " + relationship[3] + ". Picture your " + relationship[3] + "’s face, and try to form a good image of your " + relationship[3] + ", getting an experience of You-with-your-" + relationship[3] + ".  It might help to imagine what typically happens between the two of you: what your " + relationship[3] + " does and says, how your " + relationship[3] + " does it, and what you do and say, how you do it, as well as what you are trying to do. </p> <p> Once you have recreated this experience of You-with-your-" + relationship[3] + ", please read each of the following items carefully, and rate the extent to which each statement is generally true for how you feel and think about yourself when you are interacting with your " + relationship[3] + " (now, at this point in your life)."},

                
                   //A matrix question is a set of questions using a likert or likert-like scale. So the scale goes across the top (columns), and the questions allong the side(rows). Values will be useful in the final data set. Text is what is visible to the participant.   
                { type: "matrix", name: "Qualityrel3", title: "When I interact with my " + relationship[3] + ", I feel  ... ", visibleIf: "{thoughtsrel3} contains 'Always' or {thoughtsrel3}='Often' or {thoughtsrel3}='time' or {thoughtsrel3}='sometimes' or {thoughtsrel3}='Rarely'", visible: false, isRequired: true,
                        columns: [{ value: 1, text: "Not True At All" },
                            { value: 2, text: " " },
                            { value: 3, text: " " },
                            { value: 4, text: " " },
                            { value: 5, text: "Completely True" }],
                        rows: [{ value: "competence1rel3", text: "confident I can do things well." },
                            { value: "autonomy1rel3", text: "a sense of choice and freedom in the things I undertake." },
                            { value: "relatedness1rel3", text: "caring towards this person and cared for by this person." },
                            { value: "compentence2rel3", text: "capable at what I do." },
                            { value: "autonomy2rel3", text: "my decisions reflect what I really want." },
                            { value: "relatedness2rel3", text: "close to this person." },
                            { value: "competentce3rel3", text: "competent to achieve my goals." },
                            { value: "autonomy3rel3", text: "my choices express who I really am." },
                            { value: "relatedness3rel3", text: "I experience a warm feeling with this person." },
                            { value: "compentence4rel3", text: "I can successfully complete difficult tasks." },
                            { value: "autonomy4rel3", text: "I have been doing what really interests me." },
                            { value: "relatedness4rel3", text: "connected with this person." },
                            { value: "valencerel3", text: "good about myself." }
                        ]}
            ]},
            {questions: [
                {
                    //Radio group asking about how freuqnetly the person thinks about the relationship they are answering about. 
                    type: "radiogroup",
                    name: "thoughtsrel4",
                    title: "How often are thoughts of your " + relationship[4] + " on your mind? (If you have more than one " + relationship[4] + ", answer this question for the one who you think about most frequently)",
                    colCount: 0,
                    isRequired: true,
                    choices: ["I don't have a " + relationship[4], "Never", "Rarely", "sometimes|Occasionally/sometimes", "Often", "time|Most of the Time", "Always"]
                }
            ]},
            {questions: [
                //This html describes how to think about the next set of questions.
                { type: "html", name: "inforel4", visibleIf: "{thoughtsrel4} contains 'Always' or {thoughtsrel4}='Often' or {thoughtsrel4}='time' or {thoughtsrel4}='sometimes' or {thoughtsrel4}='Rarely'", visible: false, html: "</p> <p> Think about a typical experience with your " + relationship[4] + ". Picture your " + relationship[4] + "’s face, and try to form a good image of your " + relationship[4] + ", getting an experience of You-with-your-" + relationship[4] + ".  It might help to imagine what typically happens between the two of you: what your " + relationship[4] + " does and says, how your " + relationship[4] + " does it, and what you do and say, how you do it, as well as what you are trying to do. </p> <p> Once you have recreated this experience of You-with-your-" + relationship[4] + ", please read each of the following items carefully, and rate the extent to which each statement is generally true for how you feel and think about yourself when you are interacting with your " + relationship[4] + " (now, at this point in your life)."},

                
                   //A matrix question is a set of questions using a likert or likert-like scale. So the scale goes across the top (columns), and the questions allong the side(rows). Values will be useful in the final data set. Text is what is visible to the participant.   
                { type: "matrix", name: "Qualityrel4", title: "When I interact with my " + relationship[4] + ", I feel  ... ", visibleIf: "{thoughtsrel4} contains 'Always' or {thoughtsrel4}='Often' or {thoughtsrel4}='time' or {thoughtsrel4}='sometimes' or {thoughtsrel4}='Rarely'", visible: false, isRequired: true,
                        columns: [{ value: 1, text: "Not True At All" },
                            { value: 2, text: " " },
                            { value: 3, text: " " },
                            { value: 4, text: " " },
                            { value: 5, text: "Completely True" }],
                        rows: [{ value: "competence1rel4", text: "confident I can do things well." },
                            { value: "autonomy1rel4", text: "a sense of choice and freedom in the things I undertake." },
                            { value: "relatedness1rel4", text: "caring towards this person and cared for by this person." },
                            { value: "compentence2rel4", text: "capable at what I do." },
                            { value: "autonomy2rel4", text: "my decisions reflect what I really want." },
                            { value: "relatedness2rel4", text: "close to this person." },
                            { value: "competentce3rel4", text: "competent to achieve my goals." },
                            { value: "autonomy3rel4", text: "my choices express who I really am." },
                            { value: "relatedness3rel4", text: "I experience a warm feeling with this person." },
                            { value: "compentence4rel4", text: "I can successfully complete difficult tasks." },
                            { value: "autonomy4rel4", text: "I have been doing what really interests me." },
                            { value: "relatedness4rel4", text: "connected with this person." },
                            { value: "valencerel4", text: "good about myself." }
                        ]}
            ]},
            {questions: [
                {
                    //Radio group asking about how freuqnetly the person thinks about the relationship they are answering about.
                    type: "radiogroup",
                    name: "thoughtsrel5",
                    title: "How often are thoughts of your " + relationship[5] + " on your mind? (If you have more than one " + relationship[5] + ", answer this question for the one who you think about most frequently)",
                    colCount: 0,
                    isRequired: true,
                    choices: ["I don't have a " + relationship[5], "Never", "Rarely", "sometimes|Occasionally/sometimes", "Often", "MostOfTheTime|Most of the Time", "Always"]
                }
            ]},
            {questions: [
                //This html describes how to think about the next set of questions.
                { type: "html", name: "inforel5", visibleIf: "{thoughtsrel5} contains 'Always' or {thoughtsrel5}='Often' or {thoughtsrel5}='MostOfTheTime' or {thoughtsrel5}='sometimes' or {thoughtsrel5}='Rarely'", visible: false, html: "</p> <p> Think about a typical experience with your " + relationship[5] + ". Picture your " + relationship[5] + "’s face, and try to form a good image of your " + relationship[5] + ", getting an experience of You-with-your-" + relationship[5] + ".  It might help to imagine what typically happens between the two of you: what your " + relationship[5] + " does and says, how your " + relationship[5] + " does it, and what you do and say, how you do it, as well as what you are trying to do. </p> <p> Once you have recreated this experience of You-with-your-" + relationship[5] + ", please read each of the following items carefully, and rate the extent to which each statement is generally true for how you feel and think about yourself when you are interacting with your " + relationship[5] + " (now, at this point in your life)."},

                
                   //A matrix question is a set of questions using a likert or likert-like scale. So the scale goes across the top (columns), and the questions allong the side(rows). Values will be useful in the final data set. Text is what is visible to the participant.   
                { type: "matrix", name: "Qualityrel5", title: "When I interact with my " + relationship[5] + ", I feel  ... ", visibleIf: "{thoughtsrel5} contains 'Always' or {thoughtsrel5}='Often' or {thoughtsrel5}='MostOfTheTime' or {thoughtsrel5}='sometimes' or {thoughtsrel5}='Rarely'", visible: false, isRequired: true,
                        columns: [{ value: 1, text: "Not True At All" },
                            { value: 2, text: " " },
                            { value: 3, text: " " },
                            { value: 4, text: " " },
                            { value: 5, text: "Completely True" }],
                        rows: [{ value: "competence1rel5", text: "confident I can do things well." },
                            { value: "autonomy1rel5", text: "a sense of choice and freedom in the things I undertake." },
                            { value: "relatedness1rel5", text: "caring towards this person and cared for by this person." },
                            { value: "compentence2rel5", text: "capable at what I do." },
                            { value: "autonomy2rel5", text: "my decisions reflect what I really want." },
                            { value: "relatedness2rel5", text: "close to this person." },
                            { value: "competentce3rel5", text: "competent to achieve my goals." },
                            { value: "autonomy3rel5", text: "my choices express who I really am." },
                            { value: "relatedness3rel5", text: "I experience a warm feeling with this person." },
                            { value: "compentence4rel5", text: "I can successfully complete difficult tasks." },
                            { value: "autonomy4rel5", text: "I have been doing what really interests me." },
                            { value: "relatedness4rel5", text: "connected with this person." },
                            { value: "valencerel5", text: "good about myself." }
                        ]}
            ]},
            {questions: [
                //Special question with fill-in-the-blank name. Radio group asking about how freuqnetly the person thinks about the relationship they are answering about.
                {
                    type: "text",
                    name: "name1",
                    title: "Think about another friend, or even acquaintance, who you interact with or think about a fair amount.  Write this person’s first name here: ",
                    isRequired: true,
                    size: 15,
                    width: "4"
                }
            ]},
            {questions: [
                //This html describes how to think about the next set of questions.
                { type: "html", name: "inforel6", html: "</p> <p> Picture {name1}’s face, and try to form a good image of {name1}, getting an experience of You-with-{name1}.  It might help to imagine what typically happens between the two of you: what {name1} does and says, how {name1} does it, and what you do and say, how you do it, as well as what you are trying to do. </p> <p> Once you have recreated this experience of You-with-{name1}, please read each of the following items carefully, and rate the extent to which each statement is generally true for how you feel and think about yourself when you are interacting with {name1} (now, at this point in your life)."},
                                
                   //A matrix question is a set of questions using a likert or likert-like scale. So the scale goes across the top (columns), and the questions allong the side(rows). Values will be useful in the final data set. Text is what is visible to the participant.   
                { type: "matrix", name: "Qualityrel6", title: "When I interact with {name1}, I feel  ... ", isRequired: true,
                        columns: [{ value: 1, text: "Not True At All" },
                            { value: 2, text: " " },
                            { value: 3, text: " " },
                            { value: 4, text: " " },
                            { value: 5, text: "Completely True" }],
                        rows: [{ value: "competence1rel6", text: "confident I can do things well." },
                            { value: "autonomy1rel6", text: "a sense of choice and freedom in the things I undertake." },
                            { value: "relatedness1rel6", text: "caring towards this person and cared for by this person." },
                            { value: "compentence2rel6", text: "capable at what I do." },
                            { value: "autonomy2rel6", text: "my decisions reflect what I really want." },
                            { value: "relatedness2rel6", text: "close to this person." },
                            { value: "competentce3rel6", text: "competent to achieve my goals." },
                            { value: "autonomy3rel6", text: "my choices express who I really am." },
                            { value: "relatedness3rel6", text: "I experience a warm feeling with this person." },
                            { value: "compentence4rel6", text: "I can successfully complete difficult tasks." },
                            { value: "autonomy4rel6", text: "I have been doing what really interests me." },
                            { value: "relatedness4rel6", text: "connected with this person." },
                            { value: "valencerel6", text: "good about myself." }
                        ]}
            ]},
            {questions: [
                //Special question with fill-in-the-blank name. Radio group asking about how freuqnetly the person thinks about the relationship they are answering about.
                {
                    type: "text",
                    name: "name2",
                    title: "Think about another friend, or even acquaintance, who you interact with or think about a fair amount.  Write this person’s first name here: ",
                    isRequired: true,
                    size: 15,
                    width: "4"
                }
            ]},
            {questions: [
                //This html describes how to think about the next set of questions.
                { type: "html", name: "inforel7", html: "</p> <p> Picture {name2}’s face, and try to form a good image of {name2}, getting an experience of You-with-{name2}.  It might help to imagine what typically happens between the two of you: what {name2} does and says, how {name2} does it, and what you do and say, how you do it, as well as what you are trying to do. </p> <p> Once you have recreated this experience of You-with-{name2}, please read each of the following items carefully, and rate the extent to which each statement is generally true for how you feel and think about yourself when you are interacting with {name2} (now, at this point in your life)."},
                                
                   //A matrix question is a set of questions using a likert or likert-like scale. So the scale goes across the top (columns), and the questions allong the side(rows). Values will be useful in the final data set. Text is what is visible to the participant.   
                { type: "matrix", name: "Qualityrel7", title: "When I interact with {name2}, I feel  ... ", isRequired: true,
                        columns: [{ value: 1, text: "Not True At All" },
                            { value: 2, text: " " },
                            { value: 3, text: " " },
                            { value: 4, text: " " },
                            { value: 5, text: "Completely True" }],
                        rows: [{ value: "competence1rel7", text: "confident I can do things well." },
                            { value: "autonomy1rel7", text: "a sense of choice and freedom in the things I undertake." },
                            { value: "relatedness1rel7", text: "caring towards this person and cared for by this person." },
                            { value: "compentence2rel7", text: "capable at what I do." },
                            { value: "autonomy2rel7", text: "my decisions reflect what I really want." },
                            { value: "relatedness2rel7", text: "close to this person." },
                            { value: "competentce3rel7", text: "competent to achieve my goals." },
                            { value: "autonomy3rel7", text: "my choices express who I really am." },
                            { value: "relatedness3rel7", text: "I experience a warm feeling with this person." },
                            { value: "compentence4rel7", text: "I can successfully complete difficult tasks." },
                            { value: "autonomy4rel7", text: "I have been doing what really interests me." },
                            { value: "relatedness4rel7", text: "connected with this person." },
                            { value: "valencerel7", text: "good about myself." }
                        ]}
            ]},
            {questions: [
                //Special question with fill-in-the-blank name. Radio group asking about how freuqnetly the person thinks about the relationship they are answering about.
                {
                    type: "text",
                    name: "name3",
                    title: "Think of a person that you often interact with but who you think may sometimes view you negatively or critically. This person should be different from any persons you have already answered questions for on this survey.  Please write the first name of this person who you think may view you negatively sometimes here: ",
                    isRequired: true,
                    size: 15,
                    width: "4"
                }
            ]},
            {questions: [
                //This html describes how to think about the next set of questions.
                { type: "html", name: "inforel8", html: "</p> <p> Now think about a typical experience with {name3}. Picture {name3}’s face, and try to form a good image of {name3}, getting an experience of You-with-{name3}.  It might help to imagine what typically happens between the two of you: what {name3} does and says, how {name3} does it, and what you do and say, how you do it, as well as what you are trying to do. </p> <p> Once you have recreated this experience of You-with-{name3}, please read each of the following items carefully, and rate the extent to which each statement is generally true for how you feel and think about yourself when you are interacting with {name3} (now, at this point in your life)."},
                                
                   //A matrix question is a set of questions using a likert or likert-like scale. So the scale goes across the top (columns), and the questions allong the side(rows). Values will be useful in the final data set. Text is what is visible to the participant.   
                { type: "matrix", name: "Qualityrel8", title: "When I interact with this person who I think may view me negatively or critically, I feel ... ", isRequired: true,
                        columns: [{ value: 1, text: "Not True At All" },
                            { value: 2, text: " " },
                            { value: 3, text: " " },
                            { value: 4, text: " " },
                            { value: 5, text: "Completely True" }],
                        rows: [{ value: "competence1rel8", text: "confident I can do things well." },
                            { value: "autonomy1rel8", text: "a sense of choice and freedom in the things I undertake." },
                            { value: "relatedness1rel8", text: "caring towards this person and cared for by this person." },
                            { value: "compentence2rel8", text: "capable at what I do." },
                            { value: "autonomy2rel8", text: "my decisions reflect what I really want." },
                            { value: "relatedness2rel8", text: "close to this person." },
                            { value: "competentce3rel8", text: "competent to achieve my goals." },
                            { value: "autonomy3rel8", text: "my choices express who I really am." },
                            { value: "relatedness3rel8", text: "I experience a warm feeling with this person." },
                            { value: "compentence4rel8", text: "I can successfully complete difficult tasks." },
                            { value: "autonomy4rel8", text: "I have been doing what really interests me." },
                            { value: "relatedness4rel8", text: "connected with this person." },
                            { value: "valencerel8", text: "good about myself." }
                        ]}
            ]},
            {questions: [
                //Special question with fill-in-the-blank name. Radio group asking about how freuqnetly the person thinks about the relationship they are answering about.
                {
                    type: "text",
                    name: "name4",
                    title: " Now think of a role or identity (e.g., teacher, boss, employee, poet, athlete, musician, mentor, etc.) that is important to how you think about yourself.  Please write the name of this role here: ",
                    isRequired: true,
                    size: 15,
                    width: "4"
                }
            ]},
            {questions: [
                //This html describes how to think about the next set of questions.
                { type: "html", name: "inforel9", html: "</p> <p> Now think about a typical experience when in this role of {name4} or doing activities related to {name4}. Picture yourself engaged in the role or activity, and try to form a good image of yourself doing it, where you are, what you are feeling and sensing as you are performing the activity, and what you are trying to do </p> <p> Once you have recreated this experience of You-as-{name4}, please read each of the following items carefully, and rate the extent to which each statement is generally true for how you feel and think about yourself when you are  in this role or engaged in this activity."},
                                
                   //A matrix question is a set of questions using a likert or likert-like scale. So the scale goes across the top (columns), and the questions allong the side(rows). Values will be useful in the final data set. Text is what is visible to the participant.   
                { type: "matrix", name: "Qualityrel9", title: "When I am in this role or engaged in this activity, I feel ...", isRequired: true,
                        columns: [{ value: 1, text: "Not True At All" },
                            { value: 2, text: " " },
                            { value: 3, text: " " },
                            { value: 4, text: " " },
                            { value: 5, text: "Completely True" }],
                        rows: [{ value: "competence1rel9", text: "confident I can do things well." },
                            { value: "autonomy1rel9", text: "a sense of choice and freedom in the things I undertake." },
                            { value: "relatedness1rel9", text: "caring towards others and cared for by others." },
                            { value: "compentence2rel9", text: "capable at what I do." },
                            { value: "autonomy2rel9", text: "my decisions reflect what I really want." },
                            { value: "relatedness2rel9", text: "close to others." },
                            { value: "competentce3rel9", text: "competent to achieve my goals." },
                            { value: "autonomy3rel9", text: "my choices express who I really am." },
                            { value: "relatedness3rel9", text: "I experience a warm feelings with others." },
                            { value: "compentence4rel9", text: "I can successfully complete difficult tasks." },
                            { value: "autonomy4rel9", text: "I have been doing what really interests me." },
                            { value: "relatedness4rel9", text: "connected with others." },
                            { value: "valencerel9", text: "good about myself." }
                        ]}
            ]}
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
            url: "/RSSMresult/" + tempString,
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
                window.location.href = "RSSMResults.html";
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
    init(["Mother", "Father", "Romantic Partner", "Ex-Romantic Partner", "Sibling", "Close Friend"]);
}
