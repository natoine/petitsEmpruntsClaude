import { Schema, model } from 'mongoose';

const loanSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    kind: {
      type: String,
      enum: ['loan', 'borrow'],
      required: true,
    },
    what: {
      type: String,
      required: true,
      trim: true,
    },
    // Pour kind='loan' : à qui on a prêté
    // Pour kind='borrow' : à qui on a emprunté
    counterpart: {
      type: String,
      required: true,
      trim: true,
    },
    returnedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default model('Loan', loanSchema);
