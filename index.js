const express = require('express')
const axios = require('axios')
const app = express()
const redis = require('redis')
const PORT = 8080
const REDIS_PORT = 6379
const client = redis.createClient(REDIS_PORT)

app.use(express.json())

const cache = (req, res, next) => {
    const city = req.query.city
    client.get(city, (err, data) => {
        try {
            if (err) throw err
            if (data !== null) {
                res.send(JSON.parse(data))
            } else {
                next()
            }
        } catch (error) {
            console.log(error)
            res.sendStatus(500)
        }
    })
}

app.get('/', cache, async (req, res) => {

    const city = req.query.city
    try {

        const response = await axios.get(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${city}&components=country:id&key=AIzaSyDKk0BTVxQubbUo4rtDnCPBzuc6QT8SgxY`)
        client.setex(city, 300, JSON.stringify(response.data))
        res.send(response.data)
        
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

app.listen(PORT, () => console.log('listening port ' + PORT))