# client


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
