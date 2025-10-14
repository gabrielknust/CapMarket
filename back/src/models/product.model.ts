const mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new Schema(
  {
    nome: {
      type: String,
      required: [true, "O nome do produto é obrigatório."],
      trim: true,
    },
    preco: {
      type: Number,
      required: [true, "O preço do produto é obrigatório."],
      min: [0, "O preço não pode ser negativo."],
    },
    descricao: {
      type: String,
      required: [true, "A descrição do produto é obrigatória."],
    },
    dataPublicacao: {
      type: Date,
      default: Date.now,
    },
    urlImagem: {
      type: String,
      required: [true, "A URL da imagem é obrigatória."],
    },
    vendedor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isAtivo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    strict: false,
  },
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
