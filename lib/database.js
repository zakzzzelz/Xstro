import { Sequelize } from 'sequelize';

const DATABASE_URL = process.env.DATABASE_URL || './bot.db';

const DATABASE =
	DATABASE_URL === './bot.db'
		? new Sequelize({
				dialect: 'sqlite',
				storage: DATABASE_URL,
				logging: false,
		  })
		: new Sequelize(DATABASE_URL, {
				dialect: 'postgres',
				ssl: true,
				protocol: 'postgres',
				dialectOptions: {
					native: true,
					ssl: { require: true, rejectUnauthorized: false },
				},
				logging: false,
		  });

export default DATABASE;
