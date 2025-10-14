import { Schema, model } from "mongoose";
import crypto from "crypto";

const userSchema = new Schema(
  {
    nome: {
      type: String,
      required: [true, "O nome é obrigatório."],
    },
    email: {
      type: String,
      required: [true, "O email é obrigatório."],
      unique: true,
      lowercase: true,
      trim: true,
    },
    senha: {
      type: String,
      required: [true, "A senha é obrigatória."],
      select: false,
    },
    salt: {
      type: String,
      select: false,
    },
    papel: {
      type: String,
      required: true,
      enum: ["Cliente", "Vendedor"],
    },
    isAtivo: {
      type: Boolean,
      default: true,
    },
    compras: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", function (next) {
  if (!this.isModified("senha")) {
    return next();
  }

  this.salt = crypto.randomBytes(16).toString("hex");

  const hash = crypto
    .pbkdf2Sync(this.senha, this.salt, 100000, 64, "sha512")
    .toString("hex");

  this.senha = hash;

  next();
});

userSchema.methods.compararSenha = function (senhaCandidata: string): boolean {
  const hashCandidato = crypto
    .pbkdf2Sync(senhaCandidata, this.salt, 100000, 64, "sha512")
    .toString("hex");

  const hashReal = Buffer.from(this.senha, "hex");
  const hashFornecido = Buffer.from(hashCandidato, "hex");

  return crypto.timingSafeEqual(hashReal, hashFornecido);
};

const User = model("User", userSchema);
export default User;
