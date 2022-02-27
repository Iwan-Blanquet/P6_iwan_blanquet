const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// Schéma de l'objet user
const userSchema = mongoose.Schema( {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Plugin pour vérifié que l'email utilisateur soit unique dans la base de donnée
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);