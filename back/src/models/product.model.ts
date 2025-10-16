import { Schema, model } from "mongoose";
import { Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  price: number;
  description: string;
  dateCreated: Date;
  urlImage: string;
  seller: Schema.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "O nome do produto é obrigatório."],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "O preço do produto é obrigatório."],
      min: [0, "O preço não pode ser negativo."],
    },
    description: {
      type: String,
      required: [true, "A descrição do produto é obrigatória."],
    },
    dateCreated: {
      type: Date,
      default: Date.now,
    },
    urlImage: {
      type: String,
      required: [true, "A URL da imagem é obrigatória."],
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    strict: false,
  },
);

const Product = model("Product", productSchema);
export default Product;
