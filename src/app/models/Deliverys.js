import Sequelize, { Model } from 'sequelize';

class Delivery extends Model {
  static init(sequelize) {
    super.init(
      {
        recipient_id: Sequelize.INTEGER,
        deliveryman_id: Sequelize.INTEGER,
        signature_id: Sequelize.INTEGER,
        product: Sequelize.STRING,
        canceled_at: Sequelize.DATE,
        start_date: Sequelize.DATE,
        end_date: Sequelize.DATE,
      },
      { sequelize }
    );
  }

  // static associate(models) {
  //   this.belongsTo(models.Recipient, {
  //     targetKey: 'id',
  //     foreignKey: 'recipient_id',
  //     as: 'recipient',
  //   });
  // this.belongsTo(models.Deliveryman, {
  //   targetKey: 'id',
  //   foreignKey: 'deliveryman_id',
  //   as: 'deliveryman',
  // });
}

export default Delivery;
