const { UserModel } = require('../db/sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const privateKey = fs.readFileSync('./src/auth/jwtRS256.key');
const { handleError } = require('../../helper');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  message: {
    message: "Trop de tentatives de connexion. Veuillez réessayer plus tard.",
    data: null
  }
});

module.exports = (app) => {
  app.post('/api/login', loginLimiter, async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "L'email et le mot de passe sont requis",
        data: null
      });
    }

    try {
      // Connexion via email
      const user = await UserModel.findOne({ where: { email } });

      if (!user) {
        return res.status(401).json({
          message: "Utilisateur non trouvé",
          data: null
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({
          message: "Mot de passe incorrect",
          data: null
        });
      }

      const accessToken = jwt.sign(
        { id: user.id, email: user.email },
        privateKey,
        { algorithm: 'RS256', expiresIn: '30m' }
      );

      const refreshToken = jwt.sign(
        { id: user.id, email: user.email },
        privateKey,
        { algorithm: 'RS256', expiresIn: '7d' }
      );

      const decoded = jwt.decode(refreshToken);
      user.refreshToken = refreshToken;
      user.refreshTokenExpiry = new Date(decoded.exp * 1000);
      await user.save();

      return res.json({
        message: "Authentification réussie",
        data: {
          userId: user.id,
          accessToken,
          refreshToken
        }
      });

    } catch (error) {
      console.error(" Erreur dans /api/login :", error);
      const message = "Erreur lors de l'authentification";
      return handleError(res, error, message);
    }
  });
};
