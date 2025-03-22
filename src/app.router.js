import cookieParser from "cookie-parser"
import connectDB from "../DB/connection.js";
import { glopalErrHandling } from "./utils/errorHandling.js";
import authRouter from "./modules/auth/auth.router.js";
import userRouter from "./modules/user/user.router.js";
import contactRouter from "./modules/contact/contact.router.js";
import messageRouter from "./modules/message/message.router.js"

const initApp = (app, express) => {
  app.use(express.json({}));
  app.use(cookieParser()) 

  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use("/contact", contactRouter);
  app.use("/message", messageRouter);





  app.all("*", (req, res, next) => {
    return next(new Error("error 404 in-valid routing", { cause: 404 }));
  });

  app.use(glopalErrHandling);

  //connect DataBase
  connectDB();
};

export default initApp;
