import joi from "joi";
import { generalFeilds } from "../../../middlewares/validation.middleware.js";

export const headersSchema = generalFeilds.headers;

export const getMessagesSchema = joi
  .object({
    userId:generalFeilds.id
   
  })
  .required();

