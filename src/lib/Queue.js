import Bee from 'bee-queue';

import CancellationMail from '../app/jobs/CancellationMail';
import NewDeliveryMail from '../app/jobs/NewDeliveryMail';

import redisConfig from '../config/redis';

// Carrega os jobs
const jobs = [CancellationMail, NewDeliveryMail];

class Queue {
  constructor() {
    // Cria uma fila
    this.queues = {};

    this.init();
  }

  // Inicia uma instância de Bee que se conecta com o Redis,
  // passando também o handle com a lógica do job
  init() {
    jobs.forEach(({ key, handle }) => {
      this.queues[key] = {
        bee: new Bee(key, {
          redis: redisConfig,
        }),
        handle,
      };
    });
  }

  // Adiciona o job na fila
  add(queue, job) {
    return this.queues[queue].bee.createJob(job).save();
  }

  // Processa os jobs que estão na fila
  processQueue() {
    jobs.forEach((job) => {
      const { bee, handle } = this.queues[job.key];

      bee.process(handle);
    });
  }
}

export default new Queue();
