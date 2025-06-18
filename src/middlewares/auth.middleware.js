import userModel from "../../DB/models/User.model.js";
import { asyncHandler } from "../utils/errorHandling.js";
import { verifyToken } from "../utils/generateAndVerifyToken.js";

export const auth = (accessRoles = []) => {
  return asyncHandler(async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
      return next(new Error("Authorization is required", { cause: 400 }));
    }

    // استخرج الـ token من "Bearer <token>"
    const token = authorization.startsWith("Bearer ")
      ? authorization.split(" ")[1]
      : authorization;
    if (!token) {
      return next(new Error("Valid token is required", { cause: 401 }));
    }

    const decoded = verifyToken({
      payload: token, // استخدم الـ token لوحده
      signature: process.env.SIGNATURE,
    });
    if (!decoded?.id) {
      return next(new Error("In-valid token payload", { cause: 401 }));
    }

    const authUser = await userModel.findById(decoded.id);
    if (!authUser) {
      return next(new Error("not register account", { cause: 401 }));
    }

    if (parseInt(authUser.changeAccountInfo?.getTime() / 1000) > decoded.iat) {
      return next(
        new Error("Expired token ,please login again", { cause: 400 })
      );
    }

    req.user = authUser;
    return next();
  });
};
