module.exports = {
   apps: [
      {
         name: 'xstro-md',
         script: './index.js',
         instances: 1,
         exec_mode: 'cluster',
         autorestart: true,
         watch: false,
         max_memory_restart: '450M',
         port: 8000,
      },
   ],
};
