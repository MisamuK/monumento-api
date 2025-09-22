'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('favorites', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', // ⚠️ Nom exact de la table User
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      monumentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Monuments', // ⚠️ Nom exact de la table Monument
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    // Ajoute une contrainte d’unicité pour éviter les doublons
    await queryInterface.addConstraint('favorites', {
      fields: ['userId', 'monumentId'],
      type: 'unique',
      name: 'unique_user_monument_favorite'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('favorites');
  }
};
