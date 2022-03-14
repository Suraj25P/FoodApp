const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNo: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      default: "CUSTOMER"
    },
  },
);

module.exports = mongoose.model("User", userSchema);