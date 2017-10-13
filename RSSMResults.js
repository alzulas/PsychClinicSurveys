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
    var dataArray = dataPassed.split(",");
    //console.log(dataArray);
    var round = 0;
    for (var i = 8; i < 95; i++){
        currentComp = currentComp + Number(dataArray[i]);
        i++;
        currentAuto = currentAuto + Number(dataArray[i]);
        i++;
        currentRelated = currentRelated + Number(dataArray[i]);
        round++;
        if (round > 3){
            //console.log(currentAuto + " " + currentComp + " " + currentRelated);
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
    
    //console.log(results);
    return results;
}
