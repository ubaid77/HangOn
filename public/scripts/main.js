const sendButton = document.getElementById('send');
const MsgBox = document.getElementById('middle');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users')

const {
    username,
    room
} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})
const socket = io();

socket.emit('joinRoom', {
    username,
    room
});


//Get online users
socket.on('roomUsers', ({
    room,
    users
}) => {
    outputRoomName(room);
    outputUsers(users);
})

socket.on('message', message => {

    outputMsg(message);

    //scroll event
    MsgBox.scrollTop = MsgBox.scrollHeight;
})

//Message send
sendButton.addEventListener('click', () => {
    const msg = document.getElementById('msg-text')
    //Emit msg to server
    socket.emit('chatMsg', msg.value)

    msg.value = '';
    msg.focus();
})


//Output message
function outputMsg(message) {
    const div = document.createElement('div');
    div.classList.add('msg');
    div.classList.add('container');
    div.innerHTML = `<p>
    <h6 style="color: #CB3B3B;">${message.username} <span class="text-muted" style="font-size: .75em;">${message.time}
        </span></h6>
</p>
<p>${message.text}</p>`;
    document.getElementById('chat-box').appendChild(div);
}

// Show room name

function outputRoomName(room) {
    roomName.innerText = room;
}

//Show users
function outputUsers(users) {
    userList.innerHTML = `
        ${users.map(user => `<li><i class="fas fa-dot-circle fa-xs px-1" style="color: green;"></i>${user.username}</li>`).join('')}
    `
}