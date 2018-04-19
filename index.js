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
      this.modules = config.modules || ['onerror', 'http', 'console', 'unhandledrejection'];
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

      if (this.modules.indexOf('http') > -1) {
        self._originalHttpSend = window.XMLHttpRequest.prototype.send;
        window.XMLHttpRequest.prototype.send = function () {
          var xhrOnerror = this.onerror;

          this.onerror = function (err) {
            self.track({
              severity: 'error',
              stack: err.stack,
              type: err.name || err.status,
              message: err.message || err.responseURL,
              resource: err.responseURL
            });
            if (xhrOnerror) {
              return xhrOnerror.apply(this, arguments);
            }
          };
          var xhrOnabort = this.onabort;
          this.onabort = function (err) {
            self.track({
              severity: 'warn',
              stack: err.stack,
              type: err.name || err.status,
              message: err.message || err.responseURL,
              resource: err.responseURL
            });
            if (xhrOnabort) {
              return xhrOnabort.apply(this, arguments);
            }
          };
          var xhrOnload = this.onload;
          this.onload = function onload(request) {
            if (request.status && request.status >= 400) {
              self.track({
                severity: 'info',
                stack: '',
                type: 'HTTPResponse',
                message: request.status + ' ' + request.statusText,
                resource: request.responseURL
              });
            }
            if (xhrOnload) {
              return xhrOnload.apply(this, arguments);
            }
          };

          if (self._originalHttpSend) {
            self._originalHttpSend.apply(this, arguments);
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
            type: 'UnhandledPromiseRejection',
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

      if (this.modules.indexOf('http') > -1) {
        window.XMLHttpRequest.prototype.send = this._originalHttpSend;
      }

      if (this.modules.indexOf('console') > -1) {
        console.error = this._originalConsoleError;
      }

      if (this.modules.indexOf('unhandledrejection') > -1) {
        window.onunhandledrejection = this._originalUnhandledRejection;
      }
    };

    Desole.prototype.track = function (clientOptions) { // string, exception
      // Do validation

      var options = {
        severity: clientOptions.severity, // mandatory
        stack: clientOptions.stack, // mandatory
        type: clientOptions.type, // mandatory
        message: clientOptions.message, // mandatory
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

      // http.onreadystatechange = function () {
      //   if (http.readyState === 4 && http.status === 200) {
      //     // Do we need to track errors for this?
      //   }
      // };

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
        var global = this;
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
