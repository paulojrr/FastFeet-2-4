import Sequelize from 'sequelize';
import {
  parseISO,
  setHours,
  setMinutes,
  setSeconds,
  isBefore,
  isAfter,
  startOfDay,
  endOfDay,
  format,
} from 'date-fns';
import * as Yup from 'yup';

import Deliveries from '../models/Deliveries';
import Deliverymans from '../models/Deliverymans';
import Recipient from '../models/Recipients';

const { Op } = Sequelize;

class UserDeliverymanController {
  async index(req, res) {
    const { id } = req.params;

    const existsDeliveryman = await Deliverymans.findByPk(id);

    // Verifica se o entregador existe
    if (!existsDeliveryman) {
      return res.status(400).json({ error: 'Deliveryman not found' });
    }

    const { page = 1 } = req.query;

    const deliveries = await Deliveries.findAll({
      where: {
        end_date: null,
        canceled_at: null,
      },
      order: ['id'],
      attributes: ['id', 'product', 'created_at', 'start_date', 'end_date'],
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'name',
            'street',
            'cep',
            'number',
            'complement',
            'state',
            'city',
          ],
        },
      ],
      limit: 20,
      offset: (page - 1) * 20,
    });

    return res.status(200).json(deliveries);
  }

  async delivered(req, res) {
    const { id } = req.params;

    const existsDeliveryman = await Deliverymans.findByPk(id);

    // Verifica se o entregador existe
    if (!existsDeliveryman) {
      return res.status(400).json({ error: 'Deliveryman not found' });
    }

    const { page = 1 } = req.query;

    const delivered = await Deliveries.findAll({
      where: {
        deliveryman_id: id,
        end_date: {
          [Op.ne]: null,
        },
      },
      order: ['id'],
      attributes: ['id', 'product', 'created_at', 'start_date', 'end_date'],
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'name',
            'street',
            'cep',
            'number',
            'complement',
            'state',
            'city',
          ],
        },
      ],
      limit: 20,
      offset: (page - 1) * 20,
    });

    return res.status(200).json(delivered);
  }

  async update(req, res) {
    // Esquema de validação de inputs
    const schema = Yup.object().shape({
      id: Yup.number().required(),
      start_date: Yup.date(),
      end_date: Yup.date(),
      signature_id: Yup.number().when('end_date', (end_date, field) =>
        end_date ? field.required() : field
      ),
    });

    // Verifica se inputs passaram na validação do esquema
    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ error: 'Validation fails' });
    }

    const { deliveryman_id } = req.params;

    const existsDeliveryman = await Deliverymans.findOne({
      where: { id: deliveryman_id },
    });

    // Verifica se entregador existe
    if (!existsDeliveryman) {
      return res.status(400).json({ error: 'Deliveryman not found' });
    }

    const { id } = req.body;

    const existsDelivery = await Deliveries.findByPk(id);

    // Verifica se encomenda existe
    if (!existsDelivery) {
      return res.status(400).json({ error: 'Delivery not found' });
    }

    const belongToDeliveryman = await Deliveries.findOne({
      where: {
        [Op.and]: [{ id }, { deliveryman_id }],
      },
    });

    // Verifica se encomenda pertence ao entregador
    if (!belongToDeliveryman) {
      return res
        .status(400)
        .json({ error: 'Delivery does not belong to deliveryman' });
    }

    // Verifica se coleta está dentro do horário permitido
    if (req.body.start_date) {
      const start_time = parseISO(req.body.start_date).getHours();

      if (start_time < 8 || start_time > 18) {
        return res.status(400).json({
          erro: 'The access is only permited between 08:00 and 18:00',
        });
      }

      const start_date = parseISO(req.body.start_date);

      if (isBefore(start_date, new Date())) {
        return res.status(400).json({ error: 'Past dates are not permited ' });
      }
    }

    // Verifica se entrega está dentro do horário permitido
    if (req.body.end_date) {
      const end_time = parseISO(req.body.end_date).getHours();

      if (end_time < 8 || end_time > 18) {
        return res.status(400).json({
          erro: 'The access is only permited between 08:00 and 18:00',
        });
      }

      const end_date = parseISO(req.body.end_date);

      if (isBefore(end_date, existsDelivery.start_date)) {
        return res.status(400).json({ error: 'Past dates are not permited ' });
      }
    }

    // Verifica se entregador já realizou 5 coletas no mesmo dia

    const today = new Date();

    const deliveriesDay = await Deliveries.findAll({
      where: {
        deliveryman_id,
        start_date: {
          [Op.between]: [startOfDay(today), endOfDay(today)],
        },
      },
    });

    if (deliveriesDay.length >= 5) {
      return res
        .status(400)
        .json({ error: 'You can pickup at most 5 deliveries per day' });
    }

    const data = await existsDelivery.update(req.body);

    return res.json(data);
  }
}

export default new UserDeliverymanController();
