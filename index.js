const express = require('express');
const app = express();
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

app.use(express.static(path.join(__dirname, 'public')));

let users = [];

io.on('connection', (socket) => {
  let addedUser = false;

  socket.on('add user', (username) => {
    if (addedUser) return;

    socket.username = username;
    addedUser = true;
    let user = {
      username: socket.username,
      id: socket.id
    }
    users.push(user);

    io.emit('add user', users);
  });

  socket.on('start game', () => {
    let user = shuffle(users)[0];

    io.emit('return random user', user);
  });

  socket.on('disconnect', () => {
    if (addedUser) {
      const index = users.indexOf(socket.username);
      users.splice(index, 1);

      io.emit('update users', users);
    }
  });
});

// Helper functions
const shuffle = (array) => {
	let currentIndex = array.length;
	let temporaryValue, randomIndex;

	while (0 !== currentIndex) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array.slice();
};
