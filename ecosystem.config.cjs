module.exports = {
    apps: [
        {
            name: 'loadforge-api',
            script: './server.js',
            cwd: './backend',
            instances: 'max',
            exec_mode: 'cluster',
            watch: false,
            max_memory_restart: '512M',
            env: {
                NODE_ENV: 'production',
                PORT: 5000,
            },
            env_development: {
                NODE_ENV: 'development',
                PORT: 5000,
            },
            error_file: './logs/pm2-error.log',
            out_file: './logs/pm2-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        },
    ],
};
