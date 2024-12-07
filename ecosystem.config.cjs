module.exports = {
	apps: [
		{
			name: 'xstro',
			script: './index.js',
			instances: 1,
			exec_mode: 'fork',
			autorestart: true,
			watch: false,
			max_memory_restart: '450M',
			port: 8000,
		},
	],
};
