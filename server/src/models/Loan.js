import { Schema, model } from 'mongoose';

const partySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    email:  { type: String, default: null },
    name:   { type: String, required: true, trim: true },
  },
  { _id: false }
);

const loanSchema = new Schema(
  {
    what:     { type: String, required: true, trim: true },
    lender:   { type: partySchema, required: true },
    borrower: { type: partySchema, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    // kind du point de vue du créateur : 'loan' = il a prêté, 'borrow' = il a emprunté
    kind: { type: String, enum: ['loan', 'borrow'], required: true },
    returnedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default model('Loan', loanSchema);
