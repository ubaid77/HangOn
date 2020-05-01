var express = require('express'),
    http    = require('http'),
    socketio = require('socket.io'),
    formatMsg = require('./utils/messages'), 
    {
        userJoin,
        getCurrentUser,
        userLeave,
        getRoomUsers
    }        = require('./utils/user');


var app = express(),
    server = http.createServer(app),
    io = socketio(server);


var PORT = 3000 || process.env.PORT;


app.set("view engine", "ejs");
app.use(express.static("public"));

//When a client connects
io.on('connection', (socket) => {
    socket.on('joinRoom', ({
        username,
        room
    }) => {
        const user = userJoin(socket.id, username, room)
        socket.join(user.room);
        //Welcome msg to all
        socket.emit('message', formatMsg('HangOn', 'Welcome to HangOn!'));

        //When a user connects(to everybody except user that is connecting)
        socket.broadcast.to(user.room).emit('message', formatMsg('HangOn', `${user.username} has joined the chat`));

        //online users
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })

    })

    //Listen for chatMsg
    socket.on('chatMsg', (msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMsg(user.username, msg))
    })

    //When a user disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.room).emit('message', formatMsg('HangOn', `${user.username} has left the chat`));

            //online users
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }
    })


})

app.get("/", (req, res) => {
    res.render("home")
})

app.get("/chat", (req, res) => {
    res.render("chat")
})



server.listen(PORT, () => {
    console.log('Server started at ' + PORT)
})