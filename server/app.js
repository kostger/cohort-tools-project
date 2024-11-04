const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const Cohort = require("./models/Cohort");
const Student = require("./models/Student");
const { isAuthenticated } = require("./middleware/jwt.middleware");
// const {
//   errorHandler,
//   notFoundHandler,
// } = require("./middleware/error-handling");

const PORT = 5005;

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://example.com"],
  })
);

mongoose
  .connect("mongodb://localhost:27017/cohort-tools-api")
  .then((x) => console.log(`Connected to Database: "${x.connection.name}"`))
  .catch((err) => console.error("Error connecting to MongoDB", err));

app.use(express.json());
app.use(morgan("dev"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Routes
app.get("/docs", (req, res) => {
  res.sendFile(__dirname + "/views/docs.html");
});

app.post("/api/students", async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    linkedinUrl,
    languages,
    program,
    background,
    image,
    cohort,
    projects,
  } = req.body;
  try {
    const student = await Student.create({
      firstName,
      lastName,
      email,
      phone,
      linkedinUrl,
      languages,
      program,
      background,
      image,
      cohort,
      projects,
    });
    res.json(student);
  } catch (err) {
    next(err); // Passes the error to the error handler
  }
});

app.get("/api/students", async (req, res, next) => {
  try {
    const students = await Student.find().populate("cohort");
    res.json(students);
  } catch (err) {
    next(err);
  }
});

app.get("/api/students/cohort/:cohortId", async (req, res, next) => {
  const { cohortId } = req.params;
  try {
    const students = await Student.find({ cohort: cohortId }).populate(
      "cohort"
    );
    res.json(students);
  } catch (err) {
    next(err);
  }
});

app.get("/api/students/:studentId", async (req, res, next) => {
  const { studentId } = req.params;
  try {
    const student = await Student.findById(studentId).populate("cohort");
    res.json(student);
  } catch (err) {
    next(err);
  }
});

app.put("/api/students/:studentId", async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.studentId,
      req.body,
      { new: true }
    );
    res.json(student);
  } catch (err) {
    next(err);
  }
});

app.delete("/api/students/:studentId", async (req, res, next) => {
  const { studentId } = req.params;
  try {
    const student = await Student.findByIdAndDelete(studentId);
    res.json(student);
  } catch (err) {
    next(err);
  }
});

app.post("/api/cohorts", async (req, res, next) => {
  const {
    cohortSlug,
    cohortName,
    program,
    format,
    campus,
    startDate,
    endDate,
    inProgress,
    programManager,
    leadTeacher,
    totalHours,
  } = req.body;
  try {
    const cohort = await Cohort.create({
      cohortSlug,
      cohortName,
      program,
      format,
      campus,
      startDate,
      endDate,
      inProgress,
      programManager,
      leadTeacher,
      totalHours,
    });
    res.json(cohort);
  } catch (err) {
    next(err);
  }
});

app.get("/api/cohorts", async (req, res, next) => {
  try {
    const cohorts = await Cohort.find();
    res.json(cohorts);
  } catch (err) {
    next(err);
  }
});

app.get("/api/cohorts/:cohortId", async (req, res, next) => {
  const { cohortId } = req.params;
  try {
    const cohort = await Cohort.findById(cohortId);
    res.json(cohort);
  } catch (err) {
    next(err);
  }
});

app.put("/api/cohorts/:cohortId", async (req, res, next) => {
  try {
    const cohort = await Cohort.findByIdAndUpdate(
      req.params.cohortId,
      req.body,
      { new: true }
    );
    res.json(cohort);
  } catch (err) {
    next(err);
  }
});

app.delete("/api/cohorts/:cohortId", async (req, res, next) => {
  const { cohortId } = req.params;
  try {
    const cohort = await Cohort.findByIdAndDelete(cohortId);
    res.json(cohort);
  } catch (err) {
    next(err);
  }
});

app.get("/api/users/:id", isAuthenticated, (req, res) => {
  res.json(req.user);
});

const authRouter = require("./routes/auth.routes");
app.use("/auth", authRouter);
// ERROR HANDLING
require("./error-handling/index")(app);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
