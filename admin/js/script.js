const apiUrl = 'http://localhost:8000';
const socket = io(apiUrl);
const fileInput = document.getElementById('file-input');
const questioslistdiv = document.getElementById("questionsList");
const startedQuestionsList = document.getElementById("startedQuestionsList");
const questionsRenderingDiv = document.getElementById("questionsRender");
const quizetimeDiv = document.getElementById("quizetime");
const createQuestionsDiv = document.getElementById("CreateQuestions");
const startedQuestionsListdiv = document.getElementById("startQuiz");

const question = document.getElementById("question");
const option1 = document.getElementById("option1");
const option2 = document.getElementById("option2");
const option3 = document.getElementById("option3");
const option4 = document.getElementById("option4");
const radiobtn = document.getElementsByName("answer");
const interval = document.getElementById("interval");
const title = document.getElementById("title");
const description = document.getElementById("description");

var currentQuize = {};
var currentQuestionAnswers = [];
var currectoption = "";
var pincode = "";
var QuizQuestion = []
var contr = 0;
var islastQuestion = false;
var currectQuizMetaData = {
    title:"",
    description:"",
    pincode:""
};
var finalReport = []

fileInput.addEventListener('change', uploadFile);
// function to click hidden input feild
function fileuploadclick() {
    fileInput.click();
}
// function to hit file upload api
function uploadFile() {
    const file = fileInput.files[0];
    if (!file) {
        alert('Please select a file to upload.');
        return;
    }
    const formData = new FormData();
    formData.append('file', file);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${apiUrl}/upload`, true);
    xhr.onload = function () {
        if (xhr.status === 200) {
            // console.log('File upload successful:', xhr.responseText);
            renderQuestions(JSON.parse(xhr.responseText));
        } else {
            console.error('File upload failed. Status code:', xhr.status);
        }
    };
    xhr.send(formData);
}
function renderQuestions(questionslist) {
    hideAllSections();
    questionsRenderingDiv.style.display = "block";

    console.log(questionslist);
    QuizQuestion = questionslist;
    questionslist.forEach(element => {
        var questiondiv = document.createElement("div");
        questiondiv.classList = ["list-group-item d-flex justify-content-between align-items-start"];

        var quest = document.createElement("div");
        quest.classList = ["fw-bold"];
        quest.innerHTML = element.question;

        var options = document.createElement("div");
        options.className = ["row mt-2"];

        var option1 = document.createElement("div");
        option1.className = ["col-6"];
        option1.innerHTML = `a. ${element.option1}`;
        options.appendChild(option1);

        var option2 = document.createElement("div");
        option2.className = ["col-6"];
        option2.innerHTML = `b. ${element.option2}`;
        options.appendChild(option2);

        var option3 = document.createElement("div");
        option3.className = ["col-6"];
        option3.innerHTML = `c. ${element.option3}`;
        options.appendChild(option3);

        var option4 = document.createElement("div");
        option4.className = ["col-6"];
        option4.innerHTML = `d. ${element.option4}`;
        options.appendChild(option4);

        var que = document.createElement("div");
        que.className = ["ms-2 me-auto"];
        que.appendChild(quest);
        que.appendChild(options);

        questiondiv.appendChild(que);
        console.log(questiondiv);

        var answerdiv = document.createElement("span");
        answerdiv.className = ["badge bg-primary rounded-pill"];
        answerdiv.innerHTML = `${element.answer}`;
        questiondiv.appendChild(answerdiv);

        questioslistdiv.appendChild(questiondiv);
    });
}
function saveQuize() {
    showTitleModel();
}
function clearForm() {
    question.value = "";
    option1.value = "";
    option2.value = "";
    option3.value = "";
    option4.value = "";
    var ele = document.getElementsByName("answer");
    for (var i = 0; i < ele.length; i++)
        ele[i].checked = false;

    var cells = document.getElementsByClassName("saved-question-cell");
    console.log(cells);
}
function checkValidation() {

    var isanswerselected = false;
    if (question.value === 0) {
        alert("Question is requred!");
        return false;
    }
    if (option1.value.length == 0 && option2.value.length == 0 && option3.value.length == 0 && option4.value.length == 0) {
        alert("All Options are Required!");
        return false;
    }
    for (i = 0; i < radiobtn.length; i++) {
        if (radiobtn[i].checked) {
            isanswerselected = true;
            answer = radiobtn[i];
        }
    }
    if (isanswerselected == false) {
        alert("Answer should be selected!");
        return false;
    }
    return true;
}
function addQuestion() {
    if (checkValidation()) {
        var que = {
            question: question.value,
            option1: option1.value,
            option2: option2.value,
            option3: option3.value,
            option4: option4.value,
            answer: answer.value,
            interval: interval.value
        }
        newQuestion(que);
        QuizQuestion.push(que);
        clearForm();
    }
}
function newQuestion(element) {
    var questiondiv = document.createElement("div");
    questiondiv.classList = ["list-group-item d-flex justify-content-between align-items-start"];

    var quest = document.createElement("div");
    quest.classList = ["fw-bold"];
    quest.innerHTML = element.question;

    var options = document.createElement("div");
    options.className = ["row mt-2"];

    var option1 = document.createElement("div");
    option1.className = ["col-6"];
    option1.innerHTML = `a. ${element.option1}`;
    options.appendChild(option1);

    var option2 = document.createElement("div");
    option2.className = ["col-6"];
    option2.innerHTML = `b. ${element.option2}`;
    options.appendChild(option2);

    var option3 = document.createElement("div");
    option3.className = ["col-6"];
    option3.innerHTML = `c. ${element.option3}`;
    options.appendChild(option3);

    var option4 = document.createElement("div");
    option4.className = ["col-6"];
    option4.innerHTML = `d. ${element.option4}`;
    options.appendChild(option4);

    var que = document.createElement("div");
    que.className = ["ms-2 me-auto"];
    que.appendChild(quest);
    que.appendChild(options);

    questiondiv.appendChild(que);
    console.log(questiondiv);

    var answerdiv = document.createElement("span");
    answerdiv.className = ["badge bg-primary rounded-pill"];
    answerdiv.innerHTML = `${element.answer}`;
    questiondiv.appendChild(answerdiv);

    document.getElementById("questionsList2").appendChild(questiondiv);
}
function showTitleModel() {
    document.getElementById("toggleTitleModel").click();
}
function ShowCreateQuizModel() {
    hideAllSections();
    createQuestionsDiv.style.display = "block";
}
async function  saveQuestions() {
    if (title.value.length == 0) {
        alert("Title id Required!");
        return;
    }
    currectQuizMetaData.title = title.value;
    currectQuizMetaData.description = description.value;
    await fetch(`${apiUrl}/addQuestion`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "title": title.value,
            "description": description.value,
            "questions": QuizQuestion
        }),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then((data) => {
            console.log('Server response:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}
function hideAllSections() {
    questionsRenderingDiv.style.display = "none";
    createQuestionsDiv.style.display = "none";
    quizetimeDiv.style.display = "none";
}
// load quizzes data from server
async function loadSavedQuizes() {
    let quizes = [];
    await fetch(`${apiUrl}/allQuestions`).then(data => data.json().then(response => {
        quizes = response;
        quizes.forEach(element => {
            var listitem = document.createElement("div");
            listitem.classList = ["list-group-item d-flex justify-content-between align-items-start"];

            var d = document.createElement("div");
            d.classList = ["ms-2 me-auto"];

            var title = document.createElement("div");
            title.classList = ["fw-bold"];

            var description = document.createElement("div");

            var startbtn = document.createElement("div");
            startbtn.classList = ["btn btn-outline-primary w-25"];

            title.innerHTML = element.data.title;
            description.innerHTML = element.data.description;
            startbtn.innerHTML = "start";
            startbtn.value = element.QuizzId,
                startbtn.addEventListener("click", (e) => {
                    startQuizeByID(e.target.value);
                })

            d.appendChild(title);
            d.appendChild(description);

            listitem.appendChild(d);
            listitem.appendChild(startbtn);

            document.getElementById("savedQuizzes").appendChild(listitem);
        });
    }))
}
function startQuizeByID(quizID) {
    hideAllSections();
    pincode = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    currectQuizMetaData.pincode = pincode;
    document.getElementById("passcode").value = `passcode : ${pincode}`;
    socket.emit('connection', { passcode: pincode });
    fetch(`${apiUrl}/getQuestionsByID/${quizID}`,).then(data => data.json().then(response => {
        currentQuize = response;
        document.getElementById("startQuizTitle").innerHTML = response.data.title;
        document.getElementById("startQuizDescription").innerHTML = response.data.description;
        startedQuestionsListRender(response.data.questions);
    }))
}
function startedQuestionsListRender(questionslist) {
    hideAllSections();
    startedQuestionsListdiv.style.display = "block";
    startedQuestionsList.innerHTML = "";
    var counter = 0;
    questionslist.forEach(element => {
        var questiondiv = document.createElement("div");
        questiondiv.classList = ["list-group-item d-flex justify-content-between align-items-start"];
        questiondiv.id = `question${counter}`;

        var quest = document.createElement("div");
        quest.classList = ["fw-bold"];
        quest.innerHTML = element.question;

        var options = document.createElement("div");
        options.className = ["row mt-2"];

        var option1 = document.createElement("div");
        option1.className = ["col-6"];
        option1.innerHTML = `a. ${element.option1}`;
        options.appendChild(option1);

        var option2 = document.createElement("div");
        option2.className = ["col-6"];
        option2.innerHTML = `b. ${element.option2}`;
        options.appendChild(option2);

        var option3 = document.createElement("div");
        option3.className = ["col-6"];
        option3.innerHTML = `c. ${element.option3}`;
        options.appendChild(option3);

        var option4 = document.createElement("div");
        option4.className = ["col-6"];
        option4.innerHTML = `d. ${element.option4}`;
        options.appendChild(option4);

        var que = document.createElement("div");
        que.className = ["ms-2 me-auto"];
        que.appendChild(quest);
        que.appendChild(options);

        var startbtn = document.createElement("span");
        startbtn.id = `startbtn${counter}`;
        startbtn.className = ["btn px-1 btn-outline-success py-0 ms-2"];
        startbtn.style.fontSize = "x-small"
        startbtn.innerHTML = `start-${counter + 1}`;
        startbtn.value = counter;
        startbtn.addEventListener("click", (e) => {
            sendQuestionToPlayers(e.target.value);
        });

        var answerdiv = document.createElement("span");
        answerdiv.className = ["badge bg-primary rounded-pill"];
        answerdiv.innerHTML = `Answer : ${element.answer}`;

        var progress = document.createElement("div");
        progress.classList = ["progress mb-2"];

        var progressbar = document.createElement("div");
        progressbar.classList = ["progress-bar"];
        progressbar.id = `progressbar${counter}`;
        progress.style.height = "10px";
        progress.appendChild(progressbar);

        questiondiv.appendChild(que);
        questiondiv.appendChild(answerdiv);
        questiondiv.appendChild(startbtn);

        startedQuestionsList.appendChild(questiondiv);
        startedQuestionsList.appendChild(progress);
        counter++;
    });
}
function sendQuestionToPlayers(questionNumber) {
    currentQuestionAnswers = [];
    currectQuizMetaData.pincode = pincode;
    console.log(">>>>>",currectQuizMetaData);
    currectoption = currentQuize.data.questions[questionNumber].answer;
    if (currentQuize.data.questions.length == contr + 1)
        islastQuestion = true;
    socket.emit('sendQuestion', { data: currentQuize.data.questions[questionNumber], passcode: pincode });
    document.getElementById(`startbtn${questionNumber}`).style.display = "none";
    contr++;
    fillProgressBar(`progressbar${questionNumber}`, currentQuize.data.questions[questionNumber].interval * 1000 + 3000, () => {
        document.getElementById(`question${questionNumber}`).style.backgroundColor = "rgba(220, 220, 220, 0.782)";
        calculateScores(currentQuestionAnswers, currectoption);
    });
}
function calculateScores(arr, currectoption) {
    arr.forEach(element => {
        if (element.selectedoption == currectoption) {
            finalReport.forEach(e => {
                if (e.name == element.name) {
                    e.score += 1;
                }
            });
        }
    });
    console.log(islastQuestion);
    if (islastQuestion)
        displayFinalReport(finalReport);
    displayReport(finalReport);
}
function displayReport(report) {
    var arr = report.sort((a, b) => parseFloat(b.score) - parseFloat(a.score));
    document.getElementById("generalranking").innerHTML = "";
    arr.forEach(e => {
        var div = document.createElement("div");
        div.classList = ['list-group-item']
        div.innerHTML = e.name;
        document.getElementById("generalranking").appendChild(div);
    });
    console.log("||", arr);
    document.getElementById("generalToggleBtn").click();
}
function displayFinalReport(report) {
    var arr = report.sort((a, b) => parseFloat(b.score) - parseFloat(a.score))
    arr.forEach(e => {
        var div = document.createElement("div");
        div.classList = ['list-group-item']
        div.innerHTML = `${e.name} scored ${e.score}`;
        document.getElementById("finalRanking").appendChild(div);
    });
    document.getElementById("finalTogglebtn").click();
}

 function saveReport() {
    var arr = finalReport.sort((a, b) => parseFloat(b.score) - parseFloat(a.score))
    var finalreportObject = {
        pincode :currectQuizMetaData.pincode,
        title: currectQuizMetaData.title+" game",
        description: currectQuizMetaData.description+" desc",
        list: arr
    }
    console.log("<<<<<<<",finalreportObject);
    console.log(finalreportObject);
    socket.emit("publishreport",finalreportObject);
}
function fillProgressBar(id, duration, callback) {
    var progressBar = document.getElementById(id);
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
            if (typeof callback === 'function') {
                callback();
            }
        }
    }
    requestAnimationFrame(step);
}
function appendPlayer(name) {
    var div = document.getElementById("playersJoiningDetails");
    var listiteam = document.createElement("div");
    listiteam.classList = ["list-group-item"];
    listiteam.innerHTML = `${name} joined game!`;
    div.appendChild(listiteam);
}
loadSavedQuizes();

// socket events
socket.on('playerJoined', data => {
    appendPlayer(data.name);
    finalReport.push({
        name: data.name,
        score: 0
    });
});
socket.on('answers', (data) => {
    currentQuestionAnswers.push(data);
});

