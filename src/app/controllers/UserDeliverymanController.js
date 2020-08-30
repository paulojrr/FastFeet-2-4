import Sequelize from 'sequelize';

import Deliveries from '../models/Deliveries';
import Deliverymans from '../models/Deliverymans';

const { Op } = Sequelize;

class UserDeliverymanController {
  async index(req, res) {
    const { id } = req.params;

    const existsDeliveryman = await Deliverymans.findByPk(id);

    // Verifica se o entregador existe
    if (!existsDeliveryman) {
      return res.status(400).json({ error: 'Deliveryman not found' });
    }

    const deliveries = await Deliveries.findAll({
      where: {
        end_date: null,
        canceled_at: null,
      },
    });

    return res.status(200).json({ deliveries });
  }

  async delivered(req, res) {
    const { id } = req.params;

    const existsDeliveryman = await Deliverymans.findByPk(id);

    // Verifica se o entregador existe
    if (!existsDeliveryman) {
      return res.status(400).json({ error: 'Deliveryman not found' });
    }

    const delivered = await Deliveries.findAll({
      where: {
        end_date: {
          [Op.not]: null,
        },
      },
    });

    return res.status(200).json({ delivered });
  }
}

export default new UserDeliverymanController();
