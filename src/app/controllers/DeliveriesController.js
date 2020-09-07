import * as Yup from 'yup';
import Deliveries from '../models/Deliveries';
import Recipients from '../models/Recipients';
import Deliverymans from '../models/Deliverymans';

import NewDeliveryMail from '../jobs/NewDeliveryMail';
import Queue from '../../lib/Queue';

class DeliverysController {
  async store(req, res) {
    // Esquema de validação de inputs
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    // Verifica se inputs passaram na verificação do esquema
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fail' });
    }

    const { recipient_id, deliveryman_id, product } = req.body;

    const existsRecipient = await Recipients.findByPk(recipient_id);

    // Verifica se existe Recipient
    if (!existsRecipient) {
      return res.status(400).json({ error: 'Recipient does not exists' });
    }

    const existsDeliveryman = await Deliverymans.findByPk(deliveryman_id);

    // Verifica se existe Deliveryman
    if (!existsDeliveryman) {
      return res.status(400).json({ error: 'Deliveryman does not exists' });
    }

    const deliveries = await Deliveries.create(req.body);
    const { id } = deliveries;

    // Adiciona job de envio de email de cancelamento na fila,
    // passando dados para o envio do email
    await Queue.add(NewDeliveryMail.key, {
      existsDeliveryman,
      existsRecipient,
      deliveries,
      date: new Date(),
    });

    return res.status(200).json({ id, deliveryman_id, recipient_id, product });
  }

  async index(req, res) {
    const { page = 1 } = req.query;

    // Lista entregas
    const deliveries = await Deliveries.findAll({
      order: ['id'],
      include: [
        {
          model: Recipients,
          as: 'recipient',
          attributes: [
            'id',
            'name',
            'state',
            'city',
            'street',
            'number',
            'complement',
            'cep',
          ],
        },
        {
          model: Deliverymans,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
        },
      ],
      limit: 20,
      offset: (page - 1) * 20,
    });

    res.status(200).json({ deliveries });
  }

  async update(req, res) {
    // Esquema de validação de inputs
    const schema = Yup.object().shape({
      recipient_id: Yup.number(),
      deliveryman_id: Yup.number(),
      product: Yup.string(),
    });

    const { id } = req.params;

    let existsDelivery = await Deliveries.findByPk(id);

    // Verifica se encomenda existe
    if (!existsDelivery) {
      return res.status(401).json({ error: 'Delivery not found' });
    }

    // Verifica se inputs passaram na validação do esquema
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fail' });
    }

    existsDelivery = await existsDelivery.update(req.body);

    return res.json(req.body);
  }

  async delete(req, res) {
    const { id } = req.params;

    const existsDelivery = await Deliveries.findByPk(id);

    // Verifica se a encomenda existe
    if (!existsDelivery) {
      return res.status(401).json({ error: 'Delivery not found' });
    }

    await existsDelivery.destroy();

    return res.status(200).json();
  }
}

export default new DeliverysController();
