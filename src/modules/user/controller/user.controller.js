import userModel from "../../../../DB/models/User.model.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import { compare, Hash } from "../../../utils/Hash&Compare.js";
import {
  generateToken,
  verifyToken,
} from "../../../utils/generateAndVerifyToken.js";
import { accountRecoveryEmail } from "../../../utils/Emails/accountRecoveryEmail.js";
import moment from "moment";
import sendEmail from "../../../utils/Emails/sendEmail.js";
import { uploadToCloudinary } from "../../../utils/uploadHelper.js";
import cloudinary from "../../../utils/cloudinary.js";


// 👤 **Get User Profile**
export const userProfile = asyncHandler(async (req, res, next) => {
  const user = await userModel
    .findById(req.user._id)
    .select("name email gradeLevel gender availability")
    .lean();

  if (!user) {
    return next(new Error("User not found.", { cause: 404 }));
  }

  return res
    .status(200)
    .json({
      status: "success",
      message: "Profile retrieved successfully.",
      user,
    });
});

//====================================================================================================================//
//update user
export const updateUser = asyncHandler(async (req, res, next) => {
  const { name, email, gradeLevel, gender } = req.body;
  if (!name && !email && !gradeLevel && !gender) {
    return next(new Error("We need information to update.", { cause: 400 }));
  }

  const checkUser = await userModel.findById({ _id: req.user._id }).lean();
  if (!checkUser) {
    return next(new Error("User not found.", { cause: 404 }));
  }

  const object = { ...req.body };

  for (let key in object) {
    if (checkUser[key] == object[key]) {
      return next(
        new Error(
          `I'm sorry, but we cannot update your ${key} with your old one. 
          Please make sure that ${key} you have entered correctly and try again.`,
          { cause: 400 }
        )
      );
    }
  }

  // Email uniqueness check
  if (email && email !== checkUser.email) {
    const existingUser = await userModel.findOne({ email });
    if (
      existingUser &&
      existingUser._id.toString() !== req.user._id.toString()
    ) {
      return next(
        new Error("The email you entered is already in use.", { cause: 409 })
      );
    }
  }
  if (checkUser.isDeleted) {
    return next(
      new Error(
        "Can't update your information because your account may be suspended or deleted",
        { cause: 400 }
      )
    );
  }

  const user = await userModel.findByIdAndUpdate(
    { _id: req.user._id },
    req.body,
    { new: true }
  );
  return res
    .status(200)
    .json({ status: "success", message: "User updated", result: user });
});

//====================================================================================================================//
//update password
export const changePassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  const matchOld = compare({
    plainText: oldPassword,
    hashValue: req.user.password,
  });
  if (!matchOld) {
    return next(new Error("In-valid password", { cause: 409 }));
  }
  const checkMatchNew = compare({
    plainText: newPassword,
    hashValue: req.user.password,
  });
  if (checkMatchNew) {
    return next(
      new Error("New password can't be old password", { cause: 400 })
    );
  }
  const hashPassword = Hash({ plainText: newPassword });
  const user = await userModel
    .findByIdAndUpdate(req.user._id, { password: hashPassword }, { new: true })
    .select("email updatedAt");
  return res.status(200).json({
    status: "success",
    message: "Password updated successfully",
    result: user,
  });
});
//====================================================================================================================//
//deleteUser

export const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await userModel.findById(req.user._id);
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }

  if (user.isDeleted) {
    return next(
      new Error("User account is already deactivated", { cause: 400 })
    );
  }

  const deactivationDate = moment().add(1, "month").toISOString(); // 30 days from now
  await userModel.findByIdAndUpdate(req.user._id, {
    isDeleted: true,
    status: "Not Active",
    permanentlyDeleted: deactivationDate,
  });

  const reactiveToken = generateToken({
    payload: { email: user.email, userId: user._id },
    signature: process.env.RECOVER_ACCOUNT_SIGNATURE,
    expiresIn: "30d",
  });

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const recoveryLink = `${baseUrl}/user/accountRecovery/${reactiveToken}`;

  const html = accountRecoveryEmail(recoveryLink);
  const emailSent = await sendEmail({
    to: user.email,
    subject: "Account Recovery - Action Required",
    html,
  });

  if (!emailSent) {
    await userModel.findByIdAndUpdate(req.user._id, {
      isDeleted: false,
      status: "Active",
      $unset: { permanentlyDeleted: 1 },
    });

    return next(
      new Error(
        "Failed to send recovery email. Account deactivation canceled.",
        { cause: 500 }
      )
    );
  }
  return res.status(200).json({
    status: "success",
    message:
      "Your account has been deactivated. Check your email for recovery instructions. You have 30 days to recover your account before it's permanently deleted.",
    deactivatedUntil: deactivationDate,
  });
});

//====================================================================================================================//
//recover account
export const accountRecovery = asyncHandler(async (req, res, next) => {
  const { reactiveToken } = req.params;
  const decoded = verifyToken({
    payload: reactiveToken,
    signature: process.env.RECOVER_ACCOUNT_SIGNATURE,
  });
  const user = await userModel.updateOne(
    { email: decoded.email, isDeleted: true },
    { isDeleted: false, $unset: { permanentlyDeleted: 1 }, status: "Active" }
  );
  if (user.matchedCount == 0) {
    return next(new Error("Account may be already active", { cause: 410 }));
  }

  return res.status(200).json({
    status: "success",
    message: "Your account recoverd successfully",
    result: user,
  });
});
//====================================================================================================================//
//profile pic
export const uploadProfilePic = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(
      new Error("Please select your profile picture", { cause: 400 })
    );
  }
  const user = await userModel.findById(req.user._id);
  if (!user) {
    return next(new Error("User not found.", { cause: 404 }));
  }

  const profilePic = await uploadToCloudinary(
    req.file,
    `${process.env.APP_NAME}/User/${user.randomId}`,
    `${user.randomId}profilePic`
  );

  user.profilePic = profilePic;
  user.profilePicPublicId = `${process.env.APP_NAME}/User/${user.randomId}/${user.randomId}profilePic`;
  await user.save();

  return res.status(200).json({
    status: "success",
    message: "Profile Picture uploaded successfully",
    user: user,
  });
});
//====================================================================================================================//
//remove profile pic
export const removeProfilePic = asyncHandler(async (req, res, next) => {
  const user = await userModel.findById(req.user._id);

  if (!user) {
    return next(new Error("User not found.", { cause: 404 }));
  }

  // Check if the user has a profile picture before deleting
  if (user.profilePicPublicId) {
    await cloudinary.uploader.destroy(user.profilePicPublicId);
  } else {
    return next(
      new Error("No profile picture found to remove.", { cause: 400 })
    );
  }

  // Remove profile picture and its public ID
  const updatedUser = await userModel.findByIdAndUpdate(
    req.user._id,
    { $unset: { profilePic: 1, profilePicPublicId: 1 } },
    { new: true }
  );

  return res.status(200).json({
    status: "success",
    message: "Profile picture removed successfully.",
    user: updatedUser,
  });
});