import * as Yup from 'yup';
import Deliverymans from '../models/Deliverymans';

class DeliverymanController {
  async store(req, res) {
    // Esquema de validação de input
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      avatar_id: Yup.string(),
      email: Yup.string().required(),
    });

    const { email } = req.body;

    const isEmail = await Deliverymans.findOne({ where: { email } });

    // Verifica se o email existe
    if (isEmail) {
      res.status(401).json({ error: 'Email already used' });
    }

    // Verifica se inputs passaram na validação do esquema
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fail' });
    }

    const deliverymans = await Deliverymans.create(req.body);

    return res.json({ deliverymans });
  }

  async index(req, res) {
    const deliverymans = await Deliverymans.findAll();

    return res.json({ deliverymans });
  }

  async update(req, res) {
    const { id } = req.params;

    let deliverymans = await Deliverymans.findByPk(id);

    // Verificar se o entregador existe
    if (!deliverymans) {
      return res.status(400).json({ error: 'Deliveryman not found' });
    }

    // Esquema de validação de inputs
    const schema = Yup.object().shape({
      name: Yup.string(),
      avatar_id: Yup.number(),
      email: Yup.string(),
    });

    // Verifica se inputs passaram na validação do esquema
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fail' });
    }

    // Caso exista um input de email, verificar se o email já existe
    if (req.body.email) {
      const { email } = req.body;

      const isEmail = await Deliverymans.findOne({ where: { email } });

      if (isEmail) {
        res.status(401).json({ error: 'Email already used' });
      }
    }

    deliverymans = await deliverymans.update(req.body);

    return res.status(200).json({ deliverymans });
  }

  async delete(req, res) {
    const { id } = req.params;

    const deliverymans = await Deliverymans.findByPk(id);

    // Verifica se o entregar existe
    if (!deliverymans) {
      return res.status(400).json({ error: 'Deliveryman not found' });
    }

    await Deliverymans.destroy({ where: { id } });

    return res.status(200).json({ deliverymans });
  }
}

export default new DeliverymanController();
