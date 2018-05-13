# Desole JavaScript collector client


This project contains the code for the Desole JavaScript client collector, compatible with browsers and Node.js. 

## Installing into a browser

You can either grab the code from this repository, install it using NPM, or use the CDN version:

* non-minified: https://desole.io/code/1.0.0/client.js (CORS integrity hash sha384-F6dlhvEal5yUmvat1O3JGkkA6xaPbwxWhQksJVfbZTFvLR3KkWmNf2OkF1jyuzzA)
* minified: https://desole.io/code/1.0.0/client-min.js (CORS integrity hash sha384-RJpzB9k3WRLZZ0Th8DoSiEWUYMmt5+9fxLajledFE5PY/23D+tHatLo38g/LDc7z)

## Configuring the HTML page

Add this snippet before any other scripts in your HTML document, and replace the path to the client JS and the API URL:

```html
<script src="CLIENT-LIBRARY-PATH" crossorigin="anonymous" integrity="INTEGRITY-HASH"></script>
<script>
  var desole = new Desole({
    url: 'https://DESOLE-API-URL', 
    app: {
      name: 'Desole test',
      version: '1.0.0',
      stage: 'test'
    }
  })
</script>
```
This will make Desole automatically track unhandled errors on the page, as well as script loading errors. Make sure to add the block to the end of the HEAD element

To track errors manually, use `window.desole.captureException` to send an exception object or a promise rejection to the collector API:

```js
try {
		throw new Error('capturedException');
	} catch (e) {
		window.desole.captureException(e)
	}
```
