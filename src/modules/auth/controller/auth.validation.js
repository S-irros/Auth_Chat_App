import joi from "joi";
import { generalFeilds } from "../../../middlewares/validation.middleware.js";

export const headersSchema = generalFeilds.headers;

export const authRegisterSchema = joi
  .object({
    email: generalFeilds.email.required(),

    name: generalFeilds.name.required(),
    
    gradeLevel: joi.string().trim().allow("", null),
    
    gender: joi.string().valid("male", "female").default("male"),

    password: generalFeilds.password.required(),

    file: generalFeilds.file.required(),

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
    
    otp: generalFeilds.otp,
  })
  .required();
