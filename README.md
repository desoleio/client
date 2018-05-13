# client

Add this block to the HEAD of your HTML document

```html
<script type=text/javascript src="path/to/desole.js"></script>
<script type=text/javascript>
  var desole = new Desole({
    url: 'http://your-desole-api-url', // API URL
    app: {
      name: 'Desole test',
      version: '1.0.0',
      stage: 'test'
    }
  })
</script>
```

## configuring modules

Supply the list of modules you'd like to activate. Currently supported modules are

* `onerror`: track uncaught exceptions
* `console`: track console error logging
* `unhandledrejection`: track unhandled promise rejections (where [supported by browsers](https://caniuse.com/#feat=unhandledrejection)).

```html
<script type=text/javascript src="path/to/desole.js"></script>
<script type=text/javascript>
var desole = new Desole({
    url: 'http://your-desole-api-url', // API URL
    app: {
      name: 'Desole test',
      version: '1.0.0',
      stage: 'test'
    },
    modules: ['onerror', 'console', 'unhandledrejection']
  })
</script>
```

## Track errors manually

Use `window.desole.captureException` to send an exception object or a promise rejection to the collector API.

```js
try {
		throw new Error('capturedException');
	} catch (e) {
		window.desole.captureException(e)
	}
```
