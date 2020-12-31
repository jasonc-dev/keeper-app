//jshint esversion:6

require("dotenv").config();
const express  = require("express");
const mongoose = require("mongoose");
// const cors     = require("cors");
const path     = require("path");
const app      = express();
 
const PORT     = process.env.PORT || 4748;
const DB_URI   = "mongodb://localhost:27017/"
const DB       = "keeperDB";
 
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cors());
 
// Establish DB connection
mongoose.connect(DB_URI + DB, {
   useUnifiedTopology: true,
   useNewUrlParser: true,
   useCreateIndex: true,
   useFindAndModify: false,
   connectTimeoutMS: 10000
});
 
const db = mongoose.connection;
 
// Event listeners
db.once('open', () => console.log(`Connected to ${DB} database`));
 
// Create Schema
let NoteSchema = new mongoose.Schema(
   {
      title: String,
      content: String
   },
   { collection: "notes" }
);
 
// Create Model
let NoteModel = db.model("NoteModel", NoteSchema);
 
// Route to Get all Notes
app.get("/api/notes", (req, res) => {
   NoteModel.find({}, {__v: 0}, (err, docs) => {
      if (!err) {
         res.json(docs);
      } else {
         res.status(400).json({"error": err});
      }
   });
});
 
// Route to Add a Note
app.post("/api/notes/add", (req, res) => {
   let note = new NoteModel(req.body);
   
   note.save((err, result) => {
      if (!err) {
         delete result._doc.__v;
         res.json(result._doc);
      } else {
         res.status(400).json({"error": err});
      }
   });
});

//route to Delete a Note
app.delete("/api/notes/:id", (req, res) => {

   NoteModel.findByIdAndDelete(req.params.id)
      .then(() => res.json('Note deleted.'))
      .catch(err => res.status(400).json('Error: ' + err));
});
 
app.listen(PORT, () => {
   console.log(app.get("env").toUpperCase() + " Server started on port " + (PORT));
});