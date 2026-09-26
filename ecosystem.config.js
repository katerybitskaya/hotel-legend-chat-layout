module.exports = {
  apps: [{
    name: "serwis",
    script: "./serwis.js",
    watch: false, // без авто-перезапуска при изменении файлов (после правок: pm2 restart serwis)
    ignore_watch: ["node_modules", "historia", "historia/*", "chatbot"],
    env: {
      NODE_ENV: "development",
    }
  }]
};
