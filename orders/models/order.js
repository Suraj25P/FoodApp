const { OrderStatus } = require("@srpfoodapp/comman");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    owner:{type: Schema.Types.ObjectId, ref: "User"},
    status: {
      type: String,
      enum: ["created", "accepted" , "cancelled","ready","completed"],
      required: true,    
    },
    total: {
      type: String,
      required: true,
    },
    items: [{ 
        itemName: {
        type: String,
        required: true,
      },
        quantity: {
      type: Number,
      required: true,
    },
      }
    ],

  },{timestamps:true}
);

module.exports = mongoose.model("Order", orderSchema);