import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class NewDeliveryMail {
  get key() {
    return 'NewDeliveryMail';
  }

  // Função para envio de emails de cadastro de entrega
  async handle({ data }) {
    const { existsDeliveryman, existsRecipient, deliveries, date } = data;

    await Mail.sendMail({
      to: `${existsDeliveryman.name} <${existsDeliveryman.email}>`,
      subject: 'Nova entrega cadastrada',
      template: 'newDelivery',
      context: {
        deliveryman: existsDeliveryman.name,
        recipient: existsRecipient.name,
        product: deliveries.product,
        state: existsRecipient.state,
        city: existsRecipient.city,
        street: existsRecipient.street,
        number: existsRecipient.number,
        cep: existsRecipient.cep,
        complement: existsRecipient.complement,
        date: format(parseISO(date), "'dia' dd 'de', MMMM, 'às' H:mm'h'", {
          locale: pt,
        }),
      },
    });
  }
}

export default new NewDeliveryMail();
