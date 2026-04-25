const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { faker } = require("@faker-js/faker");

mongoose.connect("mongodb://127.0.0.1:27017/collegePortal");

const studentSchema = new mongoose.Schema({}, { strict: false });
const Student = mongoose.model("Student", studentSchema, "students");

const TOTAL = 2230;
const BATCH_SIZE = 200; // 🔥 ek baar me 200 insert

async function generateStudent(i) {
  const hashedPassword = await bcrypt.hash("123456", 10);

  return {
    fullname: faker.person.fullName(),
    email: `student${i}@gmail.com`, // unique rakha for safety
    password: hashedPassword,
    admissionNumber: 8000 + i,

    isVerified: true,
    approvalStatus: "approved",
    isActive: true,
    role: "student",
    isProfileComplete: true,

    lastNoticeSeenAt: new Date(),
    createdAt: new Date(),

    profileImage: "/uploads/default.png",

    aadharNumber: faker.string.numeric(12),
    abcId: faker.string.numeric(12),

    address: faker.location.streetAddress() + ", " + faker.location.city(),

    bloodGroup: faker.helpers.arrayElement(["A+", "B+", "O+", "AB+"]),
    course: "Information Technology",
    courseCode: "0414424610",

    dob: faker.date.birthdate({ min: 18, max: 22, mode: "age" }),

    fatherName: faker.person.fullName({ sex: "male" }),
    motherName: faker.person.fullName({ sex: "female" }),

    gender: faker.helpers.arrayElement(["Male", "Female"]),

    guardianPhone: faker.phone.number("9#########"),
    phone: faker.phone.number("9#########"),

    rollNumber: `ROLL${8000 + i}`,
    semester: faker.number.int({ min: 1, max: 8 }),

    showWarning: false,
    warningMessage: ""
  };
}

async function insertStudents() {
  let inserted = 0;

  for (let i = 1; i <= TOTAL; i += BATCH_SIZE) {
    const batch = [];

    for (let j = i; j < i + BATCH_SIZE && j <= TOTAL; j++) {
      const student = await generateStudent(j);
      batch.push(student);
    }

    await Student.insertMany(batch);
    inserted += batch.length;

    console.log(`✅ Inserted ${inserted}/${TOTAL}`);
  }

  console.log("🔥 ALL 2230 STUDENTS INSERTED SUCCESSFULLY");
  mongoose.connection.close();
}

insertStudents(); 
