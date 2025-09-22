// models/favorite.model.js
module.exports = (sequelize, DataTypes) => {
  const Favorite = sequelize.define('Favorite', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    monumentId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'favorites'
  });

  Favorite.associate = (models) => {
    Favorite.belongsTo(models.User, { foreignKey: 'userId' });
    Favorite.belongsTo(models.Monument, { foreignKey: 'monumentId' });
  };

  return Favorite;
};
