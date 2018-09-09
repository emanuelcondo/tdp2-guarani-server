const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('ci with travis');
});

app.listen(port, () => {
  console.log('App running on port 3000');
});