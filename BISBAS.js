function init() {
    
    //var i = 0;
    var jsonBegin = { 
        title: " The BIS-BAS.", showProgressBar: "top", pages: [
        {
        questions:[
            { type: "html", name: "introAndDemographics", html: "<h2 class=\"post-title\">Welcome to the behavioural inhibition system (BIS) and the behavioural activation system (BAS) survey.</h2> <p>General Demographic Questions.</p>"},
            { type: "text", name: "ID", title: "Please enter your identifying code here. If one was not provided, just leave blank."},
            { type: "radiogroup", name: "gender", title: "My biological sex is...", colCount: 0, choices: ["Male", "Female", "Intersex"]}
            
        ]},
        
        { questions: [
            {type: "radiogroup", name: "age", title: "What is your age?", choices: ["16 years and below", "17-19 years old", "20-22 years old", "23-30 years old", "31-45 years old", "46-64 years old", "65-74 years old", "75 years and older"]}
        ]},
        
        { questions: [
            {type: "checkbox", name: "race", title: "Choose one or more races that you consider yourself to be:", colCount: 2, hasOther: true, choices: ["White", "Black or African American", "American Indian or Alaska Native", "Asian", "Native Hawaiian or Pacific Islander", "Spanish, Hispanic, or Latino"]}
        ]},
        
        { questions: [
            {type: "checkbox", name: "employment", title: "Are you currently... ?", colCount: 2, hasOther: true, choices: ["A college student", "Employed for wages", "Self-employed", "Out of work and looking for work", "Out of work but not currently looking for work", "A homemaker", "Military", "Retired", "Unable to work"]}
        ]},
        
        {      
          questions: [
            { type: "html", name: "info", html: "<p>Each of the items on this page is a statement that a person may either agree with or disagree with. For each item, indicate how much you agree with or disagree with what the item says. Please respond to all the items; do not leave any blank. Choose only one response to each statement. Please be as accurate and honest as you can be. Respond to each item as if it were the only item. That is, don't worry about being \"consistent\" in your responses."}
          ]},
            
        {
            questions: [
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
                        { value: "filler2", text: "How I dress is important to me." },
                        { value: "BASReward2", text: "When I get something I want, I feel excited and energized." },
                        { value: "BIS2", text: "Criticism or scolding hurts me quite a bit." }]}
            ]},
            
        {
            questions: [
                { type: "matrix", name: "Quality", title: "Please respond to the following.", 
                    columns: [{ value: 1, text: "Very true for me" },
                        { value: 2, text: "Somewhat true for me" },
                        { value: 3, text: "Somewhat false for me" },
                        { value: 4, text: "Very false for me" }],
                    rows: [
                        { value: "BASDrive2", text: "When I want something I usually go all-out to get it." },
                        { value: "BASFun2", text: "I will often do things for no other reason than that they might be fun." },
                        { value: "filler3", text: "It's hard for me to find the time to do things such as get a haircut." },
                        { value: "BASDrive3", text: "If I see a chance to get something I want I move on it right away." },
                        { value: "BIS3", text: "I feel pretty worried or upset when I think or know somebody is angry at me." },
                        { value: "BASReward3", text: "When I see an opportunity for something I like I get excited right away." },
                        { value: "BASFun3", text: "I often act on the spur of the moment." },
                        { value: "BIS4", text: "If I think something unpleasant is going to happen I usually get pretty \"worked up.\"" }]}
            ]},
            
        {
            questions: [
                { type: "matrix", name: "Quality", title: "Please respond to the following.", 
                    columns: [{ value: 1, text: "Very true for me" },
                        { value: 2, text: "Somewhat true for me" },
                        { value: 3, text: "Somewhat false for me" },
                        { value: 4, text: "Very false for me" }],
                    rows: [            
                        { value: "filler4", text: "I often wonder why people act the way they do." },
                        { value: "BASReward4", text: "When good things happen to me, it affects me strongly." },
                        { value: "BIS5", text: "I feel worried when I think I have done poorly at something important." },
                        { value: "BASFun4", text: "I crave excitement and new sensations." },
                        { value: "BASDrive4", text: "When I go after something I use a \"no holds barred\" approach." },
                        { value: "BIS6", text: "I have very few fears compared to my friends." },
                        { value: "BASReward5", text: "It would excite me to win a contest." },
                        { value: "BIS7", text: "I worry about making mistakes." }]}
            ]},
            
        { questions: [
            { type: "text", name: "email",
                title: "Thank you for taking our survey. Your survey is almost complete, please enter your email address in the box below if you wish to participate in our drawing, then press the 'Submit' button."}
        ]}
    ]};
    
    console.log(jsonBegin);
    
    Survey.defaultBootstrapCss.navigationButton = "btn btn-primary";
    Survey.Survey.cssType = "bootstrapmaterial";
    Survey.Survey.cssType = "bootstrap";

    var model = new Survey.Model(jsonBegin);
    window.survey = model;
    
    survey.onComplete.add(function(result) {
        document.querySelector('#surveyResult').innerHTML = "result: " + JSON.stringify(result.data);
        var surveyResult;
        //Send results to the server, type of content is json
        surveyResult=result.data;
        $.ajax({
            type: "POST",
            url: "/result",
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
            var pos = surveyString.indexOf("ID");
            var pos = pos + "ID".length+3;
            var tempString = surveyString[pos];
            pos++;
            while (surveyString[pos] != "\""){
                tempString += surveyString[pos];
                pos++;
            }
            var d = new Date();
            d.setTime(d.getTime() + (1*24*60*60*1000));
            var expires = "expires="+ d.toUTCString();
            document.cookie = "userName=" + tempString + ";" + expires;
            console.log(expires);
            console.log(tempString);
            console.log(document.cookie);
        }
        window.location.href = "BISBASResults.html";
    });

    $("#surveyElement").Survey({model: model});
}


if(!window["%hammerhead%"]) {
    console.log("begin");
    init();
}

