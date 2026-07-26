/* ==========================================================================
   USER MODEL
   --------------------------------------------------------------------------
   A Mongoose "model" is a JavaScript class that maps to a MongoDB
   collection — every document saved here becomes one row in the
   "users" collection in your database. The "schema" below defines
   what fields every user document must have, and Mongoose validates
   against it automatically before saving.

   Right now this combines the caregiver's login credentials AND the
   one elder profile they created into a single document, which is the
   simplest possible version of this data model. If you ever want one
   caregiver to manage MULTIPLE elder profiles (the dashboard mockup on
   index.html shows Zawadi with three people under her care), this is
   the file you'd split into two: a User model (just login info) and a
   separate ElderProfile model that references the User's _id — but
   that's a deliberate next step, not something to worry about yet.
   ========================================================================== */
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    // --- the caregiver's own details ---
    caregiverName: { type: String, required: true, trim: true },
    caregiverPhone: { type: String, required: true, trim: true },
    relationship: { type: String, required: true },

    // --- login credentials ---
    // `unique: true` tells MongoDB to reject a second document with
    // the same username at the database level, as a backstop —
    // api/index.js also checks this itself before creating a user, so
    // the person gets a clear error message instead of a confusing
    // database crash.
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },

    // Never store a real password here — only ever the bcrypt HASH of
    // one (see the /api/register route in api/index.js, which is the
    // only place a plain-text password ever exists, briefly, before
    // being hashed and thrown away).
    passwordHash: { type: String, required: true },

    // --- the elder's profile ---
    elderName: { type: String, required: true, trim: true },
    condition: { type: String, required: true, trim: true },
    homeArea: { type: String, required: true, trim: true },
    safeInstruction: { type: String, required: true, trim: true },

    // The public card ID, generated once at registration and never
    // changed afterwards — this is what would eventually get encoded
    // into an actual QR code.
    cardId: { type: String, required: true, unique: true },
  },
  {
    // Automatically adds and maintains `createdAt` / `updatedAt`
    // fields on every document, without us having to set them by hand.
    timestamps: true,
  }
);

// `mongoose.models.User || mongoose.model(...)` avoids a
// "Cannot overwrite model once compiled" error. Vercel's serverless
// functions can reuse a "warm" instance of this file between requests
// instead of re-running it from scratch every time, so without this
// check, defining the model a second time on a reused instance would
// crash instead of just reusing the model that's already there.
module.exports = mongoose.models.User || mongoose.model('User', userSchema);
