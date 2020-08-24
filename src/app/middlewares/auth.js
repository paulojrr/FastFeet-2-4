import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import authConfig from '../../config/authConfig';

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Verifica se o token foi passado na requisição
  if (!authHeader) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  const [, token] = authHeader.split(' ');

  // Verifica se o token é valido
  try {
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);

    req.recipientId = decoded.id;

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalid' });
  }
};
