module.exports = {
	apps: [
		{
			name: 'xstro-md',
			script: './server.js',
			instances: 1,
			exec_mode: 'cluster',
			watch: false,
			env: {
				NODE_ENV: 'development',
				PORT: 8000,
			},
			env_production: {
				NODE_ENV: 'production',
				PORT: 8000,
			},
		},
	],
};
