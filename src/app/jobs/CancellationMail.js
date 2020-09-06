import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class CancellationMail {
  get key() {
    return 'CancellationMail';
  }

  // Função para envio de emails de cancelamento
  async handle({ data }) {
    const { delivery, deliveryman } = data;
    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'Entrega cancelada',
      template: 'cancellation',
      context: {
        deliveryman: deliveryman.name,
        recipient: delivery.recipient.name,
        product: delivery.product,
        state: delivery.recipient.state,
        city: delivery.recipient.city,
        street: delivery.recipient.street,
        number: delivery.recipient.number,
        cep: delivery.recipient.cep,
        complement: delivery.recipient.complement,
        date: format(
          parseISO(delivery.canceled_at),
          "'dia' dd 'de', MMMM, 'às' H:mm'h'",
          {
            locale: pt,
          }
        ),
      },
    });
  }
}

export default new CancellationMail();
