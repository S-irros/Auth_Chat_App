import Router from "express";
import * as contactController from "./controller/contact.controller.js";
import {
  headersSchema,
} from "./controller/contact.validation.js";
import { isValid } from "../../middlewares/validation.middleware.js";
import { auth } from "../../middlewares/auth.middleware.js";

const router = Router();

//search contacts
router.post(
  "/searchContacts",
  isValid(headersSchema, true),
  auth(["user"]),
  contactController.searchContacts
);

//get contacts
router.get(
  "/getContacts",
  isValid(headersSchema, true),
  auth(["user"]),
  contactController.getContactsFromDMList
);
//get all contacts
router.get(
  "/getAllContacts",
  isValid(headersSchema, true),
  auth(["user"]),
  contactController.getAllContacts
);

export default router;
