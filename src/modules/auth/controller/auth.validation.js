import joi from "joi";
import { generalFeilds } from "../../../middlewares/validation.middleware.js";

export const headersSchema = generalFeilds.headers;

export const authRegisterSchema = joi
  .object({
    email: generalFeilds.email.required(),
    name: generalFeilds.name.required(),
    gradeLevelId: joi.number().required().valid(8321, 5896, 8842),
    gender: joi.string().valid("male", "female").default("male"),
    password: generalFeilds.password.required(),
    profilePic: generalFeilds.file.required(),
    scientificTrack: joi
      .number()
      .allow(null)
      .when("gradeLevelId", {
        is: 8321,
        then: joi.number().allow(null).optional(),
        otherwise: joi.number().required().messages({
          "any.required": "Scientific track is required for grade 2 or 3",
        }),
      }),
    subjects: joi.array().items(joi.number()).optional(),
  })
  .required();

export const logInSchema = joi
  .object({
    email: generalFeilds.email.required(),

    password: generalFeilds.password.required(),
  })
  .required();

export const reActivateAccSchema = joi.object({
  email: generalFeilds.email.required(),
});

export const forgetPasswordSchema = joi
  .object({
    email: generalFeilds.email.required(),
  })
  .required();

export const resetPasswordOTPSchema = joi
  .object({
    userEmail: generalFeilds.email.required(),
    password: generalFeilds.password.required(),
    otp: joi
      .string()
      .pattern(/^[0-9]{6}$/)
      .required()
      .messages({
        "string.pattern.base": "OTP must be 6 digits",
        "any.required": "OTP is required",
      }),
  })
  .required();
