require('dotenv').config()

const app = require('../src/app');

const port = normalizaPort(process.env.PORT || '3000');

function normalizaPort(val) {
    const port = parseInt(val, 10);
    if (isNaN(port)) {
        return val;
    }

    if (port >= 0) {
        return port;
    }

    return false;
}

app.use((err, req, res, next) => {
    console.log(err)
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})