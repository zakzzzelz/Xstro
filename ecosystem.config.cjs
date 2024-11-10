module.exports = {
	apps: [
			{
					name: 'xstro-md',
					script: './index.js',
					instances: 1,
					exec_mode: 'cluster',
					env: {
							NODE_ENV: 'development',
							PORT: 8000,
					},
					env_production: {
							NODE_ENV: 'production',
							PORT: 8000,
					},
					output: './out.log',
					error: './error.log',
					merge_logs: true,
			},
	],
};
