import * as Yup from 'yup';
import Deliveries from '../models/Deliveries';
import Recipients from '../models/Recipients';
import Deliverymans from '../models/Deliverymans';

import Mail from '../../lib/Mail';

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

    await Mail.sendMail({
      to: `${existsDeliveryman.name} <${existsDeliveryman.email}>`,
      subject: 'Nova encomenda cadastrada',
      text: `O produto ${product} está disponível para retirada. \n
A retira só pode ser feita entre às 08:00 e 18:00h.\n
att,\n
Equipe FastFeet.`,
    });
    return res.status(200).json({ deliveries });
  }

  async index(req, res) {
    const deliveries = await Deliveries.findAll();

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

    return res.json(existsDelivery);
  }

  async delete(req, res) {
    const { id } = req.params;

    const existsDelivery = await Deliveries.findByPk(id);

    // Verifica se a encomenda existe
    if (!existsDelivery) {
      return res.status(401).json({ error: 'Delivery not found' });
    }

    await existsDelivery.destroy();

    return res.status(200).json(existsDelivery);
  }
}

export default new DeliverysController();
