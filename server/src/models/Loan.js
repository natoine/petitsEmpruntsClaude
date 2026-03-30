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
    // Texte affiché dans les tableaux : username, email ou nom libre
    counterpart: {
      type: String,
      required: true,
      trim: true,
    },
    // Renseigné si la contrepartie a un compte (résolu au moment de la création)
    counterpartUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Renseigné si un email a été saisi (compte existant ou non)
    counterpartEmail: {
      type: String,
      default: null,
    },
    returnedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default model('Loan', loanSchema);
