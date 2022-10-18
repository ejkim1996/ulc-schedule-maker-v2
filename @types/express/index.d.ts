import { Profile } from "passport-google-oauth20";
import { User } from "express";

declare global {
  namespace Express {
    export interface User {
      profile: Profile;
    }
  }
}
