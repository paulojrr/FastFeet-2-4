import * as Yup from 'yup';

import Recipients from '../models/Recipients';

class RecipientsController {
  async store(req, res) {
    // Esquema de validação de inputs
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.number().required(),
      state: Yup.string().required(),
      city: Yup.string().required(),
      cep: Yup.string().required(),
      complement: Yup.string(),
    });

    // Verifica se esquema passou na validação
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fail' });
    }

    await Recipients.create(req.body);

    return res.json(req.body);
  }

  async update(req, res) {
    const { id } = req.params;

    let recipient = await Recipients.findByPk(id);

    // Verifica se o destinatário existe
    if (!recipient) {
      return res.status(401).json({ error: 'Recipient not found' });
    }

    // Esquema de validação de inputs
    const schema = Yup.object().shape({
      name: Yup.string(),
      street: Yup.string(),
      number: Yup.number(),
      state: Yup.string(),
      city: Yup.string(),
      cep: Yup.string(),
      complement: Yup.string(),
    });

    // Verifica se esquema passou na validação
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }

    recipient = await recipient.update(req.body);

    return res.json(req.body);
  }
}

export default new RecipientsController();
