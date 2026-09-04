const Joi = require("joi");

exports.studentRegisterSchema = Joi.object({
  fullname: Joi.string().min(3).max(30).required(),

  admissionNumber: Joi.string()
    .length(4)
    .required()
    .messages({
      "string.length": "Admission Number must be exactly 4 characters",
    }),

  email: Joi.string().email().required(),

  password: Joi.string()
    .min(8)
    .max(12)
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters",
      "string.max": "Password must be at most 12 characters",
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .messages({
      "any.only": "Password and Confirm Password must match",
    }),
});
