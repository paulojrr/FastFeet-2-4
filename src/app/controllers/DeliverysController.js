import * as Yup from 'yup';
import Deliverys from '../models/Deliverys';
import Recipients from '../models/Recipients';
import Deliverymans from '../models/Deliverymans';

class DeliverysController {
  async store(req, res) {
    // Esquema de validação de inputs
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fail' });
    }

    const { recipient_id, deliveryman_id } = req.body;

    const existsRecipient = await Recipients.findByPk(recipient_id);

    if (!existsRecipient) {
      return res.status(400).json({ error: 'Recipient does not exists' });
    }

    const existsDeliveryman = await Deliverymans.findByPk(deliveryman_id);

    if (!existsDeliveryman) {
      return res.status(400).json({ error: 'Deliveryman does not exists' });
    }

    const delivery = await Deliverys.create(req.body);

    return res.status(200).json({ delivery });
  }
}

export default new DeliverysController();
