import jwt from 'jsonwebtoken';
import * as Yup from 'yup';

import authConfig from '../../config/authConfig';
import User from '../models/Users';

class SessionController {
  async store(req, res) {
    // Esquema de validação de inputs
    const schema = Yup.object().shape({
      email: Yup.string().email().required(),
      password: Yup.string().required(),
    });

    // Verifica se o esquema passou na validação
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    // Verifica se o usuário existe
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Verifica se a senha é valida
    if (!(await user.checkpassword(password))) {
      return res.status(401).json({ error: 'Password does not match' });
    }

    const { id, name } = user;

    // Cria o token de acesso
    return res.json({
      user: {
        id,
        name,
        email,
      },
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new SessionController();
