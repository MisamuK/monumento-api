const { Sequelize, DataTypes } = require('sequelize');
let monuments = require('./monuments-list');

const sequelize = new Sequelize(
    'monumento_db',
    'root',
    '',
    {
        host: 'localhost',
        port: 3306,
        dialect: 'mysql',
        logging: true
    }
);

sequelize
    .authenticate()
    .then(() => {
        console.log('La connexion à la base de données a été établie avec succès.');
    })
    .catch(err => {
        console.error('Impossible de se connecter à la BDD:', err);
    });

// --- Chargement des modèles
const MonumentModel = require('../models/monument')(sequelize, DataTypes);
const UserModel = require('../models/user')(sequelize, DataTypes);
const AnecdoteModel = require('../models/anecdote')(sequelize, DataTypes);
const FavoriteModel = require('../models/favorite')(sequelize, DataTypes);

// --- Associations

// Monuments → Anecdotes (One-to-Many)
MonumentModel.hasMany(AnecdoteModel, {
    foreignKey: 'monument_id',
    as: 'anecdotes'
});
AnecdoteModel.belongsTo(MonumentModel, {
    foreignKey: 'monument_id',
    as: 'monument'
});

// Favorites → relations avec User et Monument (Many-to-One)
FavoriteModel.belongsTo(UserModel, {
    foreignKey: 'userId'
});
FavoriteModel.belongsTo(MonumentModel, {
    foreignKey: 'monumentId'
});

// User ↔ Monument (Many-to-Many via Favorite)
UserModel.belongsToMany(MonumentModel, {
    through: FavoriteModel,
    as: 'favoriteMonuments',
    foreignKey: 'userId'
});
MonumentModel.belongsToMany(UserModel, {
    through: FavoriteModel,
    as: 'usersWhoFavorited',
    foreignKey: 'monumentId'
});

// --- Initialisation (création ou synchronisation des tables)
const initDb = async () => {
    return sequelize.sync()
        .then(() => {
            // Seed si besoin (désactivé ici)
            // monuments.forEach(async (monument) => {
            //     MonumentModel.create({
            //         title: monument.name,
            //         country: monument.country,
            //         city: monument.city,
            //         buildYear: monument.buildYear,
            //         picture: monument.picture,
            //         description: monument.description
            //     })
            // });

            console.log("Les modèles ont été synchronisés avec la base de données.");
        })
        .catch((error) => {
            console.error("Une erreur s'est produite lors de la synchronisation des modèles :", error);
        });
};

module.exports = {
    initDb,
    sequelize, 
    MonumentModel,
    UserModel,
    FavoriteModel,
    AnecdoteModel
};
