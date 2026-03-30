import { Schema, model } from 'mongoose';

const loanSchema = new Schema(
  {
    lender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    what: {
      type: String,
      required: true,
      trim: true,
    },
    to: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export default model('Loan', loanSchema);
