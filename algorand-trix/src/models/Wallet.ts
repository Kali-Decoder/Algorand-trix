import mongoose, { Schema, Document } from 'mongoose';

export interface IWallet extends Document {
  address: string;
  createdAt: Date;
}

const WalletSchema: Schema = new Schema<IWallet>(
  {
    address: { type: String, required: true, unique: true, lowercase: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export default mongoose.models.Wallet || mongoose.model<IWallet>('Wallet', WalletSchema);
