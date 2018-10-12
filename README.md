# Desole browser collector client

![](https://desole.io/images/desole-logo.png)

Desole is an error-tracking system you can install in your AWS account, with just a few clicks. It enables organisations to track application exceptions and errors without having to choose between the convenience of software-as-a-service and the security of a self-hosted solution. You fully control the data, so it is easy to enforce compliance, encryption and data security requirements. At the same time, Desole uses highly-scalable AWS resources that can easily handle massive traffic, and auto-size on demand, so you do not have to worry about operating costs or administration.

This project contains the code for the Desole browser client collector. 

Check out [desole.io](https://desole.io) for more information, especially on how to set up the back-end.

## Installing 

You can either grab the code from the [dist](/dist) directory in this repository, install it using NPM with `npm install @desole/client`, or use the CDN version:

* https://desole.io/code/1.0.3/client-min.js (CORS integrity hash `sha256-1djTeOMCkqGml+n6mkTQXvsN4H1QMF0R2Vtr0xkubkk= sha384-dKPFtleaBCcGf7wWXS0cKu5UMoydNaJ3nU+efi+hsa5IO9eBQ6B+UmEBQOHxiq3q`)

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

To track errors manually, use instance created with `new Desole` and call the `captureException` to send an exception object or a promise rejection to the collector API:

```js
try {
  throw new Error('capturedException');
} catch (e) {
  window.desole.captureException(e);
}
```
