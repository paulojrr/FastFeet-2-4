import * as Yup from 'yup';
import Deliverymans from '../models/Deliverymans';

class DeliverymanController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      avatar_id: Yup.string(),
      email: Yup.string().required(),
    });

    const { email } = req.body;

    const isEmail = await Deliverymans.findOne({ where: { email } });

    if (isEmail) {
      res.status(401).json({ error: 'Email already used' });
    }

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fail' });
    }

    const deliverymans = await Deliverymans.create(req.body);

    return res.json({ deliverymans });
  }
}

export default new DeliverymanController();
