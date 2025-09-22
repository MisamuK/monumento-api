const express = require('express');
const favicon = require('serve-favicon');
const morgan = require('morgan');
const http = require('http');
const path = require('path');

const db = require('./src/db/sequelize');
const setupSocketServer = require('./src/socket');
const auth = require('./src/auth/auth');

const app = express();
const server = http.createServer(app);

// Socket.io
setupSocketServer(server);

// Middlewares globaux
function nightBlocker(req, res, next) {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 7) {
    return res.status(503).json({ message: 'Le serveur est en cours de maintenance', data: null });
  }
  next();
}

app
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .use(nightBlocker)
  .use(favicon(path.join(__dirname, 'favicon.ico')))
  .use(morgan('dev'));

// Initialisation de la BDD
db.initDb();

// Documentation Swagger
require('./src/docs/swagger')(app);

// Routes PUBLIQUES (accessibles sans JWT)
require('./src/routes/login.route')(app);
require('./src/routes/register.route')(app);
require('./src/routes/refreshToken.route')(app);

// Middleware d'AUTHENTIFICATION JWT → après les routes publiques
app.use(auth);

// Routes protégées par le token
require('./src/routes/findAllMonuments.route')(app);
require('./src/routes/searchMonuments.route')(app);
require('./src/routes/findMonumentByPK.route')(app);
require('./src/routes/createMonument.route')(app);
require('./src/routes/updateMonument.route')(app);
require('./src/routes/deleteMonument.route')(app);

require('./src/routes/findAnecdotesByMonument.route')(app);
require('./src/routes/createAnecdotes.route')(app);
require('./src/routes/updateAnecdote.route')(app);
require('./src/routes/deleteAnecdote.route')(app);

// Favorites API (version router)
const favoriteRoutes = require('./src/routes/favorite.route');
app.use('/favorites', favoriteRoutes);

// Page racine
app.get('/', (req, res) => {
  res.send("Bienvenue sur l'API Monumento ! Utilisez les routes pour interagir avec les monuments.");
});

// Gestion des erreurs 404
app.use((req, res) => {
  const url = req.originalUrl;
  const method = req.method;
  const message = `La ressource demandée : "${method} ${url}" n'existe pas. Réessayez avec une autre URL.`;
  res.status(404).json({ message, data: null });
});

// Lancement du serveur
server.listen(3000, () => {
  console.log('Server & Socket.io running at http://localhost:3000');
});
