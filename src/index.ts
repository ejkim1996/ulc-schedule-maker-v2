import express, { Express, Request, Response, NextFunction } from "express";
import path from "path";
import mongoose from "mongoose";
import passport from "passport";
import session from "express-session";
import * as dotenv from "dotenv";

import "./auth";

dotenv.config();

const app: Express = express();
const port = process.env.PORT ?? 3001;

function isLoggedIn(req: Request, res: Response, next: NextFunction) {
  req.user ? next() : res.sendStatus(401);
}

app.use(express.static(path.join(__dirname, "client/build")));
app.use(session({ secret: process.env.SESSION_SECRET as string }));
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (_, res: Response) => {
  res.send("test");
});

app.get("/api/test", (_, res: Response) => {
  const test = {
    data: "this is some data",
  };

  res.json(test);
});

app.get("/api/db_test", (_, res: Response) => {
  try {
    // Connect to the MongoDB cluster
    mongoose.connect(process.env.MONGODB_URI as string, () =>
      res.send("Mongoose is connected")
    );
  } catch (e) {
    res.send("could not connect");
  }
});

app.get("/login", (_, res) => {
  res.send("<a href='/auth/google'>Authenticate with Google</a>");
});

app.post("logout", (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.send("Goodbye!");
  });
})

app.get(
  "/api/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

app.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: `${process.env.FE_URL}/protected`,
    failureRedirect: "/auth/failure",
  })
);

app.get("/api/protected", isLoggedIn, (req, res) => {
  let test = {
    "data": req.user?.profile.displayName,
  }

  res.json(test);
});

app.get("/auth/failure", (_, res) => {
  res.send("Failed to log in!");
});


app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
