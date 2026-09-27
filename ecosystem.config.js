module.exports = {
  apps: [{
    name: "server",
    script: "./server.js",
    watch: false, 
    ignore_watch: ["node_modules", "history", "history/*", "chatbot"],
    env: {
      NODE_ENV: "development",
    }
  }]
};
