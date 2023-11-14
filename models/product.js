'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Products extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.UsersData, {
        targetKey: 'id',
        foreignKey: 'userId',
      })
    }
  }
  Products.init(
    {
      productId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      userId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      productName: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      comment: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      status: {
        allowNull: false,
        defaultValue: 'FOR_SALE',
        type: DataTypes.STRING,
      },
      price: {
        allowNull: false,
        type: DataTypes.NUMBER,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'Products',
    }
  )
  return Products
}
