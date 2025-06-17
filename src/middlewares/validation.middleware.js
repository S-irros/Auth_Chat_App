import joi from "joi";
import { Types } from "mongoose";

const checkObjectId = (value, helper) => {
  return Types.ObjectId.isValid(value)
    ? true
    : helper.message("Invalid ObjectId");
};

export const generalFeilds = {
  id: joi.string().custom(checkObjectId).required(),
  optionalId: joi.string().custom(checkObjectId),

  name: joi.string().min(3).max(20).messages({
    "any.required": "name is required",
    "string.empty": "name can't be empty",
    "string.base": "name should be a type of string!",
    "string.min": "name should be at least 3 characters!",
    "string.max": "name should be less than 20 characters!",
  }),

  email: joi
    .string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    .messages({
      "string.email": "Email must be valid!!",
      "string.empty": "Email is not allowed to be empty",
    }),
  password: joi
    .string()
    .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)
    .messages({
      "string.pattern.base":
        "password must be at least eight characters long, with at least one letter and one number",
    }),

  cPassword: joi.string().messages({
    "any.only": "The confirmation password must be the same as the password",
  }),
  otp: joi
    .string()
    .pattern(/^[0-9]{6}$/)
    .required()
    .messages({
      "string.pattern.base": "OTP must be 6 digits",
      "any.required": "OTP is required",
    }),

  file: joi.object({
    size: joi.number().positive().required(),
    path: joi.string().required(),
    filename: joi.string().required(),
    destination: joi.string().required(),
    mimetype: joi.string().required(),
    encoding: joi.string().required(),
    originalname: joi.string().required(),
    fieldname: joi.string().required(),
  }),

  headers: joi.object({
    authorization: joi
      .string()
      .regex(/^([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_\-\+\/=]*)/)
      .required(),
  }),

  scientificTrack: joi
    .string()
    .allow(null)
    .custom((value, helpers) => {
      const { gradeLevelId } = helpers.state.ancestors[0];
      if (!gradeLevelId) return value;

      const trackMap = {
        8321: null, // لا يحتاج تراك
        5896: { Scientific: 8106, Literary: 3584 },
        8842: {
          "Scientific Sciences": 2994,
          "Scientific Math": 1518,
          Literary: 2813,
        },
      };

      if (Number(gradeLevelId) === 8321 && value !== null) {
        return helpers.message(
          "Scientific track not allowed for 1st secondary"
        );
      }
      if ([5896, 8842].includes(Number(gradeLevelId)) && !value) {
        return helpers.message(
          "Scientific track is required for 2nd or 3rd secondary"
        );
      }
      if (Number(gradeLevelId) === 5896 && value && !trackMap[5896][value]) {
        return helpers.message(
          "Invalid track for 2nd secondary (must be Scientific or Literary)"
        );
      }
      if (Number(gradeLevelId) === 8842 && value && !trackMap[8842][value]) {
        return helpers.message(
          "Invalid track for 3rd secondary (must be Scientific Sciences, Scientific Math, or Literary)"
        );
      }
      return trackMap[Number(gradeLevelId)]
        ? trackMap[Number(gradeLevelId)][value]
        : value;
    })
    .messages({
      "string.base": "scientificTrack must be a string",
    }),

  gradeLevelId: joi.number().valid(8321, 5896, 8842).required().messages({
    "any.required": "gradeLevelId is required",
    "any.only": "Invalid grade level ID (must be 8321, 5896, or 8842)",
  }),
};

export const isValid = (joiSchema, considerHeaders = false) => {
  return (req, res, next) => {
    let copyReq = {
      ...req.body,
      ...req.params,
      ...req.query,
    };
    if (req.headers?.authorization && considerHeaders) {
      copyReq = { authorization: req.headers.authorization };
    }
    if (req.files || req.file) {
      copyReq.profilePic = req.files || req.file;
    }

    console.log("Received Request Body:", copyReq);

    // تحويل القيم لـ numbers إذا كانت strings
    if (copyReq.scientificTrack) {
      copyReq.scientificTrack = Number(copyReq.scientificTrack);
    }
    if (copyReq.gradeLevelId) {
      copyReq.gradeLevelId = Number(copyReq.gradeLevelId);
    }

    const { error } = joiSchema.validate(copyReq, { abortEarly: false });
    if (error) {
      return res.status(422).json({
        message: "Validation Error",
        status_code: 422,
        Error: error.details.map((detail) => detail.message).join(", "),
      });
    } else {
      req.body = copyReq;
      return next();
    }
  };
};
