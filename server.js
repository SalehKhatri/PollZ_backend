const express = require("express");
const socketIo = require("socket.io");
const http = require("http");
const cors = require("cors");
const ConnectTODb = require("./Connections/ConnectToDb");

const app = express();
const server = http.createServer(app);

require("dotenv").config();
app.use(cors());
app.options('*', cors()); // Enable preflight across all routes
app.use(express.json());


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

ConnectTODb()
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  }); // connect to MongoDB

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
}); //Socket configuration

const Poll = require('./Models/Poll');

app.post('/create-poll', async (req, res) => {
  const { question, options } = req.body;
  try {
    const poll = new Poll({ question, options: options.map(option => ({ option, votes: 0 })) });
    await poll.save();
    res.status(201).json({ message: 'Poll created', poll });
  } catch (error) {
    res.status(500).json({ message: 'Error creating poll', error });
  }
});

app.get('/poll/:pollId', async (req, res) => {
  const { pollId } = req.params;
  try {
    const poll = await Poll.findById(pollId);
    if (poll) {
      res.status(200).json(poll);
    } else {
      res.status(404).json({ message: 'Poll not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching poll', error });
  }
});

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('vote', async ({ pollId, option }) => {
    try {
      const poll = await Poll.findById(pollId);
      if (poll) {
        const pollOption = poll.options.find((opt) => opt.option === option);
        if (pollOption) {
          pollOption.votes += 1;
          await poll.save();
          io.emit('poll-updated', { pollId, poll }); // Broadcast updated poll data to all clients
        }
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});