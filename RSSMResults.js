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
    var BISScore = 0;
    var BASDriveScore = 0;
    var BASRewardScore = 0;
    var BASFunScore = 0;
    var scoresCSV = [];
    var dataArray = dataPassed.split(",");
    console.log(dataArray);
    for (var i = 5; i < 12; i++){
        BISScore = Number(dataArray[i])+BISScore;
    }
    for (var i = 12; i < 16; i++){
        BASDriveScore = Number(dataArray[i])+BASDriveScore;
    }
    for (var i = 16; i < 21; i++){
        BASRewardScore = Number(dataArray[i])+BASRewardScore;
    }
    for (var i = 21; i < 25; i++){
        BASFunScore = Number(dataArray[i])+BASFunScore;
    }
    console.log(BISScore + " " + BASDriveScore + " " + BASRewardScore + " " + BASFunScore);
    scoresCSV.push(BISScore);
    scoresCSV.push(BASDriveScore);
    scoresCSV.push(BASRewardScore);
    scoresCSV.push(BASFunScore);
    console.log(scoresCSV);
    return scoresCSV;
}
