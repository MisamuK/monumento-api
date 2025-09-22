const express = require('express');
const router = express.Router();

const { UserModel, MonumentModel, FavoriteModel } = require('../db/sequelize');

// Middleware temporaire pour tests sans auth JWT
router.use((req, res, next) => {
  req.user = { id: 1 };
  next();
});

// Récupérer les monuments favoris d’un utilisateur
router.get('/', async (req, res) => {
  try {
    const user = await UserModel.findByPk(req.user.id, {
      include: {
        model: MonumentModel,
        as: 'favoriteMonuments',
        attributes: ['id', 'title', 'description'],
        through: { attributes: [] }
      }
    });

    return res.json(user ? user.favoriteMonuments : []);
  } catch (err) {
    return res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
});

// Ajouter un monument aux favoris
router.post('/:monumentId', async (req, res) => {
  try {
    const monumentId = parseInt(req.params.monumentId, 10);

    const [fav, created] = await FavoriteModel.findOrCreate({
      where: { userId: req.user.id, monumentId }
    });

    if (!created) {
      return res.status(400).json({ error: 'Ce monument est déjà en favori.' });
    }

    return res.status(201).json(fav);
  } catch (err) {
    return res.status(500).json({
      error: 'Erreur lors de l’ajout aux favoris',
      details: err.message
    });
  }
});

// Supprimer un monument des favoris
router.delete('/:monumentId', async (req, res) => {
  try {
    const monumentId = parseInt(req.params.monumentId, 10);

    const deleted = await FavoriteModel.destroy({
      where: { userId: req.user.id, monumentId }
    });

    if (!deleted) {
      return res.status(404).json({ error: 'Favori non trouvé.' });
    }

    return res.json({ message: 'Favori supprimé avec succès.' });
  } catch (err) {
    return res.status(500).json({
      error: 'Erreur lors de la suppression du favori',
      details: err.message
    });
  }
});

module.exports = router;
