import express from "express";
import mongoose from "mongoose";
import Messages from "./dbmessages.js";
import Pusher from "pusher";
import cors from "cors";
const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
  appId: "1119894",
  key: "5d98afad589775a5c218",
  secret: "dac106f444f01b64288c",
  cluster: "eu",
  useTLS: true,
});

pusher.trigger("my-channel", "my-event", {
  message: "hello world",
});
const connection_url =
  "mongodb+srv://admin:ngUw8cYcsKk0oCR1@cluster0.oq4ug.mongodb.net/whatssapdb?retryWrites=true&w=majority";

mongoose.connect(connection_url, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.once("open", () => {
  console.log("db is connected");
  const msgCollection = db.collection("messagecontents");
  const changeStream = msgCollection.watch();
  changeStream.on("change", (change) => {
    if (change.operationType === "insert") {
      const messageDetails = change.fullDocument;
      pusher.trigger("messages", "inserted", {
        name: messageDetails.name,
        message: messageDetails.message,
        timestamp: messageDetails.timestamp,
        received: messageDetails.received,
      });
    } else {
      console.log("error triggering pusher");
    }
  });
});

app.use(express.json()); //SUPER IMPORTANT

// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Headers", "*");
//   next();
// });
app.use(cors());

app.get("/", (req, res) => {
  res.status(200).send("hello world");
});

app.get("/messages/sync", (req, res) => {
  Messages.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});
app.post("/messages/new", (req, res) => {
  const dbMessage = req.body;

  Messages.create(dbMessage, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});

app.listen(port, () => console.log(`Listening on localhost:${port}`));
