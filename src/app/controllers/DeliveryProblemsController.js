import * as Yup from 'yup';

import DeliveryProblems from '../models/DeliveryProblems';
import Deliveries from '../models/Deliveries';
import Deliveryman from '../models/Deliverymans';
import Recipient from '../models/Recipients';

import CancellationMail from '../jobs/CancellationMail';
import Queue from '../../lib/Queue';

class DeliveryProblemsController {
  async index(req, res) {
    const { page = 1 } = req.query;

    // Busca todos os problemas registrados
    const problems = await DeliveryProblems.findAll({
      order: ['id'],
      attributes: ['id', 'delivery_id', 'description'],
      // Incremente os dados da entrega na listagem
      include: [
        {
          model: Deliveries,
          as: 'delivery',
          attributes: [
            'recipient_id',
            'deliveryman_id',
            'product',
            'start_date',
          ],
        },
      ],
      // Limita a 20 registros por página
      limit: 20,
      offset: (page - 1) * 20,
    });

    res.status(200).json(problems);
  }

  async store(req, res) {
    // Esquema de validação de inputs
    const schema = Yup.object().shape({
      description: Yup.string().required(),
      deliveryman_id: Yup.number().required(),
    });

    // Verifica se inputs passam no esquema de validação
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { delivery_id } = req.params;
    const { deliveryman_id, description } = req.body;

    // Busca uma encomenda que tenha um determinado entregador
    const belongToDeliveryMan = await Deliveries.findOne({
      where: { id: delivery_id, deliveryman_id },
    });

    // Valida se encomenda pertence ao entregador
    if (!belongToDeliveryMan) {
      return res
        .status(400)
        .json({ error: 'Delivery does not belong to Deliveryman' });
    }

    // Registra problema
    const problems = await DeliveryProblems.create({
      delivery_id,
      description,
    });

    return res.status(200).json(problems);
  }

  async list(req, res) {
    const { page = 1 } = req.query;
    const { delivery_id } = req.params;

    // Busca por todas as encomendas de um determinado entregador
    const problems = await DeliveryProblems.findAll({
      where: {
        delivery_id,
      },
      order: ['id'],
      attributes: ['delivery_id', 'description'],
      // Incrementa os dados da entrega na listagem
      include: [
        {
          model: Deliveries,
          as: 'delivery',
          attributes: [
            'recipient_id',
            'deliveryman_id',
            'product',
            'start_date',
          ],
        },
      ],
      // Limita a 20 registros por página
      limit: 20,
      offset: (page - 1) * 20,
    });

    return res.status(200).json(problems);
  }

  async cancel(req, res) {
    const { id } = req.params;

    // Busca um problema pelo id
    const problem = await DeliveryProblems.findOne({ where: { id } });

    // Valida se problema existe
    if (!problem) {
      return res.status(400).json({ error: 'Problem not found' });
    }

    // Pega id da encomenda de dentro problema registrado
    const { delivery_id } = problem;

    // Busca a encomenda
    let delivery = await Deliveries.findOne({
      where: { id: delivery_id },
      // Incremente os dados do destinatário na listagem
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'name',
            'state',
            'city',
            'street',
            'number',
            'cep',
            'complement',
          ],
        },
      ],
    });

    // Registra o cancelamento da encomenda
    delivery = await delivery.update(
      { canceled_at: new Date() },
      {
        where: {
          canceled_at: null,
        },
      }
    );

    // Pega o id do entregador de dentro da encomenda
    const { deliveryman_id } = delivery;

    // Busca o entregador
    const deliveryman = await Deliveryman.findByPk(deliveryman_id);

    // Adiciona job de envio de email de cancelamento na fila,
    // passando dados para o envio do email
    await Queue.add(CancellationMail.key, {
      delivery,
      deliveryman,
    });

    return res.status(200).json({ delivery });
  }
}

export default new DeliveryProblemsController();
