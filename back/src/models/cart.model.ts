import { Schema, model, Document, PopulatedDoc } from "mongoose";
import { IProduct } from "./product.model";
import { IUser } from "./user.model";

interface ICartItem {
  product: PopulatedDoc<IProduct & Document>;
  quantity: number;
}

export interface ICart extends Document {
  customer: PopulatedDoc<IUser & Document>;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const cartSchema = new Schema<ICart>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Cart = model<ICart>("Cart", cartSchema);
export default Cart;
