const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const paymentSchema = new Schema(
  {
    orderId: {
        type: String,
        required: true
    },
    paymentId: {
        type: String,
        required: true,
    },
  },
);

module.exports = mongoose.model("Payments", paymentSchema);