const Sauce = require('../models/Sauce');
const User = require('../models/User');
const fs = require('fs');

// Créer l'objet sauce dans la base de donnée
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
      ...sauceObject,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save()
      .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
      .catch(error => res.status(400).json({ error }));
};

// Afficher une sauce
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

// Modifier l'objet sauce
exports.modifySauce = (req, res, next) => {
    // Vérification de l'userId
    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            if(!sauce) {
                return res.status(404).json({
                    error: new Error('Objet non trouvé !')
                });
            }
            if(sauce.userId !== req.auth.userId) {
                return res.status(403).json({
                    error: new Error('unauthorized request')
                });
            }
            // Supprimer l'image du serveur si une nouvelle image est uploadé
            if (req.file) {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, (error) =>{
                    if (error) {
                        throw error;
                    }
                })
            }
            // 2 cas de figure, modification de l'image ou sans modification de l'image
            const sauceObject = req.file ?
            {
                ...JSON.parse(req.body.sauce),
                imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
            } : { ...req.body };
            Sauce.updateOne({ _id: req.params.id }, {...sauceObject, _id: req.params.id })
                .then(() => res.status(200).json({ message: 'Objet modifié !'}))
                .catch(error => res.status(400).json({ error}));
        })
        .catch(error => res.status(500).json({ error }));
};

// Supprimer l'objet sauce
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            // Vérification de l'userId
            if(!sauce) {
                return res.status(404).json({
                    error: new Error('Objet non trouvé !')
                });
            }
            if(sauce.userId !== req.auth.userId) {
                return res.status(403).json({
                    error: new Error('unauthorized request')
                });
            }
            // Suppression des fichiers images du serveur
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () =>{
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
                    .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(500).json({ error }));
};

// Like ou Dislike d'une sauce
exports.likeSauce = (req, res, next) => {
    let like = req.body.like;
    User.findOne({ _id: req.body.userId })
      .then(user => {
        Sauce.findOne({ _id: req.params.id })
          .then(sauce => {
            let arrayOfIdLiked = sauce.usersLiked;
            let arrayOfIdDisliked = sauce.usersDisliked;
            let numberOflikes = sauce.likes;
            let numberOfDislikes = sauce.dislikes;
            switch (like) {
                // Annulation d'un like ou d'un dislike
              case 0 :
                if (sauce.usersLiked.includes(user._id)) { 
                  let userIdIndex = sauce.usersLiked.indexOf(user._id);
                  arrayOfIdLiked.splice(userIdIndex, 1);
                  numberOflikes--;
                  Sauce.updateOne({ _id: req.params.id }, { likes: numberOflikes, usersLiked: arrayOfIdLiked, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Like supprimé!'}))
                    .catch(error => res.status(400).json({ error }))
                };
                if (sauce.usersDisliked.includes(user._id)) {
                  let userIdIndex = sauce.usersDisliked.indexOf(user._id);
                  arrayOfIdDisliked.splice(userIdIndex, 1);
                  numberOfDislikes--;
                  Sauce.updateOne({ _id: req.params.id }, { dislikes: numberOfDislikes, usersDisliked: arrayOfIdDisliked, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Dislike supprimé!'}))
                    .catch(error => res.status(400).json({ error }))
                };
                break;
                // Like
              case 1 :
                  arrayOfIdLiked.push(user._id);
                  numberOflikes++;
                  Sauce.updateOne({ _id: req.params.id }, { likes: numberOflikes, usersLiked: arrayOfIdLiked, _id: req.params.id })
                    .then(() => res.status(200).json({ message: `Like ajouté !` }))
                    .catch((error) => res.status(400).json({ error }))
                      
                break;
                //Dislike
              case -1 :
                  arrayOfIdDisliked.push(user._id);
                  numberOfDislikes++;
                  Sauce.updateOne({ _id: req.params.id }, { dislikes: numberOfDislikes, usersDisliked: arrayOfIdDisliked, _id: req.params.id })
                    .then(() => { res.status(200).json({ message: `Dislike ajouté !` }) })
                    .catch((error) => res.status(400).json({ error }))
                break;
                
                default:
                  console.log(error);
            }          
          })
      })
      .catch(error => res.status(404).json({ error }))
};

// Afficher toutes les sauces
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};