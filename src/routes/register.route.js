const { UserModel } = require('../db/sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const privateKey = fs.readFileSync('./src/auth/jwtRS256.key');

module.exports = (app) => {
  app.post('/api/register', async (req, res) => {
    try {
      const { username, email, password } = req.body;

      // Validation basique
      if (!username || !email || !password) {
        return res.status(400).json({
          message: "Tous les champs (username, email, password) sont requis.",
          data: null
        });
      }

      // Vérifie si un utilisateur avec cet email existe déjà
      const existingUser = await UserModel.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          message: "Un utilisateur avec cet email existe déjà.",
          data: null
        });
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);

      // Créer le nouvel utilisateur
      const newUser = await UserModel.create({
        name: username, // correspond au champ réel dans ta BDD
        email,
        password: hashedPassword
      });

      // Générer un token JWT (RS256)
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email },
        privateKey,
        { algorithm: 'RS256', expiresIn: '1h' }
      );

      //  Retourner la réponse
      return res.status(201).json({
        message: "Utilisateur créé avec succès",
        data: {
          userId: newUser.id,
          token
        }
      });

    } catch (error) {
      // Affiche l'erreur côté serveur (console)
      console.error(" Erreur dans /api/register :", error);

      // Réponse générique côté client
      return res.status(500).json({
        message: "Une erreur s'est produite. Réessayez dans quelques instants.",
        data: null
      });
    }
  });
};
