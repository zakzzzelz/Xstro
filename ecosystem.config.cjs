module.exports = {
	apps: [
		{
			name: 'xstro-md',
			script: './server.js',
			log_date_format: false,
			timestamp: false,
			time: false,
			instances: 1,
			exec_mode: 'fork',
			watch: false,
			env: {
				NODE_ENV: 'development',
				PORT: 8000,
				PM2_TIME: false,
				PM2_PREFIX_MSG: false,
				PM2_LOG_DATE_FORMAT: false,
			},
			env_production: {
				NODE_ENV: 'production',
				PORT: 8000,
				PM2_TIME: false,
				PM2_PREFIX_MSG: false,
				PM2_LOG_DATE_FORMAT: false,
			},
			output: '/dev/stdout',
			error: '/dev/stderr',
			log_type: 'raw',
			merge_logs: true,
			log: false,
		},
	],
};
