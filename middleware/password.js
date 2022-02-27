const passwordValidator = require('password-validator');

// Création du schema
const passwordSchema = new passwordValidator();

// Règle que doit respecter le mot de passe

passwordSchema
    .is().min(8) // minimum de 8 caractère
    .is().max(20) // maximum de 20 caractère
    .has().uppercase() // doit contenir au moins une majuscule
    .has().lowercase() // doit contenir au moins une minuscule
    .has().digits(2) // doit contenir au moins 2 chiffres
    .has().symbols() // doit contenir au moins un caractère spécial
    .has().not().spaces() // Ne doit pas contenir d'espace
    .has().not(/=/) // Ne doit pas contenir de signe égal =

// Vérification du mot de passe
module.exports = (req, res, next) => {
    if(!passwordSchema.validate(req.body.password)) {
        return res.status(400).json({ message: "Votre mot de passe doit contenir entre 8 et 20 caratères, avec au moins une majuscule, une minuscule, 2 chiffres et un caractère spécial, le signe = n'est pas autorisé" });
    } else {
        next();
    }
};