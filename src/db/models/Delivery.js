'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Delivery extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Delivery.init({
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    address: DataTypes.STRING,
    city: DataTypes.STRING,
    zip: DataTypes.STRING,
    countryISO: DataTypes.STRING,
    shippingCompany: DataTypes.STRING,
    shippingMethod: DataTypes.STRING,
    streetId: DataTypes.INTEGER,
    status: DataTypes.STRING,
    resultId: DataTypes.BIGINT,
    barcode: DataTypes.STRING,
    barcodeText: DataTypes.STRING,
    deliveryType: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Delivery',
  });
  return Delivery;
};