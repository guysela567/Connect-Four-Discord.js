const server = require('express')();

server.all('/', (req, res) => {
    res.send('Your bot is alive!')
})

function keepAlive(){
  server.listen(3000, () => {console.log("Server is Ready!")});
}

module.exports = keepAlive;