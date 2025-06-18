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
    Authorization: joi
      .string()
      .regex(/^([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_\-\+\/=]*)/)
      .required(),
  }),

  scientificTrack: joi
    .number()
    .allow(null)
    .custom((value, helpers) => {
      const { gradeLevelId } = helpers.state.ancestors[0];
      if (!gradeLevelId) return value;

      const gradeLevelNum = Number(gradeLevelId); // تأكد إن الـ gradeLevelId number
      if (gradeLevelNum === 8321 && value !== null) {
        return helpers.message(
          "Scientific track not allowed for 1st secondary"
        );
      }
      if ([5896, 8842].includes(gradeLevelNum) && value === null) {
        return helpers.message(
          "Scientific track is required for 2nd or 3rd secondary"
        );
      }
      const validTracks = {
        5896: [8106, 3584],
        8842: [2994, 1518, 2813],
      };
      if (value !== null && !validTracks[gradeLevelNum]?.includes(value)) {
        return helpers.message(`Invalid track for grade ${gradeLevelNum}`);
      }
      return value;
    })
    .messages({
      "number.base": "scientificTrack must be a number",
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
