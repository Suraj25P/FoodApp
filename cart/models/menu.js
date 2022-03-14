const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const menuSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["PIZZA", "PASTA", "BURGER","SNACK","DRINK"],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    todaysSpecial: {
      type: Boolean,
      required: true,
      default:false
    },
    Avaliable: {
      type: Boolean,
      required: true,
      default:true
    },
  },
);

module.exports = mongoose.model("Menu", menuSchema);