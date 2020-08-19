import * as Yup from 'yup';

import Recipients from '../models/Recipients';

class RecipientsController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.number().required(),
      state: Yup.string().required(),
      city: Yup.string().required(),
      cep: Yup.string().required(),
      complement: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fail' });
    }

    const recipient = await Recipients.create(req.body);

    return res.json({ recipient });
  }

  async update(req, res) {
    const { id } = req.params;

    let recipient = await Recipients.findByPk(id);

    if (!recipient) {
      return res.status(401).json({ error: 'Recipient not found' });
    }

    const schema = Yup.object().shape({
      name: Yup.string(),
      street: Yup.string(),
      number: Yup.number(),
      state: Yup.string(),
      city: Yup.string(),
      cep: Yup.string(),
      complement: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }

    recipient = await recipient.update(req.body);

    return res.json({ recipient });
  }
}

export default new RecipientsController();
