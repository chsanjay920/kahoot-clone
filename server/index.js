const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const cors = require('cors');
const fs = require('fs-extra');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const uuid = require('uuid');

// Create a storage engine using multer
const storage = multer.memoryStorage();
const upload = multer({ storage });


const io = require('socket.io')(8000, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});

let QuizeMasters = {};

io.on('connection', socket => {
    socket.on('sendQuestion', questiondata => {
        console.log("question", questiondata);
        io.in(`${questiondata.passcode}`).emit("getQuestion", questiondata.data);
    });
    socket.on('connection', (pincode) => {
        QuizeMasters = {
            "pincode": pincode,
            SocketID: socket.id,
            Socket: socket
        };
        console.log("Admin Connected!");
    });
    socket.on('playerconnected', (playerdata) => {
        var master = QuizeMasters;
        console.log("player connected!", playerdata);
        socket.join(`${playerdata.gamecode}`);
        io.to(master.Socket.id).emit("playerJoined", playerdata);
    });
    socket.on('answerSelected', (details) => {
        var master = QuizeMasters;
        io.to(master.Socket.id).emit("answers", details);
    });
});
app.use(cors());
app.use(bodyParser.json());
// Handle file upload and conversion
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


// Define a route for handling POST requests
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

app.get('/allQuestions', (req, res) => {
    fs.readJson("data.json", (err, existingData) => {
        if (err && err.code !== 'ENOENT') {
            console.error(err);
            return res.status(500).json({ error: 'Failed to read JSON data' });
        }
        res.send(existingData);
    });
});

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
app.post('/SaveReport', (req, res) => {
    console.log(req.body);
    if (!req.body) {
        return res.status(400).json({ error: 'No JSON data provided' });
    }
    const jsonData = req.body;
    const filePath = 'report.json';
    fs.readJson(filePath, (err, existingData) => {
        if (err && err.code !== 'ENOENT') {
            console.error(err);
            return res.status(500).json({ error: 'Failed to read JSON data' });
        }
        const responseData = {
            timestamp: new Date().toISOString(),
            ReportID: uuid.v4(),
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

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
