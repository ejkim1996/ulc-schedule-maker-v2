import passport from "passport";
import * as dotenv from "dotenv";

dotenv.config();

import { Strategy as GoogleStrategy } from "passport-google-oauth20";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: "http://localhost:3001/google/callback",
      scope: ["profile"],
      passReqToCallback: true,
    },
    function verify(_accessToken, _refreshToken, _params, profile, done) {
      return done(null, { profile: profile });
    }
  )
);

passport.serializeUser((user, done) => {
  process.nextTick(() => {
    done(null, user);
  });
});

passport.deserializeUser((user: Express.User, done) => {
  process.nextTick(() => {
    done(null, user);
  });
});
