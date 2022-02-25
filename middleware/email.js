const validator = require('validator');

// Vérification de l'email
module.exports = (req, res, next) => {
    if (!validator.isEmail(req.body.email)) {
        return res.status(400).json({ message: "Veuillez saisir une adresse mail valide" });
    } else {
        next();
    }
};