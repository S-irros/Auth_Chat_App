import Router from "express";
import * as messageController from "./controller/message.controller.js";
import { isValid } from "../../middlewares/validation.middleware.js";
import { auth } from "../../middlewares/auth.middleware.js";
import {
  getMessagesSchema,
  headersSchema,
} from "./controller/message.validation.js";
import { allowedTypesMap, fileUpload } from "../../utils/multerCloudinary.js";

const router = Router();

//get messages
router.post(
  "/getMessages/:userId",
  isValid(headersSchema, true),
  auth(["user"]),
  isValid(getMessagesSchema),
  messageController.getMessages
);


export default router;
