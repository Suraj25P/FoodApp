const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const cartSchema = new Schema(
  {
    owner: {
      type: String,
      required: true,
    },
    items: [
        {
          quantity: { type: Number ,default: 1 },
          itemId :{ type: Schema.Types.ObjectId, ref: "Menu" }
        }
      ],

  }
);

module.exports = mongoose.model("Cart", cartSchema);