const config = require('./config.js');
const os = require('os');

class Metrics {
  constructor() {
    this.totalRequests = 0;
    this.totalGetRequests = 0;
    this.totalPostRequests = 0;
    this.totalDeleteRequests = 0;
    this.totalPutRequests = 0;

    this.totLatencyService = 0;
    this.totLatencyFactory = 0;

    this.totLatencyCountService = 0;
    this.totLatencyCountFactory = 0;
    
    this.activeUsers = 0;

    this.authenticationAttempts = 0;
    this.authenticationAttemptsSuccessful = 0;
    this.authenticationAttemptsFailed = 0;

    this.pizzasSold = 0;
    this.pizzaRevenue = 0;
    this.pizzaFailures = 0;

    // This will periodically sent metrics to Grafana
    const timer = setInterval(() => {
      this.sendMetricToGrafana(this.constructMetric('request', { method: 'all' }, 'total', this.totalRequests));
      this.sendMetricToGrafana(this.constructMetric('request', { method: 'get' }, 'total', this.totalGetRequests));
      this.sendMetricToGrafana(this.constructMetric('request', { method: 'post' }, 'total', this.totalPostRequests));
      this.sendMetricToGrafana(this.constructMetric('request', { method: 'put' }, 'total', this.totalPutRequests));
      this.sendMetricToGrafana(this.constructMetric('request', { method: 'delete' }, 'total', this.totalDeleteRequests));

      this.sendMetricToGrafana(this.constructMetric('performance', { type: 'memory' }, 'percentage', this.getMemoryUsagePercentage()));
      this.sendMetricToGrafana(this.constructMetric('performance', { type: 'cpu_usage' }, 'percentage', this.getCpuUsagePercentage()));

      this.sendMetricToGrafana(this.constructMetric('authentication', { status: 'all'}, 'total', this.authenticationAttempts));
      this.sendMetricToGrafana(this.constructMetric('authentication', { status: 'success'}, 'total', this.authenticationAttemptsSuccessful));
      this.sendMetricToGrafana(this.constructMetric('authentication', { status: 'fail'}, 'total', this.authenticationAttemptsFailed));

      this.sendMetricToGrafana(this.constructMetric('active_users', {}, 'total', this.activeUsers));
      
      this.sendMetricToGrafana(this.constructMetric('pizzas', { status: 'success'}, 'total', this.pizzasSold));
      this.sendMetricToGrafana(this.constructMetric('pizzas', { status: 'fail'}, 'total', this.pizzaFailures));

      this.sendMetricToGrafana(this.constructMetric('revenue', {}, 'total', this.pizzaRevenue));
      
      const latency = this.calculateAverageLatency();
      this.sendMetricToGrafana(this.constructMetric('latency', { type: 'jwt-factory'}, 'total', latency.factory));
      this.sendMetricToGrafana(this.constructMetric('latency', { type: 'jwt-pizza-service'}, 'total', latency.service));
    }, 10000);
    timer.unref();
  }

  incrementActiveUsers() {
    this.activeUsers++;
  }

  decrementActiveUsers() {
    this.activeUsers--;
  }

  incrementAuthenticationAttempt(status) {
    this.authenticationAttempts++;
    if (status === 'fail') this.authenticationAttemptsFailed++;
    else if (status === 'success') this.authenticationAttemptsSuccessful++;
  }

  incrementLatency(type, latency) {
    if (type === 'service') {
      this.totLatencyCountService++;
      this.totLatencyService += latency;
    }
    else if (type === 'factory') {
      this.totLatencyCountFactory++;
      this.totLatencyFactory += latency;
    }
  }

  calculateAverageLatency() {
    const ret = {
      service: this.totLatencyService / this.totLatencyCountService / 1000,
      factory: this.totLatencyFactory / this.totLatencyCountFactory / 1000
    };
    
    this.totLatencyService = 0;
    this.totLatencyCountFactory = 0;
    this.totLatencyCountService = 0;
    this.totLatencyFactory = 0;

    return ret;
  }

  getMetrics = (req, res, next) => {
    this.incrementRequests(req.method);

    const start = Date.now();
    res.on('finish', () => {
      const latency = Date.now() - start;
      this.incrementLatency('service', latency);
    });

    next();
  }

  incrementRequests(type) {
    if (type === 'GET') this.totalGetRequests++;
    else if (type === 'POST') this.totalPostRequests++;
    else if (type === 'DELETE') this.totalDeleteRequests++;
    else if (type === 'PUT') this.totalPutRequests++;
    this.totalRequests++;
  }

  calculatePizzaStats(order, status) {
    let numPizzas = order.items.length;
    let totRevenue = order.items.reduce((acc, item) => acc + item.price, 0);
    if (status === 'fail') {
      this.incrementPizzaFailure(numPizzas);
    }
    else if (status === 'success') {
      this.incrementPizzaSold(numPizzas);
      this.incrementPizzaRevenue(totRevenue);
    }
  }

  incrementPizzaSold(num) {
    this.pizzasSold += num;
  }

  incrementPizzaFailure(num) {
    this.pizzaFailures += num;
  }

  incrementPizzaRevenue(rev) {
    this.pizzaRevenue += rev;
  }

  constructMetric(metricPrefix, keyValues, metricName, metricValue) {
    return `${metricPrefix},source=${config.metrics.source}` + 
           `${Object.entries(keyValues).map(([key, value]) => `,${key}=${value}`).join('')} ` +
           `${metricName}=${metricValue}`
  }

  sendMetricToGrafana(metric) {
    fetch(`${config.metrics.url}`, {
      method: 'post',
      body: metric,
      headers: { Authorization: `Bearer ${config.metrics.userId}:${config.metrics.apiKey}` },
    })
      .then((response) => {
        if (!response.ok) {
          console.error('Failed to push metrics data to Grafana');
        } else {
          //console.log(`Pushed ${metric}`);
        }
      })
      .catch((error) => {
        console.error('Error pushing metrics:', error);
      });
  }

  getCpuUsagePercentage() {
    const cpuUsage = os.loadavg()[0] / os.cpus().length;
    return cpuUsage.toFixed(2) * 100;
  }
  
  getMemoryUsagePercentage() {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsage = (usedMemory / totalMemory) * 100;
    return memoryUsage.toFixed(2);
  }
}

const metrics = new Metrics();
module.exports = metrics;