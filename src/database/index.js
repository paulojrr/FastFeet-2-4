import Sequelize from 'sequelize';

import Users from '../app/models/Users';
import Recipients from '../app/models/Recipients';
import Files from '../app/models/Files';
import Deliverymans from '../app/models/Deliverymans';
import Deliveries from '../app/models/Deliveries';

import databaseConfig from '../config/database';

const models = [Users, Recipients, Files, Deliverymans, Deliveries];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    // Inicia os models
    models.forEach((model) => model.init(this.connection));

    // Caso o model tenha uma associação, ela é executada
    models.forEach((model) => {
      if (model.associate) model.associate(this.connection.models);
    });
  }
}

export default new Database();
