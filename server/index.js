const express = require('express');
const app = express();
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs-extra');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const server = http.createServer(app);
const PORT = process.env.PORT || 8000;
const storage = multer.memoryStorage();
const upload = multer({ storage });

let QuizeMasters = {};
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});
app.use(cors());
app.use(bodyParser.json());

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// web socket events
io.on('connection', socket => {
    socket.on('sendQuestion', questiondata => {
        // console.log("question", questiondata);
        io.in(`${questiondata.passcode}`).emit("getQuestion", questiondata.data);
    });
    socket.on('connection', (pincode) => {
        QuizeMasters = {
            "pincode": pincode,
            SocketID: socket.id,
            Socket: socket
        };
        // console.log("Admin Connected!");
    });
    socket.on('playerconnected', (playerdata) => {
        var master = QuizeMasters;
        // console.log("player connected!", playerdata);
        socket.join(`${playerdata.gamecode}`);
        io.to(master.Socket.id).emit("playerJoined", playerdata);
    });
    socket.on('answerSelected', (details) => {
        var master = QuizeMasters;
        io.to(master.Socket.id).emit("answers", details);
    });
    socket.on('publishreport',(report)=>{
        // console.log(">>>>>>report");
        // console.log(report);
        io.to(`${report.pincode}`).emit("overAllResult",report);
        // saveReport(report);
    });
});
// file upload api
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    try {
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(worksheet);

        res.json(jsonData);
    } catch (error) {
        res.status(500).send('Error converting Excel to JSON.');
    }
});
// user register api 
app.post('/register',(req, res) => {
    if (!req.body) {
        return res.status(400).json({ error: 'No JSON data provided' });
    }
    const jsonData = req.body;
    const filePath = 'userdata.json';
    fs.readJson(filePath, (err, existingData) => {
        if (err && err.code !== 'ENOENT') {
            console.error(err);
            return res.status(500).json({ error: 'Failed to read JSON data' });
        }
        const responseData = jsonData;
        const updatedData = existingData ? [...existingData, responseData] : [responseData];
        console.log(jsonData);
        fs.writeJson(filePath, updatedData, (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to save JSON data' });
            }
            res.status(200).json({ message: 'JSON data saved successfully' });
        });
    });
});
// quiz questions api
app.post('/addQuestion', (req, res) => {
    console.log(req.body);
    if (!req.body) {
        return res.status(400).json({ error: 'No JSON data provided' });
    }
    const jsonData = req.body;
    const filePath = 'data.json';
    fs.readJson(filePath, (err, existingData) => {
        if (err && err.code !== 'ENOENT') {
            console.error(err);
            return res.status(500).json({ error: 'Failed to read JSON data' });
        }
        const responseData = {
            timestamp: new Date().toISOString(),
            QuizzId: uuid.v4(),
            data: jsonData,
        };
        const updatedData = existingData ? [...existingData, responseData] : [responseData];

        fs.writeJson(filePath, updatedData, (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to save JSON data' });
            }
            res.status(200).json({ message: 'JSON data saved successfully' });
        });
    });
});
// get all Questions
app.get('/allQuestions', (req, res) => {
    fs.readJson("data.json", (err, existingData) => {
        if (err && err.code !== 'ENOENT') {
            console.error(err);
            return res.status(500).json({ error: 'Failed to read JSON data' });
        }
        res.send(existingData);
    });
});
// getting questions by id api
app.get('/getQuestionsByID/:id', (req, res) => {
    fs.readJson("data.json", (err, existingData) => {
        if (err && err.code !== 'ENOENT') {
            console.error(err);
            return res.status(500).json({ error: 'Failed to read JSON data' });
        }
        existingData.forEach(element => {
            if (element.QuizzId == req.params.id)
                res.send(element);
        });
    });
});
// user login api
app.get('/login/:user', (req, res) => {
    var user = req.params.user.split("_");
    var validuser = false;
    var role = "";
    fs.readJson("userdata.json", (err, existingData) => {
        if (err && err.code !== 'ENOENT') {
            console.error(err);
            return res.status(500).json({ error: 'Failed to read JSON data' });
        }
        existingData.forEach(element => {
            if (element.username == user[0] && element.password == user[1])
            {
                validuser = true;   
                role = element.role;
            }
        });
        if(validuser)
        {
            if(role == "admin")
                res.send({
                    role:"admin"
                });
            else   
                res.send({
                    role:"player"
                })
        }
        else
            res.send({
                role:"invalid_user"
            });
    });
});

app.get('/getreports',(req,res)=>{
    fs.readJson("reports.json", (err, existingData) => {
        if (err && err.code !== 'ENOENT') {
            console.error(err);
            return res.status(500).json({ error: 'Failed to read JSON data' });
        }
        res.send(existingData);
    });
});

// saving reports function
function saveReport(report)
{
    try {
        fs.readJson('reports.json', (err, existingData) => {
            if (err && err.code !== 'ENOENT') {
                console.error(err);
            }
            const responseData = {
                timestamp: new Date().toISOString(),
                ReportID: uuid.v4(),
                data: report
            };
            const updatedData = existingData ? [...existingData, responseData] : [responseData];
            fs.writeJson('reports.json', updatedData, (err) => {
                if (err) {
                    console.error(err);
                }
                console.log('JSON data saved successfully');
            });
        });
    } catch (error) {
        console.log(error);
    }
}

