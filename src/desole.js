const uuidv4 = require('./helpers/uuidv4');

function Desole(config) {
  'use strict';

  // Set default tags
  this.url = config.url;
  this.tags = config.tags || {};
  this.ignore = config.ignore || [];
  this.modules = config.modules || ['onerror', 'console', 'unhandledrejection'];
  this.app = {
    name: (config.app && config.app.name) || (global && global.location && global.location.hostname),
    version: (config.app && config.app.version) || false,
    stage: (config.app && config.app.stage) || false
  };

  if (!config.manualInit) {
    this.attach();
  }
}

Desole.prototype.attach = function () {
  'use strict';

  var self = this;
  if (self.modules.indexOf('onerror') > -1) {
    self._originalOnError = global && global.onerror;
    global.onerror = function (message, url, lineNo, columnNo, err) {
      self.track({
        severity: 'error',
        stack: err.stack || String(err),
        type: err.name,
        message: message || String(err)
      });

      if (self._originalOnError) {
        self._originalOnError(global, [message, url, lineNo, columnNo, err]);
      }
    };
  }

  if (self.modules.indexOf('console') > -1) {
    self._originalConsoleError = console && console.error;

    console.error = function () {
      var args = Array.prototype.slice.call(arguments);

      self.track({
        severity: 'info',
        stack: args.join(', '),
        type: 'ConsoleError',
        message: args.join(', ')
      });

      self._originalConsoleError.apply(this, arguments);
    };
  }

  if (self.modules.indexOf('unhandledrejection') > -1) {
    self._originalUnhandledRejection = global.onunhandledrejection;

    global.onunhandledrejection = function (err) {
      self.track({
        severity: 'warning',
        stack: '',
        type: (err.type || 'UnhandledPromiseRejection'),
        message: err.reason
      });

      if (self._originalUnhandledRejection) {
        self._originalUnhandledRejection.apply(this, arguments);
      }
    };
  }
};

Desole.prototype.dettach = function () {
  'use strict';

  if (this.modules.indexOf('onerror') > -1) {
    global.onerror = this._originalOnError;
  }

  if (this.modules.indexOf('console') > -1) {
    console.error = this._originalConsoleError;
  }

  if (this.modules.indexOf('unhandledrejection') > -1) {
    global.onunhandledrejection = this._originalUnhandledRejection;
  }
};

Desole.prototype.track = function (clientOptions) {
  'use strict';

  var options = {
    severity: clientOptions.severity,
    stack: clientOptions.stack,
    type: clientOptions.type,
    message: clientOptions.message,
    timestamp: clientOptions.timestamp || Date.now(),
    resource: clientOptions.resource || (global && global.location && global.location.href),
    app: {
      name: (clientOptions.app && clientOptions.app.name) || this.app.name,
      version: (clientOptions.app && clientOptions.app.version) || this.app.version,
      stage: (clientOptions.app && clientOptions.app.stage) || this.app.stage
    },
    endpoint: {
      id: (clientOptions.endpoint && clientOptions.endpoint.id) || uuidv4(),
      language: (clientOptions.endpoint && clientOptions.endpoint.language) || global.navigator && global.navigator.language,
      platform: (clientOptions.endpoint && clientOptions.endpoint.platform) || global.navigator && global.navigator.platform
    },
    tags: clientOptions.tags || this.tags
  };

  var http = new global.XMLHttpRequest();
  var url = this.url;
  http.open('POST', url, true);
  http.setRequestHeader('Content-type', 'application/json');

  http.send(JSON.stringify(options));
};

Desole.prototype.captureException = function (e) {
  'use strict';

  return this.track({
    severity: 'error',
    stack: e.stack,
    type: e.name,
    message: e.message
  });
};

module.exports = Desole;
