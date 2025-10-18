import { Schema, model, Document, PopulatedDoc } from "mongoose";
import { IUser } from "./user.model";
import { IProduct } from "./product.model";

export interface IFavorite extends Document {
  user: PopulatedDoc<IUser & Document>;
  product: PopulatedDoc<IProduct & Document>;
}

const favoriteSchema = new Schema<IFavorite>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

favoriteSchema.index({ user: 1, product: 1 }, { unique: true });

const Favorite = model<IFavorite>("Favorite", favoriteSchema);
export default Favorite;
