import { Router } from "express";
import * as authController from "./controller/auth.controller.js";
import {
  authRegisterSchema,
  forgetPasswordSchema,
  headersSchema,
  logInSchema,
  reActivateAccSchema,
  resetPasswordOTPSchema,
} from "./controller/auth.validation.js";
import { isValid } from "../../middlewares/validation.middleware.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { allowedTypesMap, fileUpload } from "../../utils/multerCloudinary.js";
import userModel from "../../../DB/models/User.model.js";

const router = Router();

//registeration
router.post("/register",
  fileUpload(5,allowedTypesMap).single("profilePic"),
  isValid(authRegisterSchema), authController.signUp);

//login
router.post("/login", isValid(logInSchema), authController.logIn);

//log out
router.patch(
  "/logOut",
  isValid(headersSchema, true),
  auth(["user"]),
  authController.logOut
);
//email confirmation
router.get("/confirm/:activationCode", authController.activateAcc);

//request new email confirmation
router.post(
  "/newConfirm/:email",
  isValid(reActivateAccSchema),
  authController.reActivateAcc
);

//forget password By OTP
router.post(
  "/forgetPasswordOTP",
  isValid(forgetPasswordSchema),
  authController.forgetPasswordOTP
);

//reset password by otp
router.post(
  "/resetPasswordOTP/:userEmail",
  isValid(resetPasswordOTPSchema),
  authController.resetPasswordOTP
);

router.get("/try", auth(), async (req, res) => {
  try {

    const mySubjects = await userModel.findOne(req.user._id).populate({
      path: "gradeLevelRef",
      select: "name subjects -_id" 
    });

    res.status(200).json(mySubjects);
  } catch (error) {
    console.error("❌ Error fetching subjects:", error.message);
    res.status(500).json({ message: "Error fetching subjects.", error: error.message });
  }
});

export default router;
