var express = require('express');
var path = require('path');
var app = express();
var natural = require('natural');
var classifier = new natural.BayesClassifier();

classifier.addDocument('I do not want it, it is not good and scary', '0');
classifier.addDocument('As low as possible', '0');
classifier.addDocument('It is very low', '0');
classifier.addDocument('I would say i would try and keep risk as low as possible', '1');
classifier.addDocument('I am somewhere in the middle, in betwwen high and low risk tolerance.', '1');
classifier.addDocument('I have a pretty high tolerance, but within reason', '1');
classifier.addDocument('I would rather take in more risk, to potential get higher returns', '2');
classifier.addDocument('You only live once', '2');
classifier.addDocument('It is very high', '2');

classifier.train();

var port = process.env.PORT || 8080;

app.use(express.static(__dirname))
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/email', function (req, res) {
    res.sendFile(path.join(__dirname + '/email.html'));
});

app.get('/a-2-r', function (req, res) {
    res.sendFile(path.join(__dirname + '/a-2-r.html'));
});

app.get('/profile-done', function (req, res) {
    res.sendFile(path.join(__dirname + '/profile-done.html'));
});

app.get('/edit-profile', function (req, res) {
    res.sendFile(path.join(__dirname + '/edit-profile.html'));
});

const server = app.listen(port);

let profile = {
    name: '',
    email: '',
    a2rScore: null
}

const io = require('socket.io')(server);
io.on('connection', function (socket) {
    console.log('a user connected');
});

io.on('connection', function (socket) {
    socket.on('a2r-score', (text) => {
        console.log('Message: ' + text);

        const a2rScore = classifier.classify(text)
        console.log('message classified as: ', a2rScore);

        profile.a2rScore = a2rScore

        socket.emit('profile', profile)
    });

    socket.on('profileName', (text) => {
        console.log('profile name: ', text);
        profile.name = text
    });

    socket.on('profileEmail', (text) => {
        console.log('profile email: ', text);
        profile.email = text
    });
});

console.log('Server listening on port: ' + port);

module.exports = app;