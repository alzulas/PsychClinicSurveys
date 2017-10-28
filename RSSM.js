////////////////////////////////////////////////////////////
//  This file was authored by A. Leah Zulas             ////
//  It heavily utilizes surveyjs.io                     ////
//  It displays a survey and collevcts data             ////
//  If sends data using Ajax, to an express server      ////
//  Any questions about the below code should be sent to:///
//  alzulas@alzulas.com                                 ////
////////////////////////////////////////////////////////////


function init(relationship) {
    
    //This is the JSON with all the questions and format in it
    var jsonBegin = { 
        //Sets a title bar for the whole survey and a progress bar.
        title: "RSSM- Psychological Needs Assessment.", showProgressBar: "top", pages: [
        {
        questions:[
            //html questions are just information. This is a good way to introduce topics. You can use HTML mark up in these sections.
            { type: "html", name: "introAndDemographics", html: "<h2 class=\"post-title\">Welcome to the Relational Self Schema Measure.</h2> <p>General Demographic Questions.</p>"},
            //Text questions take text responses. Here, we want to know the participants ID number.
            { type: "text", name: "ID", title: "Please enter your identifying code here. If one was not provided, just leave blank."},
            //Radio groups are radio button questions. They accept a single answer. this is the gender question.
            { type: "radiogroup", name: "gender", title: "My biological sex is...", colCount: 0, choices: ["Male", "Female", "Intersex"]}
            
        ]},
        //By calling "question" again, we make the model inside the website page go to the next section of the questionnaire. The above questions will disappear and be replaced by these next questions.
        { questions: [
            //Another radio group. This time for age. 
            {type: "radiogroup", name: "age", title: "What is your age?", colCount: 2, choices: ["16-|16 years and below", "17-19|17-19 years old", "20-22|20-22 years old", "23-30|23-30 years old", "31-45|31-45 years old", "46-64|46-64 years old", "65-74|65-74 years old", "75+|75 years and older"]}
        ]},
        
        { questions: [
            //Check box questions allow for multiple answers. This one is about race.
            {type: "checkbox", name: "race", title: "Choose one or more races that you consider yourself to be:", colCount: 3, hasOther: true, choices: ["White", "Black or African American", "American Indian or Alaska Native", "Asian", "Native Hawaiian or Pacific Islander", "Spanish, Hispanic, or Latino"]}
        ]},
        
        { questions: [
            //Check box about employment status.
            {type: "checkbox", name: "employment", title: "Are you currently... ?", colCount: 3, hasOther: true, choices: ["A college student", "Employed for wages", "Self-employed", "Out of work and looking for work", "Out of work but not currently looking for work", "A homemaker", "Military", "Retired", "Unable to work"]}
        ]},
        
        { questions: [
            //Radio button question about marrital status
            {type: "radiogroup", name: "marritalStatus", title: "Are you now married, widowed, divorced, separated or never married?", colCount: 0, choices: ["Never married", "Married", "Divorced", "Seperated", "Widowed"]}
        ]},

        {      
          questions: [
              //This HTML introduces the next section. 
            { type: "html", name: "info", html: "<p> Most people think differently about themselves depending on who they are with and what they are doing.  This questionnaire is trying to get at how you think about yourself when you are with different people and when you are in different roles in your life.</p>"}
          ]},
            
        {
            questions:[
                //This html describes how to think about the next set of questions.
                { type: "html", name: "inforel0", html: "</p> <p> Think about a typical experience with your " + relationship[0] + ". Picture your " + relationship[0] + "’s face, and try to form a good image of her, getting an experience of You-with-your-" + relationship[0] + ".  It might help to imagine what typically happens between the two of you: what he/she does and says, how he/she does it, and what you do and say, how you do it, as well as what you are trying to do. </p> <p> Once you have recreated this experience of You-with-your-" + relationship[0] + ", please read each of the following items carefully, and rate the extent to which each statement is generally true for how you feel and think about yourself when you are interacting with your " + relationship[0] + " (now, at this point in your life)."},
                {
                    //Radio group asking about how freuqnetly the person thinks about the relationship they are answering about.
                    type: "radiogroup", name: "thoughtsrel0", title: "How often are thoughts of your " + relationship[0] + " on your mind?", colCount: 0, isRequired: true, choices: ["I don't have a " + relationship[0], "Never", "Rarely", "sometimes|Occasionally/sometimes", "Often", "time|Most of the Time", "Always"]},
                   //A matrix question is a set of questions using a likert or likert-like scale. So the scale goes across the top (columns), and the questions allong the side(rows). Values will be useful in the final data set. Text is what is visible to the participant.   
                   { type: "matrix", name: "Qualityrel0", title: "When I interact with my " + relationship[0] + ", I feel  ... ", visibleIf: "{thoughtsrel0} contains 'Always' or {thoughtsrel0}='Often' or {thoughtsrel0}='time' or {thoughtsrel0}='sometimes' or {thoughtsrel0}='Rarely'", visible: false, isRequired: true,
                        columns: [{ value: 1, text: "Not True At All" },
                            { value: 2, text: "❃ ❃ ❃ ❃" },
                            { value: 3, text: "❃ ❃ ❃ ❃" },
                            { value: 4, text: "❃ ❃ ❃ ❃" },
                            { value: 5, text: "Completely True" }],
                        rows: [{ value: "competence1rel0", text: "I feel confident I can do things well." },
                            { value: "autonomy1rel0", text: "I feel a sense of choice and freedom in the things I undertake." },
                            { value: "relatedness1rel0", text: "I feel caring towards this person and cared for by this person." },
                            { value: "compentence2rel0", text: "I feel capable at what I do." },
                            { value: "autonomy2rel0", text: "I feel my decisions reflect what I really want." },
                            { value: "relatedness2rel0", text: "I feel close to this person." },
                            { value: "competentce3rel0", text: "I feel competent to achieve my goals." },
                            { value: "autonomy3rel0", text: "I feel my choices express who I really am." },
                            { value: "relatedness3rel0", text: "I experience a warm feeling with this person." },
                            { value: "compentence4rel0", text: "I feel I can successfully complete difficult tasks." },
                            { value: "autonomy4rel0", text: "I feel I have been doing what really interests me." },
                            { value: "relatedness4rel0", text: "I feel connected with this person." },
                            { value: "valencerel0", text: "I feel good about myself." }
                    ]}
            ]},   
        {
            questions:[
                //This html describes how to think about the next set of questions.
                { type: "html", name: "inforel1", html: "</p> <p> Think about a typical experience with your " + relationship[1] + ". Picture your " + relationship[1] + "’s face, and try to form a good image of her, getting an experience of You-with-your-" + relationship[1] + ".  It might help to imagine what typically happens between the two of you: what he/she does and says, how he/she does it, and what you do and say, how you do it, as well as what you are trying to do. </p> <p> Once you have recreated this experience of You-with-your-" + relationship[1] + ", please read each of the following items carefully, and rate the extent to which each statement is generally true for how you feel and think about yourself when you are interacting with your " + relationship[1] + " (now, at this point in your life)."},
                {
                    //Radio group asking about how freuqnetly the person thinks about the relationship they are answering about.
                    type: "radiogroup", name: "thoughtsrel1", title: "How often are thoughts of your " + relationship[1] + " on your mind?", colCount: 0, isRequired: true, choices: ["I don't have a " + relationship[1], "Never", "Rarely", "sometimes|Occasionally/sometimes", "Often", "time|Most of the Time", "Always"]},
                   //A matrix question is a set of questions using a likert or likert-like scale. So the scale goes across the top (columns), and the questions allong the side(rows). Values will be useful in the final data set. Text is what is visible to the participant.   
                   { type: "matrix", name: "Qualityrel1", title: "When I interact with my " + relationship[1] + ", I feel  ... ", visibleIf: "{thoughtsrel1} contains 'Always' or {thoughtsrel1}='Often' or {thoughtsrel1}='time' or {thoughtsrel1}='sometimes' or {thoughtsrel1}='Rarely'", visible: false, isRequired: true,
                        columns: [{ value: 1, text: "Not True At All" },
                            { value: 2, text: "❃ ❃ ❃ ❃" },
                            { value: 3, text: "❃ ❃ ❃ ❃" },
                            { value: 4, text: "❃ ❃ ❃ ❃" },
                            { value: 5, text: "Completely True" }],
                        rows: [{ value: "competence1rel1", text: "I feel confident I can do things well." },
                            { value: "autonomy1rel1", text: "I feel a sense of choice and freedom in the things I undertake." },
                            { value: "relatedness1rel1", text: "I feel caring towards this person and cared for by this person." },
                            { value: "compentence2rel1", text: "I feel capable at what I do." },
                            { value: "autonomy2rel1", text: "I feel my decisions reflect what I really want." },
                            { value: "relatedness2rel1", text: "I feel close to this person." },
                            { value: "competentce3rel1", text: "I feel competent to achieve my goals." },
                            { value: "autonomy3rel1", text: "I feel my choices express who I really am." },
                            { value: "relatedness3rel1", text: "I experience a warm feeling with this person." },
                            { value: "compentence4rel1", text: "I feel I can successfully complete difficult tasks." },
                            { value: "autonomy4rel1", text: "I feel I have been doing what really interests me." },
                            { value: "relatedness4rel1", text: "I feel connected with this person." },
                            { value: "valencerel1", text: "I feel good about myself." }
                    ]}
            ]},
            {
            questions:[
                //This html describes how to think about the next set of questions.
                { type: "html", name: "inforel2", html: "</p> <p> Think about a typical experience with your " + relationship[2] + ". Picture your " + relationship[2] + "’s face, and try to form a good image of her, getting an experience of You-with-your-" + relationship[2] + ".  It might help to imagine what typically happens between the two of you: what he/she does and says, how he/she does it, and what you do and say, how you do it, as well as what you are trying to do. </p> <p> Once you have recreated this experience of You-with-your-" + relationship[2] + ", please read each of the following items carefully, and rate the extent to which each statement is generally true for how you feel and think about yourself when you are interacting with your " + relationship[2] + " (now, at this point in your life)."},
                {
                    //Radio group asking about how freuqnetly the person thinks about the relationship they are answering about.
                    type: "radiogroup", name: "thoughtsrel2", title: "How often are thoughts of your " + relationship[2] + " on your mind?", colCount: 0, isRequired: true, choices: ["I don't have a " + relationship[2], "Never", "Rarely", "sometimes|Occasionally/sometimes", "Often", "time|Most of the Time", "Always"]},
                   //A matrix question is a set of questions using a likert or likert-like scale. So the scale goes across the top (columns), and the questions allong the side(rows). Values will be useful in the final data set. Text is what is visible to the participant.   
                   { type: "matrix", name: "Qualityrel2", title: "When I interact with my " + relationship[2] + ", I feel  ... ", visibleIf: "{thoughtsrel2} contains 'Always' or {thoughtsrel2}='Often' or {thoughtsrel2}='time' or {thoughtsrel2}='sometimes' or {thoughtsrel2}='Rarely'", visible: false, isRequired: true,
                        columns: [{ value: 1, text: "Not True At All" },
                            { value: 2, text: "❃ ❃ ❃ ❃" },
                            { value: 3, text: "❃ ❃ ❃ ❃" },
                            { value: 4, text: "❃ ❃ ❃ ❃" },
                            { value: 5, text: "Completely True" }],
                        rows: [{ value: "competence1rel2", text: "I feel confident I can do things well." },
                            { value: "autonomy1rel2", text: "I feel a sense of choice and freedom in the things I undertake." },
                            { value: "relatedness1rel2", text: "I feel caring towards this person and cared for by this person." },
                            { value: "compentence2rel2", text: "I feel capable at what I do." },
                            { value: "autonomy2rel2", text: "I feel my decisions reflect what I really want." },
                            { value: "relatedness2rel2", text: "I feel close to this person." },
                            { value: "competentce3rel2", text: "I feel competent to achieve my goals." },
                            { value: "autonomy3rel2", text: "I feel my choices express who I really am." },
                            { value: "relatedness3rel2", text: "I experience a warm feeling with this person." },
                            { value: "compentence4rel2", text: "I feel I can successfully complete difficult tasks." },
                            { value: "autonomy4rel2", text: "I feel I have been doing what really interests me." },
                            { value: "relatedness4rel2", text: "I feel connected with this person." },
                            { value: "valencerel2", text: "I feel good about myself." }
                    ]}
            ]},
            {
            questions:[
                //This html describes how to think about the next set of questions.
                { type: "html", name: "inforel3", html: "</p> <p> Think about a typical experience with your " + relationship[3] + ". Picture your " + relationship[3] + "’s face, and try to form a good image of her, getting an experience of You-with-your-" + relationship[3] + ".  It might help to imagine what typically happens between the two of you: what he/she does and says, how he/she does it, and what you do and say, how you do it, as well as what you are trying to do. </p> <p> Once you have recreated this experience of You-with-your-" + relationship[3] + ", please read each of the following items carefully, and rate the extent to which each statement is generally true for how you feel and think about yourself when you are interacting with your " + relationship[3] + " (now, at this point in your life)."},
                {
                    //Radio group asking about how freuqnetly the person thinks about the relationship they are answering about.
                    type: "radiogroup", name: "thoughtsrel3", title: "How often are thoughts of your " + relationship[3] + " on your mind?", colCount: 0, isRequired: true, choices: ["I don't have a " + relationship[3], "Never", "Rarely", "sometimes|Occasionally/sometimes", "Often", "time|Most of the Time", "Always"]},
                   //A matrix question is a set of questions using a likert or likert-like scale. So the scale goes across the top (columns), and the questions allong the side(rows). Values will be useful in the final data set. Text is what is visible to the participant.   
                   { type: "matrix", name: "Qualityrel3", title: "When I interact with my " + relationship[3] + ", I feel  ... ", visibleIf: "{thoughtsrel3} contains 'Always' or {thoughtsrel3}='Often' or {thoughtsrel3}='time' or {thoughtsrel3}='sometimes' or {thoughtsrel3}='Rarely'", visible: false, isRequired: true,
                        columns: [{ value: 1, text: "Not True At All" },
                            { value: 2, text: "❃ ❃ ❃ ❃" },
                            { value: 3, text: "❃ ❃ ❃ ❃" },
                            { value: 4, text: "❃ ❃ ❃ ❃" },
                            { value: 5, text: "Completely True" }],
                        rows: [{ value: "competence1rel3", text: "I feel confident I can do things well." },
                            { value: "autonomy1rel3", text: "I feel a sense of choice and freedom in the things I undertake." },
                            { value: "relatedness1rel3", text: "I feel caring towards this person and cared for by this person." },
                            { value: "compentence2rel3", text: "I feel capable at what I do." },
                            { value: "autonomy2rel3", text: "I feel my decisions reflect what I really want." },
                            { value: "relatedness2rel3", text: "I feel close to this person." },
                            { value: "competentce3rel3", text: "I feel competent to achieve my goals." },
                            { value: "autonomy3rel3", text: "I feel my choices express who I really am." },
                            { value: "relatedness3rel3", text: "I experience a warm feeling with this person." },
                            { value: "compentence4rel3", text: "I feel I can successfully complete difficult tasks." },
                            { value: "autonomy4rel3", text: "I feel I have been doing what really interests me." },
                            { value: "relatedness4rel3", text: "I feel connected with this person." },
                            { value: "valencerel3", text: "I feel good about myself." }
                    ]}
            ]}, 
            {
            questions:[
                //This html describes how to think about the next set of questions.
                { type: "html", name: "inforel4", html: "</p> <p> Think about a typical experience with your " + relationship[4] + ". Picture your " + relationship[4] + "’s face, and try to form a good image of her, getting an experience of You-with-your-" + relationship[4] + ".  It might help to imagine what typically happens between the two of you: what he/she does and says, how he/she does it, and what you do and say, how you do it, as well as what you are trying to do. </p> <p> Once you have recreated this experience of You-with-your-" + relationship[4] + ", please read each of the following items carefully, and rate the extent to which each statement is generally true for how you feel and think about yourself when you are interacting with your " + relationship[4] + " (now, at this point in your life)."},
                {
                    //Radio group asking about how freuqnetly the person thinks about the relationship they are answering about.
                    type: "radiogroup", name: "thoughtsrel4", title: "How often are thoughts of your " + relationship[4] + " on your mind?", colCount: 0, isRequired: true, choices: ["I don't have a " + relationship[4], "Never", "Rarely", "sometimes|Occasionally/sometimes", "Often", "time|Most of the Time", "Always"]},
                   //A matrix question is a set of questions using a likert or likert-like scale. So the scale goes across the top (columns), and the questions allong the side(rows). Values will be useful in the final data set. Text is what is visible to the participant.   
                   { type: "matrix", name: "Qualityrel4", title: "When I interact with my " + relationship[4] + ", I feel  ... ", visibleIf: "{thoughtsrel4} contains 'Always' or {thoughtsrel4}='Often' or {thoughtsrel4}='time' or {thoughtsrel4}='sometimes' or {thoughtsrel4}='Rarely'", visible: false, isRequired: true,
                        columns: [{ value: 1, text: "Not True At All" },
                            { value: 2, text: "❃ ❃ ❃ ❃" },
                            { value: 3, text: "❃ ❃ ❃ ❃" },
                            { value: 4, text: "❃ ❃ ❃ ❃" },
                            { value: 5, text: "Completely True" }],
                        rows: [{ value: "competence1rel4", text: "I feel confident I can do things well." },
                            { value: "autonomy1rel4", text: "I feel a sense of choice and freedom in the things I undertake." },
                            { value: "relatedness1rel4", text: "I feel caring towards this person and cared for by this person." },
                            { value: "compentence2rel4", text: "I feel capable at what I do." },
                            { value: "autonomy2rel4", text: "I feel my decisions reflect what I really want." },
                            { value: "relatedness2rel4", text: "I feel close to this person." },
                            { value: "competentce3rel4", text: "I feel competent to achieve my goals." },
                            { value: "autonomy3rel4", text: "I feel my choices express who I really am." },
                            { value: "relatedness3rel4", text: "I experience a warm feeling with this person." },
                            { value: "compentence4rel4", text: "I feel I can successfully complete difficult tasks." },
                            { value: "autonomy4rel4", text: "I feel I have been doing what really interests me." },
                            { value: "relatedness4rel4", text: "I feel connected with this person." },
                            { value: "valencerel4", text: "I feel good about myself." }
                    ]}
            ]},
            {
            questions:[
                //This html describes how to think about the next set of questions.
                { type: "html", name: "inforel5", html: "</p> <p> Think about a typical experience with your " + relationship[5] + ". Picture your " + relationship[5] + "’s face, and try to form a good image of her, getting an experience of You-with-your-" + relationship[5] + ".  It might help to imagine what typically happens between the two of you: what he/she does and says, how he/she does it, and what you do and say, how you do it, as well as what you are trying to do. </p> <p> Once you have recreated this experience of You-with-your-" + relationship[5] + ", please read each of the following items carefully, and rate the extent to which each statement is generally true for how you feel and think about yourself when you are interacting with your " + relationship[5] + " (now, at this point in your life)."},
                {
                    //Radio group asking about how freuqnetly the person thinks about the relationship they are answering about.
                    type: "radiogroup", name: "thoughtsrel5", title: "How often are thoughts of your " + relationship[5] + " on your mind?", colCount: 0, isRequired: true, choices: ["I don't have a " + relationship[5], "Never", "Rarely", "sometimes|Occasionally/sometimes", "Often", "MostOfTheTime|Most of the Time", "Always"]},
                   //A matrix question is a set of questions using a likert or likert-like scale. So the scale goes across the top (columns), and the questions allong the side(rows). Values will be useful in the final data set. Text is what is visible to the participant.   
                   { type: "matrix", name: "Qualityrel5", title: "When I interact with my " + relationship[5] + ", I feel  ... ", visibleIf: "{thoughtsrel5} contains 'Always' or {thoughtsrel5}='Often' or {thoughtsrel5}='MostOfTheTime' or {thoughtsrel5}='sometimes' or {thoughtsrel5}='Rarely'", visible: false, isRequired: true,
                        columns: [{ value: 1, text: "Not True At All" },
                            { value: 2, text: "❃ ❃ ❃ ❃" },
                            { value: 3, text: "❃ ❃ ❃ ❃" },
                            { value: 4, text: "❃ ❃ ❃ ❃" },
                            { value: 5, text: "Completely True" }],
                        rows: [{ value: "competence1rel5", text: "I feel confident I can do things well." },
                            { value: "autonomy1rel5", text: "I feel a sense of choice and freedom in the things I undertake." },
                            { value: "relatedness1rel5", text: "I feel caring towards this person and cared for by this person." },
                            { value: "compentence2rel5", text: "I feel capable at what I do." },
                            { value: "autonomy2rel5", text: "I feel my decisions reflect what I really want." },
                            { value: "relatedness2rel5", text: "I feel close to this person." },
                            { value: "competentce3rel5", text: "I feel competent to achieve my goals." },
                            { value: "autonomy3rel5", text: "I feel my choices express who I really am." },
                            { value: "relatedness3rel5", text: "I experience a warm feeling with this person." },
                            { value: "compentence4rel5", text: "I feel I can successfully complete difficult tasks." },
                            { value: "autonomy4rel5", text: "I feel I have been doing what really interests me." },
                            { value: "relatedness4rel5", text: "I feel connected with this person." },
                            { value: "valencerel5", text: "I feel good about myself." }
                    ]}
            ]}, 
             
        { questions: [
            //This html just explains what the participant just did.
            { type: "html", name: "feedbackIntro",
                html: "<p>The measure you completed was designed to assess how you experience yourself when you are interacting with different significant others in your life or engaged in different roles.  More specifically, this questionnaire measures to what extent you experience satisfaction of 3 psychological needs in these different interactions. </p><p> According to self-determination theory (Ryan & Deci, 2000), humans have three essential needs that if satisfied promote psychological well-being. These 3 needs are: </p><p>Relatedness-which is the experience of intimacy and genuine connection with others.</p><p>Competence-which is the experience of feeling effective and capable of achieving desired outcomes.</p><p>Autonomy-which is the experience of self-determination, full willingness, and volition when carrying out an activity.  "}
        ]}
    ]};
    
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
    survey.onComplete.add(function(result) {
        document.querySelector('#surveyResult').innerHTML = "result: " + JSON.stringify(result.data);
        var surveyResult;
        //Send results to the server, type of content is json
        surveyResult=result.data;
        $.ajax({
            type: "POST",
            url: "/result",
            async: false,
            data: JSON.stringify({survey: surveyResult}),
            success: function(data){
                if(data==='done')
                {
                    alert("Data send successful");
                }
            },
            contentType: "application/json"
        });
        var surveyString = JSON.stringify(surveyResult);
        if (surveyString.includes("ID")){ 
            //Set a cookie with the user ID
            var pos = surveyString.indexOf("ID");
            var pos = pos + "ID".length+3;
            var tempString = surveyString[pos];
            pos++;
            while (surveyString[pos] != "\""){
                tempString += surveyString[pos];
                pos++;
            }
            var d = new Date();
            d.setTime(d.getTime() + (1*24*60*60*1000)); //Cookie set to self destruct in a day
            var expires = "expires="+ d.toUTCString();
            document.cookie = "userName=" + tempString + ";" + expires;
            //console.log(expires);
            //console.log(tempString);
            //console.log(document.cookie);
        }
        window.location.href = "RSSMResults.html";
    });

    $("#surveyElement").Survey({model: model});

}

//This is just the way js works. There is a thing asking if the page came up properly, and if so then run the init above. 
if(!window["%hammerhead%"]) {
    //console.log("begin"); //debugging code.
    init(["Mother", "Father", "Romantic Partner", "Ex-Romantic Partner", "Sibling", "Close Friend"]);
}
