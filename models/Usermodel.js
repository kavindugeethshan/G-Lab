import mongoose from "mongoose";

const userschema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true
    },

    firstname: {
      type: String,
      required: true
    },

    lastname: {
      type: String,
      required: true
    },

    password: {
      type: String,
      required: true
    },

    isadmin: {
      type: Boolean,
      default: false,
      required: true
    },

    isblocked: {
      type: Boolean,
      default: false,
      required: true
    },

    isemailverified: {
      type: Boolean,
      default: false,
      required: true
    },

    Image: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model("User", userschema);

export default User;