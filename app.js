const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const expressLayouts = require('express-ejs-layouts');

const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");
require("dotenv").config();
console.log("Cashfree App ID:", process.env.CASHFREE_APP_ID);

const app = express();

const server = http.createServer(app);
const io = new Server(server);
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log("Joined room:", roomId);
  });

  socket.on("sendMessage", (data) => {
    io.to(data.room).emit("receiveMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

const helmet = require("helmet"); // 👈 top pe require
const cors = require("cors");

// ✅ YAHAN LAGANA HAI (routes se pehle)
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'"],

        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://sdk.cashfree.com",
          "https://meet.jit.si",
          "https://unpkg.com",
          "https://cdn.tailwindcss.com",
          "https://code.iconify.design"
        ],

        scriptSrcAttr: ["'unsafe-inline'"],

        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
          "https://cdnjs.cloudflare.com"
        ],

        imgSrc: [
          "'self'",
          "data:",
          "https://api.cashfree.com",
          "https://meet.jit.si",
          "https://images.unsplash.com",
          "https://cdn-icons-png.flaticon.com"
        ],

        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com"
        ],

        frameSrc: [
          "'self'",
          "https://sdk.cashfree.com",
           "https://api.cashfree.com",
          "https://meet.jit.si"
        ],

        connectSrc: [
          "'self'",
          "https://sdk.cashfree.com",
          "https://api.cashfree.com",
          "https://meet.jit.si",
          "wss://meet.jit.si"
        ],

        formAction: [
          "'self'",
          "https://api.cashfree.com"
        ]
      }
    }
  })
);
//

app.use(cors());


// -------------------- MIDDLEWARE --------------------
app.use("/uploads", express.static("uploads"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));



app.use((req, res, next) => {
    res.locals.hasNewNotice = true; // ya false
    next();
});

app.use((req, res, next) => {
    res.locals.showHeader = false;
    next();
});

app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});


app.use((req, res, next) => {
  if (process.env.MAINTENANCE_MODE === "true") {
    res.locals.layout = false; // 🔥 layout disable
    return res.status(503).render("maintenance");
  }
  next();
});



app.use(expressLayouts);





app.use(
  session({
  secret: process.env.SESSION_SECRET || "fallback_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 10 * 60 * 1000   // EXACT 10 MINUTES
    }
  })
);


console.log("MONGO_URL = ", process.env.MONGO_URL);


// -------------------- DATABASE CONNECT --------------------
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
  console.error("❌ DB Error:", err);
  process.exit(1); // force stop
});
  require("./cron/autoAbsentCron");


// -------------------- VIEW ENGINE --------------------
app.set("view engine", "ejs");
// -------------------- ROUTES --------------------

app.use("/admin", require("./routes/adminRoutes"));
app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/authRoutes"));
app.use("/student", require("./routes/studentRoutes"));
app.use("/exam", require("./routes/examRoutes"));
app.use("/attendance", require("./routes/attendanceRoutes"));
app.use("/marks", require("./routes/studentMarksRoutes"));
app.use("/admin", require("./routes/adminMarksRoutes"));
app.use("/admin", require("./routes/adminNoticeRoutes"));
app.use("/admin", require("./routes/adminChatRoutes"));
app.use("/student", require("./routes/studentChatRoutes"));
app.use("/student", require("./routes/noticeRoutes"));
app.use("/meeting", require("./routes/mettingRoutes"));
app.use("/admin", require("./routes/adminMettingRoute"));


app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.stack);
  res.status(500).send("Server Error");
});




// -------------------- HOME ROUTE --------------------





const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Server Running with Socket.IO on Port ${PORT}`);
});


