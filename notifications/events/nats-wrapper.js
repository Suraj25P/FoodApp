const nats = require('node-nats-streaming') 
class NatsWrapper {
    //clusterId,clientId,url
    get client() {
        if (!this._client)
            throw new Error('nats client has not been initilized yet')
        return this._client
    }
    connect(clusterId,clientId,url) {
        this._client = nats.connect(clusterId, clientId, { url })   


        return new Promise((resolve, reject) => {
            this._client.on('connect', () => { 
                resolve()   
            })
            this._client.on('error', (err) => { 
                console.log(err)
                console.log("ERROR CONNECTING TO NATS")
                resolve(err)   
            })

        })
            

    }
}

const natsWrapper = new NatsWrapper()
module.exports = natsWrapper