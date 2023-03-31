module.exports = {
  apps : [{
    name: 'TMS Backend Restful API',
    script: 'dist/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '2G',
  }],

};
