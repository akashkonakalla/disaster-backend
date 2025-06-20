require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const path = require('path');


app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());

// Socket setup

io.on('connection', socket => {
  console.log('User connected');

  // Test emit
  socket.emit('social_media_updated', {
    disasterId: "123",
    posts: [
      { post: "#Flood Help needed in Vizag", user: "userA" },
      { post: "Water levels rising in Hyderabad", user: "citizenB" }
    ]
  });
});

// Routes

app.use(express.static(path.join(__dirname, 'Front-end')));
app.use('/geocode', require('./routes/geocode'));
app.use('/disasters', require('./routes/disasters'));
app.use('/reports', require('./routes/reports'));
app.use('/resources', require('./routes/resources'));
app.use('/socialMedia', require('./routes/socialMedia'));


const geminiRoutes = require('./routes/gemini');
app.use('/gemini', geminiRoutes);
const mockSocialMediaRoutes = require('./routes/mockSocialMedia');
app.use('/mock-social-media', mockSocialMediaRoutes);
const officialUpdatesRoutes = require('./routes/officialUpdates');
app.use('/official-updates', officialUpdatesRoutes);
const verifyImageRoute = require('./routes/verifyImage');
app.use('/verify-image', verifyImageRoute);


// Mount image verification route under disasters
// Make sure routes/verifyImage.js exports router with path: `/:id/verify-image`



// Start
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
