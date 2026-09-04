const Marks = require("../models/marksModel");
const Student = require("../models/studentModel");
const PDFDocument = require("pdfkit");

const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");
const bwipjs = require("bwip-js");

/* ======================================================
   VIEW MARKS (UI PAGE)
====================================================== */
exports.viewMarks = async (req, res) => {
  try {
    const studentId = req.session.studentId;
    const examType = req.query.exam || "MST-1";

    const student = await Student.findById(studentId);
    const marks = await Marks.find({ student: studentId });

if (marks.length === 0) {
  return res.render("students/marksheet", {
    student: {
      fullname: student.fullname,  
      admissionNumber: student.admissionNumber,
      course: student.course,
      semester: student.semester,
      rollNumber: student.rollNumber
    },
    finalResult: "RESULT WAITING",
     results: [] 
  });
}

    let hasFail = false;
    let totalSubjects = 0;
    let putCount = 0;

    marks.forEach(m => {
      totalSubjects++;

      if (m.examType === "PUT") putCount++;

      if (
        (m.examType !== "PUT" && m.obtainedMarks < 13) ||
        (m.examType === "PUT" && m.obtainedMarks < 20)
      ) {
        hasFail = true;
      }
    });

    let finalResult = "PASS";

    if (putCount === 0 && examType === "PUT") {
      finalResult = "RESULT WAITING";
    } else if (hasFail) {
      finalResult = "FAIL";
    }

const groupedResults = {};

marks.forEach(m => {
  const exam = m.examType.trim().toUpperCase(); // ✅ normalize

  if (!groupedResults[exam]) {
    groupedResults[exam] = {
      examType: exam,
      session: "2023-24",
      finalResult: finalResult
    };
  }
});

const resultsArray = Object.values(groupedResults);

   res.render("students/marksheet", {
  student: {
    fullname: student.fullname,
    admissionNumber: student.admissionNumber,
    course: student.course,
    semester: student.semester,
    rollNumber: student.rollNumber
  },
  finalResult,
  results: resultsArray
});

  } catch (err) {
    console.error(err);
    res.send("Error loading marksheet");
  }
};



