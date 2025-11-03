module.exports = {
  apps: [
    {
      name: "news-briefing-api",
      script: "/root/POOSD/POOSD-LargeProject_Team12/backend/dist/backend/src/index.js",
      cwd: "/root/POOSD/POOSD-LargeProject_Team12/backend",
      env: {
        NODE_PATH: "/root/POOSD/POOSD-LargeProject_Team12/backend/node_modules",
        NODE_ENV: "production",
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
    },
  ],
};

