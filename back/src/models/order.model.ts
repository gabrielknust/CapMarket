import { Schema, model } from "mongoose";

const orderSchema = new Schema(
  {
    client: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        unitaryPrice: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    totalOrder: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["Pendente", "Pago", "Enviado", "Entregue", "Cancelado"],
      default: "Pendente",
    },
    dateOrder: {
      type: Date,
      default: Date.now,
    },
    address: {
      rua: String,
      cidade: String,
      cep: String,
    },
  },
  {
    timestamps: true,
  },
);

const Order = model("Order", orderSchema);
export default Order;