exports.downloadMarksheet = async (req, res) => {
  try {
    const studentId = req.session.studentId;
    const student = await Student.findById(studentId);
    const marks = await Marks.find({ student: studentId });

    /* ================= DATA LOGIC (6 SUBJECTS @ 40 MARKS EACH) ================= */
    const subjectMap = {};
    let grandTotal = 0;

    marks.forEach((m) => {
      if (!subjectMap[m.subject]) {
        subjectMap[m.subject] = { mst1: "-", mst2: "-", put: "-" };
      }
      if (m.examType === "MST-1") subjectMap[m.subject].mst1 = m.obtainedMarks;
      if (m.examType === "MST-2") subjectMap[m.subject].mst2 = m.obtainedMarks;
      if (m.examType === "PUT") subjectMap[m.subject].put = m.obtainedMarks;
    });

    const subjectCount = Object.keys(subjectMap).length;
    const maxMarksPerSubject = 40; 
    const totalMaxMarks = subjectCount * maxMarksPerSubject;

    Object.keys(subjectMap).forEach((sub) => {
      const s = subjectMap[sub];
      const total =
        (s.mst1 === "-" ? 0 : s.mst1) +
        (s.mst2 === "-" ? 0 : s.mst2) +
        (s.put === "-" ? 0 : s.put);

      subjectMap[sub].total = total;
      grandTotal += total;
    });

    const percentage = totalMaxMarks > 0 ? ((grandTotal / totalMaxMarks) * 100).toFixed(2) : "0.00";
  let hasFail = false;

marks.forEach(m => {
  if (
    (m.examType !== "PUT" && m.obtainedMarks < 13) ||
    (m.examType === "PUT" && m.obtainedMarks < 20)
  ) {
    hasFail = true;
  }
});

const result = hasFail ? "FAIL" : "PASS";

    /* ================= PDF GENERATION ================= */
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=Marksheet.pdf");

    const doc = new PDFDocument({ size: "A4", margin: 0, bufferPages: true });
    doc.pipe(res);

    // Page Borders
    doc.rect(20, 20, 555, 802).lineWidth(2).stroke("#000");
    doc.rect(25, 25, 545, 792).lineWidth(0.5).stroke("#000");


/* ================= HEADER ================= */

/* ===== COLLEGE LOGO (TOP LEFT) ===== */
const logoPath = path.join(process.cwd(), "uploads", "logo", "nagpur.png");
if (fs.existsSync(logoPath)) {
 doc.image(logoPath, 35, 35, {
  width: 90,
  height: 90
});

}

/* ===== HEADER TEXT (SHIFTED RIGHT & SMALLER) ===== */
doc.fillColor("#000");

// College Name
doc.font("Helvetica-Bold").fontSize(15)
  .text(
    "AVI INSTITUTE OF TECHNOLOGY, NAGPUR",
    115,   // ⬅️ left shift
    45,
    { width: 400, align: "center" }
  );

// Subtitle
doc.font("Helvetica").fontSize(8.5)
  .text(
    "(An Autonomous Institute Affiliated to RTMNU)",
    115,
    63,
    { width: 400, align: "center" }
  );

// Office line
doc.font("Helvetica-Bold").fontSize(10)
  .text(
    "OFFICE OF THE CONTROLLER OF EXAMINATIONS",
    115,
    78,
    { width: 400, align: "center" }
  );

// Statement title
doc.font("Helvetica-Bold").fontSize(13)
  .text(
    "STATEMENT OF MARKS",
    115,
    98,
    { width: 400, align: "center", underline: true }
  );

// Divider
doc.moveTo(40, 125).lineTo(555, 125).lineWidth(1).stroke();


    /* ================= STUDENT INFO ================= */
   /* ================= STUDENT INFO ================= */

// examType nikaalo (marks se)
const examType = marks.length > 0 ? marks[0].examType : "MST-1";

const infoTop = 125;
doc.fontSize(10).font("Helvetica-Bold");

// Outer box
doc.rect(40, infoTop, 515, 85).stroke();

const rowH = 16;

// Labels
const labels = [
  "Name of Student",
  "Admission No.",
  "Course / Branch",
  "Semester",
  "Roll Number"
];

// Values (Semester ke saath examType)
const vals = [
  student.fullname.toUpperCase(),
  student.admissionNumber,
  student.course,
  `${student.semester} (${examType})`,
  student.rollNumber
];

// Render rows
labels.forEach((label, i) => {
  doc.font("Helvetica-Bold")
     .text(label, 50, infoTop + 10 + (i * rowH));

  doc.font("Helvetica")
     .text(`:  ${vals[i]}`, 150, infoTop + 10 + (i * rowH));
});

    /* ===== STUDENT PHOTO (WORKING FIX) ===== */

// DB se aane wala path: "/uploads/students/xxx.jpg"
// Isliye direct project root se resolve karo
/* ===== STUDENT PHOTO (SAFE + ERROR-PROOF FIX) ===== */

// Safely handle empty OR folder OR missing file
let photoPath = "";

// Check if DB has a file path with extension
if (student.profileImage && student.profileImage.includes(".")) {
  photoPath = path.join(process.cwd(), student.profileImage);
}

// Default placeholder photo
const defaultPhoto = path.join(process.cwd(), "uploads", "logo", "default-photo.png");

// Line border always draw
doc.rect(465, infoTop + 5, 80, 75).stroke();

// Decide final image (student → default → none)
let finalPhoto = null;

if (photoPath && fs.existsSync(photoPath)) {
  finalPhoto = photoPath;
} else if (fs.existsSync(defaultPhoto)) {
  finalPhoto = defaultPhoto;
}

if (finalPhoto) {
  doc.image(finalPhoto, 470, infoTop + 10, {
    width: 70,
    height: 65
  });
} else {
  console.log("⚠ No photo found (student + default missing)");
}

    /* ================= MARKS TABLE ================= */
    const tableTop = 225;
    const colCode = 40, colSub = 90, colM1 = 350, colM2 = 400, colPut = 450, colTot = 500;
    
    // Header
    doc.rect(40, tableTop, 515, 25).fill("#f2f2f2");
    doc.fillColor("#000").font("Helvetica-Bold").fontSize(9);
    doc.text("CODE", colCode + 5, tableTop + 8);
    doc.text("SUBJECT NAME", colSub + 10, tableTop + 8);
    doc.text("MST-1", colM1, tableTop + 8, { width: 50, align: 'center' });
    doc.text("MST-2", colM2, tableTop + 8, { width: 50, align: 'center' });
    doc.text("PUT", colPut, tableTop + 8, { width: 50, align: 'center' });
    doc.text("TOTAL", colTot, tableTop + 8, { width: 55, align: 'center' });

    doc.moveTo(40, tableTop + 25).lineTo(555, tableTop + 25).stroke();

    // Data Rows with dynamic height
    let yPos = tableTop + 25;
    let idx = 1;
    doc.font("Helvetica").fontSize(9);

    for (const sub of Object.keys(subjectMap)) {
      const s = subjectMap[sub];
      const subName = sub.toUpperCase();
      const textHeight = doc.heightOfString(subName, { width: 240 });
      const rowHeight = Math.max(textHeight + 10, 25);

      doc.text(`SUB${idx}`, colCode + 5, yPos + 7);
      doc.text(subName, colSub + 10, yPos + 7, { width: 240 });
      doc.text(s.mst1, colM1, yPos + 7, { width: 50, align: 'center' });
      doc.text(s.mst2, colM2, yPos + 7, { width: 50, align: 'center' });
      doc.text(s.put, colPut, yPos + 7, { width: 50, align: 'center' });
      doc.font("Helvetica-Bold").text(s.total, colTot, yPos + 7, { width: 55, align: 'center' }).font("Helvetica");

      yPos += rowHeight;
      doc.moveTo(40, yPos).lineTo(555, yPos).lineWidth(0.2).stroke();
      idx++;
    }

    // Final Table Box and Vertical lines
    const tableBottom = Math.max(yPos, tableTop + 300);
    doc.rect(40, tableTop, 515, tableBottom - tableTop).stroke();
    [colSub, colM1, colM2, colPut, colTot].forEach(x => {
        doc.moveTo(x, tableTop).lineTo(x, tableBottom).stroke();
    });

 /* ================= SUMMARY ================= */
const summaryTop = tableBottom + 15;

// 🔹 Summary box height (reduced)
doc.rect(40, summaryTop, 515, 34).stroke();

doc.font("Helvetica-Bold").fontSize(11);

// 🔹 Text positions tightened
doc.text(`GRAND TOTAL: ${grandTotal} / ${totalMaxMarks}`, 55, summaryTop + 7);
doc.text(`PERCENTAGE: ${percentage}%`, 55, summaryTop + 20);

// 🔹 Result aligned center vertically
doc.fontSize(13).fillColor(result === "PASS" ? "#1b5e20" : "#b71c1c");
doc.text(`RESULT: ${result}`, 380, summaryTop + 12, {
  align: "right",
  width: 150
});


// ================= FOOTER =================

// 1. Setup Base Coordinates
/* ================= FOOTER ================= */

// Base positions
const footerBaseY = summaryTop + 95;
const principalX = 440;
const principalY = footerBaseY + 60;

// Asset sizes
const stampSize = 90;
const signWidth = 110;
const signHeight = 40;

// Alignment helpers
const principalCenterOffset = 25;
const anchorX = principalX + principalCenterOffset;
const centerX = doc.page.width / 2;

// Paths
const collegeStampPath = path.join(
  process.cwd(),
  "uploads",
  "logo",
  "college-stamp.png"
);

const principalSignPath = path.join(
  process.cwd(),
  "uploads",
  "signatures",
  "demo.png"
);

const controllerSignPath = path.join(
  process.cwd(),
  "uploads",
  "signatures",
  "dummy-sign.png" // dummy transparent sign
);

/* ===== COLLEGE STAMP (BOTTOM – ORIGINAL) ===== */
if (fs.existsSync(collegeStampPath)) {
  doc.image(
    collegeStampPath,
    anchorX - (stampSize / 2),
    principalY - 80,
    { width: stampSize, height: stampSize }
  );
}

/* ===== PRINCIPAL SIGNATURE (ON STAMP) ===== */
if (fs.existsSync(principalSignPath)) {
  doc.image(
    principalSignPath,
    anchorX - (signWidth / 2) - 8,
    principalY - 30,
    { width: signWidth, height: signHeight }
  );
}

/* ===== FOOTER TEXT POSITIONS ===== */
const controllerTextY = principalY + 10;

/* ===== STUDENT SIGNATURE (LEFT) ===== */
doc.font("Helvetica-Bold")
  .fontSize(10)
  .fillColor("#000")
  .text(
    "Student Signature",
    centerX - 300,           // thoda left
    controllerTextY,
    { width: 180, align: "center" }
  );

/* ===== CONTROLLER SIGN (ABOVE TEXT) ===== */
if (fs.existsSync(controllerSignPath)) {
  doc.image(
    controllerSignPath,
    (doc.page.width / 2) - 60, // center aligned
    controllerTextY - 45,      // 🔥 text ke upar
    { width: 120, height: 40 }
  );
}

/* ===== CONTROLLER TEXT (CENTER) ===== */
doc.font("Helvetica-Bold")
  .fontSize(10)
  .fillColor("#000")
  .text(
    "Controller of Examinations",
    0,
    controllerTextY,
    { align: "center", width: doc.page.width }
  );

/* ===== PRINCIPAL TEXT (RIGHT) ===== */
doc.text(
  "Principal",
  principalX + 5,
  controllerTextY + 2
);

/* ===== GENERATED TIMESTAMP ===== */
const dateString = new Date().toLocaleString("en-IN", {
  dateStyle: "medium",
  timeStyle: "short"
});

doc.fontSize(8)
  .font("Helvetica")
  .fillColor("#666")
  .text(
    `Generated On: ${dateString}`,
    0,
    controllerTextY + 25,
    { align: "center", width: doc.page.width }
  );


// 🔴 VERY IMPORTANT
doc.end();

} catch (err) {
  console.error("❌ PDF Generation Error:", err);
  if (!res.headersSent) {
    res.status(500).send("PDF Generation Error");
  }
}
};
