const Admin = require("../models/adminModel");
const Student = require("../models/studentModel");
const bcrypt = require("bcrypt");
const HallTicket = require("../models/HallTicket");
const ExamSettings = require("../models/ExamSettings");

// ADMIN LOGIN
exports.adminLogin = async (req, res) => {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.send("Invalid admin credentials");

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.send("Invalid admin credentials");

    // ✅ ADMIN SESSION
    req.session.adminId = admin._id;
      req.session.adminName = admin.username; 
    req.session.role = "admin";

   return res.redirect("/admin/dashboard");
};

exports.getStudentDetails = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).send("Student Not Found");
    }

    res.render("admins/studentDetails", {
      layout:false,
       student });

  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

exports.sendWarning = async (req, res) => {
  try {
    const studentId = req.params.id;
    const message = req.body.message;

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).send("Student not found");
    }

    // ⚠ Save warning
    student.warningMessage = message;
    student.showWarning = true;

    await student.save();

    res.redirect("/admin/students?success=1");

  } catch (err) {
    console.log(err);
    res.status(500).send("Warning error");
  }
};


/* =========================================
   ADMIN HALL TICKET MANAGEMENT PAGE
========================================= */

exports.hallTicketPage = async (req, res) => {
    try {

        // Approved students
        const students = await Student.find({
            approvalStatus: "approved"
        })
        .sort({ createdAt: -1 })
        .lean();

        // Existing hall tickets
        const hallTickets = await HallTicket.find()
            .lean();

        // Student ID -> Hall Ticket
        const hallTicketMap = {};

        hallTickets.forEach((ticket) => {
            hallTicketMap[ticket.student.toString()] = ticket;
        });

        res.render("admins/halltickets/index", {
            layout: "admins/layout/admin",
            students,
            hallTicketMap
        });

    } catch (err) {

        console.error("Hall Ticket Page Error:", err);

        res.status(500).send(
            "Unable to load Hall Ticket Management page"
        );
    }
};


/* =========================================
   GENERATE HALL TICKET PAGE
========================================= */

exports.generateHallTicketPage = async (req, res) => {
    try {

        const { studentId } = req.params;

        // Find student
        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).send("Student not found");
        }

        // Check existing Hall Ticket
        const existingHallTicket = await HallTicket.findOne({
            student: student._id
        });

        // Already generated
        if (existingHallTicket) {

            return res.redirect(
                `/admin/halltickets/edit/${existingHallTicket._id}`
            );
        }

        res.render("admins/halltickets/generate", {
            layout: "admins/layout/admin",
            student
        });

    } catch (err) {

        console.error(
            "Generate Hall Ticket Page Error:",
            err
        );

        res.status(500).send(
            "Unable to load Generate Hall Ticket page"
        );
    }
};


/* =========================================
   SAVE / GENERATE HALL TICKET
========================================= */

exports.saveHallTicket = async (req, res) => {
    try {

        const { studentId } = req.params;

        const {
            hallTicketNumber,
            seatNumber,
            examType,
            examCenter,
            examCenterAddress,
            reportingTime,
              academicYear
        } = req.body;


        // Find Student
        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).send("Student not found");
        }


        // Check existing Hall Ticket
        const existingHallTicket = await HallTicket.findOne({
            student: studentId
        });

        if (existingHallTicket) {

            return res.redirect(
                `/admin/halltickets/edit/${existingHallTicket._id}`
            );
        }


        // Check duplicate Hall Ticket Number
        const duplicateHallTicket = await HallTicket.findOne({
            hallTicketNumber: hallTicketNumber.trim()
        });

        if (duplicateHallTicket) {

            return res.status(400).send(
                "Hall Ticket Number already exists"
            );
        }


        // Create Hall Ticket
        const hallTicket = new HallTicket({

            student: studentId,

            hallTicketNumber: hallTicketNumber.trim(),

            seatNumber: seatNumber.trim(),

            examType: examType.trim(),

            semester: student.semester,

             academicYear: academicYear.trim(),

            academicYear: student.academicYear || "2025-26",

            examCenter: examCenter.trim(),

            examCenterAddress:
                examCenterAddress?.trim() || "",

            reportingTime,

            allowDownload:
                req.body.allowDownload === "on",

            allowPrint:
                req.body.allowPrint === "on",

            published:
                req.body.published === "on",

            status: "Generated"
        });


        // Save MongoDB
        await hallTicket.save();


        console.log(
            "Hall Ticket Generated:",
            hallTicket.hallTicketNumber
        );


        // Redirect Management Page
        res.redirect("/admin/halltickets");


    } catch (err) {

        console.error(
            "Save Hall Ticket Error:",
            err
        );


        // Duplicate MongoDB Unique Error
        if (err.code === 11000) {

            return res.status(400).send(
                "Hall Ticket Number already exists"
            );
        }


        res.status(500).send(
            "Unable to generate Hall Ticket"
        );
    }
};

/* =========================================
   EDIT HALL TICKET PAGE
========================================= */

exports.editHallTicketPage = async (req, res) => {

    try {

        const { id } = req.params;


        const hallTicket = await HallTicket
            .findById(id)
            .populate("student");


        if (!hallTicket) {

            return res
                .status(404)
                .send("Hall Ticket not found");

        }


        res.render("admins/halltickets/edit", {

            layout: "admins/layout/admin",

            hallTicket,

            student: hallTicket.student

        });


    } catch (err) {

        console.error(
            "Edit Hall Ticket Page Error:",
            err
        );


        res
            .status(500)
            .send("Unable to load Edit Hall Ticket page");

    }

};


