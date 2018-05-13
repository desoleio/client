(function (define, window) {
  'use strict';
  define('Desole', [], function () {

    function uuidv4() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }

    function Desole(config) {
      // Set default tags
      this.url = config.url;
      this.tags = config.tags || {};
      this.ignore = config.ignore || [];
      this.modules = config.modules || ['onerror', 'console', 'unhandledrejection'];
      this.app = {
        name: (config.app && config.app.name) || (window && window.location && window.location.hostname),
        version: (config.app && config.app.version) || false,
        stage: (config.app && config.app.stage) || false
      };

      if (!config.manualInit) {
        this.attach();
      }
    }

    Desole.prototype.attach = function () {
      var self = this;
      if (self.modules.indexOf('onerror') > -1) {
        self._originalOnError = window && window.onerror;
        window.onerror = function (message, url, lineNo, columnNo, err) {
          self.track({
            severity: 'error',
            stack: err.stack || String(err),
            type: err.name,
            message: message || String(err)
          });

          if (self._originalOnError) {
            self._originalOnError(window, [message, url, lineNo, columnNo, err]);
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
        self._originalUnhandledRejection = window.onunhandledrejection;

        window.onunhandledrejection = function (err) {
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
      if (this.modules.indexOf('onerror') > -1) {
        window.onerror = this._originalOnError;
      }

      if (this.modules.indexOf('console') > -1) {
        console.error = this._originalConsoleError;
      }

      if (this.modules.indexOf('unhandledrejection') > -1) {
        window.onunhandledrejection = this._originalUnhandledRejection;
      }
    };

    Desole.prototype.track = function (clientOptions) {
      // Do validation

      var options = {
        severity: clientOptions.severity,
        stack: clientOptions.stack,
        type: clientOptions.type,
        message: clientOptions.message,
        timestamp: clientOptions.timestamp || Date.now(),
        resource: clientOptions.resource || (window && window.location && window.location.href),
        app: {
          name: (clientOptions.app && clientOptions.app.name) || this.app.name,
          version: (clientOptions.app && clientOptions.app.version) || this.app.version,
          stage: (clientOptions.app && clientOptions.app.stage) || this.app.stage
        },
        endpoint: {
          id: (clientOptions.endpoint && clientOptions.endpoint.id) || uuidv4(),
          language: (clientOptions.endpoint && clientOptions.endpoint.language) || window.navigator && window.navigator.language,
          platform: (clientOptions.endpoint && clientOptions.endpoint.platform) || window.navigator && window.navigator.platform
        },
        tags: clientOptions.tags || this.tags
      };

      var http = new window.XMLHttpRequest();
      var url = this.url;
      http.open('POST', url, true);
      http.setRequestHeader('Content-type', 'application/json');

      http.send(JSON.stringify(options));
    };

    Desole.prototype.captureException = function (e) {
      return this.track({
        severity: 'error',
        stack: e.stack,
        type: e.name,
        message: e.message
      });
    };

    return Desole;
  });
}(
  // Wrapper to run code everywhere
  /* global define */
  (typeof define === 'function' && define.amd ? (
    // AMD module
    function (name, dependencies, factory) {
      'use strict';
      // Registering as an unnamed module, for more flexiblility and match with CommonJS
      define(dependencies, factory);
    }
  ) : (
    typeof require === 'function' && typeof module !== 'undefined' && module.exports ? (
      // CommonJS
      function (name, dependencies, factory) {
        'use strict';
        module.exports = factory.apply(this, dependencies.map(require));
      }
    ) : (
      // Browser (regular script tag)
      function (name, dependencies, factory) {
        'use strict';
        var i = 0;
        var global = window;
        var old = global[name];
        var mod, dependency;

        while (dependency = dependencies[i]) {
          dependencies[i++] = this[dependency];
        }

        global[name] = mod = factory.apply(global, dependencies);
        mod.noConflict = function () {
          global[name] = old;
          return mod;
        };
      }
    )
  )), this
));
