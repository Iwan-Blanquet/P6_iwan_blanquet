const express = require('express');
const router = express.Router();


//permet de faire l'authe,tification avant le reste
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const saucesCtrl = require('../controllers/sauces');

router.post('/', auth, multer, saucesCtrl.createSauce);

router.get('/:id', auth, saucesCtrl.getOneSauce);


router.put('/:id', auth, multer, saucesCtrl.modifySauce);

router.delete('/:id', auth, saucesCtrl.deleteSauce);

router.get('/', auth, saucesCtrl.getAllSauces);

module.exports = router;