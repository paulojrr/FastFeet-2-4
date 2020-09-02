import Sequelize from 'sequelize';
import {
  parseISO,
  setSeconds,
  setMinutes,
  setHours,
  isBefore,
  isAfter,
  startOfDay,
  endOfDay,
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

    // Data da coleta
    const startDate = parseISO(req.body.start_date);

    // Data da entrega
    const endDate = parseISO(req.body.end_date);

    // Inicio do horário de trabalho
    const startWork = setSeconds(setMinutes(setHours(startDate, 8), 0), 0);

    // Fim do horário de trabalho
    const endWork = setSeconds(setMinutes(setHours(endDate, 18), 0), 0);

    // Verifica se a coleta está dentro do horário permitido
    if (isBefore(startDate, startWork) || isAfter(endDate, endWork)) {
      return res
        .status(400)
        .json({ erro: 'The access is only permited between 08:00 and 18:00' });
    }

    // Verifica se a data de coleta é válida
    if (isBefore(startDate, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permited ' });
    }

    // Verifica se a data de entrega é válida
    if (isBefore(endDate, startDate)) {
      return res.status(400).json({
        error: 'Conclusion date must be after start date',
      });
    }

    // Verifica se entregador já realizou 5 coletas no mesmo dia
    const deliveriesDay = await Deliveries.findAll({
      where: {
        id,
        start_date: {
          [Op.between]: [startOfDay(startDate), endOfDay(startDate)],
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
