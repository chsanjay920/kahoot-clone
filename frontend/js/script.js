const apiUrl = 'https://kahoot-server.onrender.com';
const socket = io(apiUrl);

var gamecode = document.getElementById("gamepin");
var clientName = document.getElementById("username");

var codediv= document.getElementById("GameCodeDiv");
var namediv = document.getElementById("namediv");
var questionsDiv = document.getElementById("questionsDiv");
var waitingDiv = document.getElementById("waiting");
var resultdiv = document.getElementById('resultdiv');

var questionNumber = document.getElementById("questionNumber");
var question = document.getElementById("question");
var option1 = document.getElementById("option-1");
var option2 = document.getElementById("option-2");
var option3 = document.getElementById("option-3");
var option4 = document.getElementById("option-4");

var progressBar = document.getElementById("progressbar");


var clientDetailes = {
    name:"",
    gamecode:""
}

function hideAllDivs()
{
    codediv.style.display = "none";
    namediv.style.display = "none";
    questionsDiv.style.display = "none";
    waitingDiv.style.display = "none";
    resultdiv.style.display = "none";
}

function GameCodeSubmit()
{
    if(gamecode.value.length != 6)
    {
        alert("Invalid Game Code");
        return;
    }
    clientDetailes.gamecode = gamecode.value; 
    codediv.style.display = "none";
    namediv.style.display = "block";
    questionsDiv.display ="none";
}
function SubmitName()
{
    if( clientName.value.length < 0)
    {
        alert("Enter username!");
        return;
    }
    clientDetailes.name = clientName.value;
    socket.emit('playerconnected', clientDetailes);  
    codediv.style.display = "none";
    namediv.style.display = "none";
    waitingDiv.style.display ="block";
}

socket.on('getQuestion', data=>{
    console.log("question incomming");
    displayQuestions(data);
});
socket.on('overAllResult',report=>{
    console.log("over all result ");
    console.log(report);
    listResult(report.list);
});

function listResult(list)
{
    hideAllDivs();
    resultdiv.style.display="block";
    var result = `<div class="list-group list-group-numbered">`;
    list.forEach(element => {
        var listitem = `<div class="list-group-item">${element.name} scored ${element.score}</div>`
        result+=listitem;
    });
    result +=`</div>`
    var resultcontainer = document.createElement("div");
    resultcontainer.innerHTML = result;
    document.getElementById("resultdiv").appendChild(resultcontainer);
}

function displayQuestions(Data)
{
    questionsDiv.style.display = "block";
    waitingDiv.style.display = "none";
    codediv.style.display = "none";
    namediv.style.display = "none";

    progressBar.style.width = `0%`;

    question.innerHTML = `${Data.question}`;
    option1.innerHTML = `${Data.option1}`;
    option2.innerHTML = `${Data.option2}`;
    option3.innerHTML = `${Data.option3}`;
    option4.innerHTML = `${Data.option4}`;
    fillProgressBar(Data.interval*1000,()=>{
        selectedAnswer()
    });
}

var playerSelectedOption = "-1";
function PlayerSelectedAnswer(option)
{
    playerSelectedOption = option;
    questionsDiv.style.display = "none";
    waitingDiv.style.display = "block";
}

function selectedAnswer()
{
    socket.emit('answerSelected', {
        name:clientDetailes.name,
        selectedoption:playerSelectedOption
    });  
    questionsDiv.style.display = "none";
    waitingDiv.style.display = "block";
}



function fillProgressBar( duration,callback) {
    let startTime = null;

    function step(timestamp) {
        if (!startTime) startTime = timestamp;

        const elapsed = timestamp - startTime;
        const progress = Math.min(1, elapsed / duration);

        progressBar.style.width = `${progress * 100}%`;

        if (progress < 1) {
            requestAnimationFrame(step);
        }
        else {
            if(typeof callback === 'function') {
            callback();
          }
        }
    }
    requestAnimationFrame(step);
}




