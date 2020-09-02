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

    // Verifica se inputs passaram na validação do esquema
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fail' });
    }

    const { email, avatar_id } = req.body;

    const isEmail = await Deliverymans.findOne({ where: { email } });

    // Verifica se o email existe
    if (isEmail) {
      res.status(401).json({ error: 'Email already used' });
    }

    // Verifica se o avatar_id existe
    if (avatar_id) {
      const isAvatar = await Deliverymans.findOne({ where: { avatar_id } });

      if (isAvatar) {
        return res.status(401).json({ error: 'Avatar alredy used' });
      }
    }

    await Deliverymans.create(req.body);

    return res.json({ email, avatar_id });
  }

  async index(req, res) {
    const { page = 1 } = req.query;

    const deliverymans = await Deliverymans.findAll({
      attributes: ['id', 'name', 'email', 'avatar_id'],
      order: ['id'],
      limit: 20,
      offset: (page - 1) * 20,
    });

    return res.json(deliverymans);
  }

  async update(req, res) {
    const { id } = req.params;

    const { name, email, avatar_id } = req.body;

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
    if (email) {
      const isEmail = await Deliverymans.findOne({ where: { email } });

      if (isEmail) {
        return res.status(401).json({ error: 'Email already used' });
      }
    }

    // Verifica se o avatar_id já existe
    if (avatar_id) {
      const isAvatar = await Deliverymans.findOne({ where: { avatar_id } });

      if (isAvatar) {
        return res.status(401).json({ error: 'Avatar alredy used' });
      }
    }

    deliverymans = await deliverymans.update(req.body);

    return res.status(200).json({ name, email, avatar_id });
  }

  async delete(req, res) {
    const { id } = req.params;

    const deliverymans = await Deliverymans.findByPk(id);

    // Verifica se o entregar existe
    if (!deliverymans) {
      return res.status(400).json({ error: 'Deliveryman not found' });
    }

    await Deliverymans.destroy({ where: { id } });

    return res.status(200).json();
  }
}

export default new DeliverymanController();
