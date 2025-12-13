const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 1818;

app.get('/', (req, res) => {
    res.send('Server is connecting')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})