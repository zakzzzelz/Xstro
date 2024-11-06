import { DATABASE } from '../../config.js';

const Antilink = DATABASE.define('AntilinkDB', {
  groupId: {
    type: DATABASE.Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
  },
  enabled: {
    type: DATABASE.Sequelize.BOOLEAN,
    defaultValue: false,
  },
  action: {
    type: DATABASE.Sequelize.ENUM('delete', 'warn', 'kick'),
    defaultValue: 'delete',
  },
  warnings: {
    type: DATABASE.Sequelize.JSON,
    defaultValue: {},
  },
});

export { Antilink };