import Router from "express";
import * as contactController from "./controller/contact.controller.js";
import { headersSchema } from "./controller/contact.validation.js";
import { isValid } from "../../middlewares/validation.middleware.js";
import { auth } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/searchContacts",
  isValid(headersSchema, { headers: true }),
  auth(["user"]),
  contactController.searchContacts
);

router.get(
  "/getContacts",
  isValid(headersSchema, { headers: true }),
  auth(["user"]),
  contactController.getContactsFromDMList
);

router.get(
  "/getAllContacts",
  isValid(headersSchema, { headers: true }),
  auth(["user"]),
  contactController.getAllContacts
);

export default router;
