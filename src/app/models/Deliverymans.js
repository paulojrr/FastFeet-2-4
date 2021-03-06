import Sequelize, { Model } from 'sequelize';

class Deliveryman extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
      },
      { sequelize }
    );

    return this;
  }

  // Cria associações com outros models
  static associate(models) {
    this.belongsTo(models.File, {
      targetKey: 'id',
      foreignKey: 'avatar_id',
      as: 'avatar',
    });
  }
}

export default Deliveryman;
