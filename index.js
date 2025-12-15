const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 1818;

//middleWare

app.use(cors());
app.use(express.json());

//connection 

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8l6zy8s.mongodb.net/?appName=Cluster0`;

//client
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});



async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const db = client.db('online_ticket_db');
        const ticketCollection = db.collection('allTicket');
        const popularCollection = db.collection('popularRoute');
        const factCollection = db.collection('factToChoose');
        const userCollection = db.collection('users');

        //api

        app.get('/tickets', async (req, res) => {

            const query = {};

            const cursor = ticketCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);

        })

        // latest 
        app.get('/newTickets', async (req, res) => {

            const query = {};
            const cursor = ticketCollection.find(query).sort({ createdAt: -1 }).limit(6);
            const result = await cursor.toArray();
            res.send(result);

        })

        // for Advertisement
        app.get('/advertisementTickets', async (req, res) => {

            const query = { isAdvertised: true };
            const cursor = ticketCollection.find(query).limit(6);
            const result = await cursor.toArray();
            res.send(result);

        })

        //ticket add

        app.post('/tickets', async (req, res) => {
            const ticket = req.body;
            const result = await ticketCollection.insertOne(ticket);
            res.send(result)
        })

        //Popular route

        app.post('/popularRoute', async (req, res) => {
            const route = req.body;
            const result = await popularCollection.insertOne(route);
            res.send(result)
        })

        app.get('/popularRoute', async (req, res) => {

            const query = {};
            const cursor = popularCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);

        })

        //why us route

        app.post('/factRoute', async (req, res) => {
            const route = req.body;
            const result = await factCollection.insertOne(route);
            res.send(result)
        })

        app.get('/factRoute', async (req, res) => {

            const query = {};
            const cursor = factCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);

        })

        // User api
        app.post('/users', async (req, res) => {
            const user = req.body;
            user.role = 'user';
            user.createdAt = new Date();
            const email = user.email;
            const userExists = await userCollection.findOne({ email })

            if (userExists) {
                return res.send({ message: 'user exists' })
            }

            const result = await userCollection.insertOne(user);
            res.send(result);
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Server is connecting')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})