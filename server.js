const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");

const app = express();
app.use(cors());
app.use(express.json());

// 📂 File upload setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage: storage });

// 🔗 MongoDB connection (PUT YOUR URL)
mongoose.connect("YOUR_MONGODB_URL")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// 📦 Schema
const Complaint = mongoose.model("Complaint", {
  name: String,
  phone: String,
  language: String,
  category: String,
  description: String,
  file: String,
  status: { type: String, default: "Pending" }
});

// 🚀 Submit complaint
app.post("/complaint", upload.single("file"), async (req, res) => {
  const newComplaint = new Complaint({
    name: req.body.name,
    phone: req.body.phone,
    language: req.body.language,
    category: req.body.category,
    description: req.body.description,
    file: req.file ? req.file.filename : null
  });

  await newComplaint.save();
  res.send({ message: "Complaint Submitted Successfully" });
});

// 📊 Get complaints
app.get("/complaints", async (req, res) => {
  const data = await Complaint.find();
  res.send(data);
});

// ✅ Update status
app.put("/update/:id", async (req, res) => {
  await Complaint.findByIdAndUpdate(req.params.id, { status: "Resolved" });
  res.send({ message: "Updated" });
});

// ▶ Start server
app.listen(5000, () => console.log("Server running on port 5000"));