const WebSocket = require('ws')
// const express = require('express')
const moment = require('moment')
const fs = require('fs');
// const file = require("./public/connections.json")
// const app = express()
const port = process.env.PORT || 7878; //port for https

// app.get('/', (req, res) => {
//     res.send("Hello World");
// });


// app.get('/contacts', (req, res) => {
//     res.send(readFile())
// });

function readFile(){
    let fileData = [];
    let filePath = "./public/connecntion.json"
    const jsonString = fs.readFileSync(filePath);
    fileData = JSON.parse(jsonString);
    return fileData
}

let fileData = [];

function addConnection(socketId) {
    let filePath = "./public/connecntion.json"
    const jsonString = fs.readFileSync(filePath);
    fileData = JSON.parse(jsonString);
    if (!fileData.includes(socketId)) fileData.push(socketId)
    fs.writeFile(filePath, JSON.stringify(fileData), err=>{
        if(err) console.log(err)
        else console.log("User added into the list")
    })
    // return fileData
}


var webSockets = {}

// const wss = new WebSocket.Server({ port: 6060 }) //run websocket server with port 6060
const wss = new WebSocket.Server({ port: port })
wss.on('connection', function (ws, req) {
    var userID = req.url.substring(1) //get userid from URL ip:6060/userid 
    webSockets[userID] = ws //add new user to the connection list

    addConnection(userID)
    console.log('User ' + userID + ' Connected ')

    ws.on('message', message => { //if there is any message
        console.log(message);
        var datastring = message.toString();
        if (datastring.charAt(0) == "{") {
            datastring = datastring.replace(/\'/g, '"');
            var data = JSON.parse(datastring)
            if (data.auth == "chatapphdfgjd34534hjdfk") {
                if (data.cmd == 'send') {
                    var boardws = webSockets[data.userid] //check if there is reciever connection
                    if (boardws) {
                        var cdata = "{'cmd':'" + data.cmd + "','userid':'" + data.userid + "','date':'" + data.date + "', 'msgtext':'" + data.msgtext + "'}";
                        boardws.send(cdata); //send message to reciever
                        ws.send(data.cmd + ":success");
                    } else {
                        console.log("No reciever user found.");
                        ws.send(data.cmd + ":error");
                    }
                } else {
                    console.log("No send command");
                    ws.send(data.cmd + ":error");
                }
            } else {
                console.log("App Authincation error");
                ws.send(data.cmd + ":error");
            }
        } else {
            console.log("Non JSON type data");
            ws.send(data.cmd + ":error");
        }
    })

    ws.on('close', function () {
        var userID = req.url.substring(1)
        // delete webSockets[userID] //on connection close, remove reciver from connection list
        console.log('User Disconnected: ' + userID)
    })

    ws.send('connected'); //innitial connection return message
    // debugger;
})

// app.listen(port, () => {
//     console.log(`Example app listening at ${port}`)
// });