/* =========================================
   UPDATE HALL TICKET
========================================= */

exports.updateHallTicket = async (req, res) => {

    try {

        const { id } = req.params;


        const {
            hallTicketNumber,
            seatNumber,
            examType,
            examCenter,
             academicYear,
            examCenterAddress,
            reportingTime
        } = req.body;


        const hallTicket = await HallTicket.findById(id);


        if (!hallTicket) {

            return res
                .status(404)
                .send("Hall Ticket not found");

        }


        // Check duplicate Hall Ticket Number
        const duplicateHallTicket = await HallTicket.findOne({

            hallTicketNumber: hallTicketNumber.trim(),

            _id: {
                $ne: id
            }

        });


        if (duplicateHallTicket) {

            return res
                .status(400)
                .send("Hall Ticket Number already exists");

        }


        hallTicket.hallTicketNumber =
            hallTicketNumber.trim();


        hallTicket.seatNumber =
            seatNumber.trim();


        hallTicket.examType =
            examType.trim();

            hallTicket.academicYear =
             academicYear.trim();

        hallTicket.examCenter =
            examCenter.trim();


        hallTicket.examCenterAddress =
            examCenterAddress?.trim() || "";


        hallTicket.reportingTime =
            reportingTime;


        hallTicket.allowDownload =
            req.body.allowDownload === "on";


        hallTicket.allowPrint =
            req.body.allowPrint === "on";


        hallTicket.published =
            req.body.published === "on";


        await hallTicket.save();


        console.log(
            "Hall Ticket Updated:",
            hallTicket.hallTicketNumber
        );


        res.redirect("/admin/halltickets");


    } catch (err) {

        console.error(
            "Update Hall Ticket Error:",
            err
        );


        if (err.code === 11000) {

            return res
                .status(400)
                .send("Hall Ticket Number already exists");

        }


        res
            .status(500)
            .send("Unable to update Hall Ticket");

    }

};

/* =========================================
   PUBLISH / UNPUBLISH HALL TICKET
========================================= */

exports.toggleHallTicketPublish = async (req, res) => {
    try {

        const { id } = req.params;

        const hallTicket = await HallTicket.findById(id);

        if (!hallTicket) {
            return res
                .status(404)
                .send("Hall Ticket not found");
        }

        hallTicket.published = !hallTicket.published;

        await hallTicket.save();

        console.log(
            `Hall Ticket ${hallTicket.hallTicketNumber} ${
                hallTicket.published
                    ? "Published"
                    : "Unpublished"
            }`
        );

        return res.redirect("/admin/halltickets");

    } catch (err) {

        console.error(
            "Toggle Hall Ticket Publish Error:",
            err
        );

        return res
            .status(500)
            .send("Unable to update Hall Ticket publish status");
    }
};


/* =========================================
   PUBLISH ALL GENERATED HALL TICKETS
========================================= */

exports.publishAllHallTickets = async (req, res) => {

    try {

        const result = await HallTicket.updateMany(
            {
                published: false
            },
            {
                $set: {
                    published: true
                }
            }
        );

        console.log(
            "Published Hall Tickets:",
            result.modifiedCount
        );

        return res.redirect("/admin/halltickets");

    } catch (err) {

        console.error(
            "Publish All Hall Tickets Error:",
            err
        );

        return res
            .status(500)
            .send("Unable to publish Hall Tickets");

    }

};


/* =========================================
   UPDATE EXAM SETTINGS
========================================= */

exports.updateExamSettings = async (req, res) => {

    try {

        const {
            controllerOfficer,
            officialHelpline,
            deskEmail,
            officeHours,
            googleMap
        } = req.body;


        await ExamSettings.findOneAndUpdate(

            {},

            {
                controllerOfficer:
                    controllerOfficer?.trim() || "",

                officialHelpline:
                    officialHelpline?.trim() || "",

                deskEmail:
                    deskEmail?.trim() || "",

                officeHours:
                    officeHours?.trim() || "",

                googleMap:
                    googleMap?.trim() || ""
            },

            {
                upsert: true,
                new: true,
                runValidators: true
            }

        );


        return res.redirect("/admin/exam-settings");


    } catch (err) {

        console.error(
            "Update Exam Settings Error:",
            err
        );


        return res
            .status(500)
            .send("Unable to update Exam Settings");

    }

};


exports.examSettingsPage = async (req, res) => {

    try {

        let settings = await ExamSettings.findOne().lean();

        if (!settings) {

            settings = {
                controllerOfficer: "",
                officialHelpline: "",
                deskEmail: "",
                officeHours: "",
                googleMap: ""
            };

        }

        res.render("admins/halltickets/examSettings", {

            layout: "admins/layout/admin",

            settings

        });

    } catch (err) {

        console.error(
            "Exam Settings Page Error:",
            err
        );

        res
            .status(500)
            .send("Unable to load Exam Settings");

    }

};

// ADMIN LOGOUT
exports.adminLogout = (req, res) => {
    req.session.destroy(() => {
        res.redirect("/admin/login");
    });
};


/* =========================================
   EXAM SETTINGS PAGE
========================================= */

