const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const destinationCollection = db.collection('destination');
        const ticketPurchaseCollection = db.collection('purchaseTicket');

        //api

        //Destination
        app.post('/destination', async (req, res) => {
            const data = req.body;
            const query = data;
            const result = await destinationCollection.insertMany(query);
            res.send(result);

        })

        app.get('/destination', async (req, res) => {

            const query = {};

            const cursor = destinationCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);

        })

        //All ticket
        app.get('/tickets', async (req, res) => {

            const query = {};

            const cursor = ticketCollection.find(query);
            const result = await cursor.toArray();
            // console.log(result)
            res.send(result);

        })

        //ticket find by user
        app.get('/tickets/user/:email', async (req, res) => {

            const vendorEmail = req.params.email;
            const query = { vendorEmail }
            const cursor = ticketCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);

        })

        //single ticket api
        app.get('/tickets/id/:id', async (req, res) => {

            const id = req.params.id;
            // console.log("id: ", id);
            let result;

            result = await ticketCollection.findOne({ _id: new ObjectId(id) });
            if (!result) {
                result = await ticketCollection.findOne({ _id: id });
            }
            // console.log(result);
            res.send(result);

        })

        // latest 
        app.get('/newTickets', async (req, res) => {

            const query = { verificationStatus: "approved" };
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

        //ticket info update api need change

        app.patch('/tickets/:id', async (req, res) => {

            const id = req.params.id;
            const { q } = req.body
            // console.log(q);
            const update = {
                $set: {
                    quantity: q
                }
            };
            let result;

            result = await ticketCollection.updateOne({ _id: new ObjectId(id) }, update);
            if (result.matchedCount === 0) {
                result = await ticketCollection.updateOne({ _id: id }, update);
            }

            // console.log('result ', result)
            res.send(result);

        })

        //admin
        app.patch('/tickets/admin/:id', async (req, res) => {

            const id = req.params.id;
            // console.log("id: ", id);
            const data = req.body;
            // console.log("data ", data);
            const update = {
                $set: {
                    verificationStatus: data.status
                }
            };
            // console.log("update: ", update);
            let result;

            result = await ticketCollection.updateOne({ _id: new ObjectId(id) }, update);
            if (result.matchedCount === 0) {
                result = await ticketCollection.updateOne({ _id: id }, update);
            }

            // console.log('result ', result)
            res.send(result);

        })

        //add advertised ticket

        app.patch('/tickets/admin/advertised/:id', async (req, res) => {

            const id = req.params.id;
            console.log("id: ", id);
            const data = req.body;
            console.log("data ", data);
            const update = {
                $set: {
                    isAdvertised: data.status
                }
            };
            console.log("update: ", update);
            let result;

            result = await ticketCollection.updateOne({ _id: new ObjectId(id) }, update);
            if (result.matchedCount === 0) {
                result = await ticketCollection.updateOne({ _id: id }, update);
            }

            // console.log('result ', result)
            res.send(result);

        })

        //update ticket info

        app.patch('/tickets/vendor/:id', async (req, res) => {
            const id = req.params.id;
            const data = req.body;
            // console.log("update data: ", data);

            const update = {
                $set: {
                    title: data.title,
                    from: data.from,
                    to: data.to,
                    price: parseInt(data.price),
                    quantity: parseInt(data.quantity),
                    transportType: data.transportType,
                    perks: data.perks || [],
                    vendorName: data.vendorName,
                    vendorEmail: data.vendorEmail,
                    departureTime: data.departureTime,
                    image: data.image,
                    verificationStatus: data.verificationStatus,
                    isAdvertised: false,
                    updatedAt: new Date()
                }
            }
            // console.log("update data: ", update);

            let result;
            if (ObjectId.isValid(id)) {
                result = await ticketCollection.updateOne({ _id: new ObjectId(id) }, update);
                if (result.matchedCount === 0) {
                    result = await ticketCollection.updateOne({ _id: id }, update);
                }
            } else {
                result = await ticketCollection.updateOne({ _id: id }, update);
            }

            // console.log("result is: ", result)
            res.send(result)
        })

        //Delete tickets 

        app.delete('/tickets/delete/:id', async (req, res) => {
            const id = req.params.id;
            let result;
            if (ObjectId.isValid(id)) {
                result = await ticketCollection.deleteOne({ _id: new ObjectId(id) });
                if (result.deletedCount === 0) {
                    result = await ticketCollection.deleteOne({ _id: id });
                }
            } else {
                result = await ticketCollection.deleteOne({ _id: id });

            }

            // console.log("result is: ", result)
            res.send(result)
        })


        // ticketPurchaseInfo api

        app.post('/ticketPurchaseInfo', async (req, res) => {
            const purchaseInfo = req.body;
            // console.log("ticketPurchaseInfo ", purchaseInfo);
            const result = await ticketPurchaseCollection.insertOne(purchaseInfo);
            res.send(result)
        })

        app.get('/ticketPurchaseInfo', async (req, res) => {
            const query = {}
            // console.log("ticketPurchaseInfo ", purchaseInfo);
            const cursor = ticketPurchaseCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })
        app.patch('/ticketPurchaseInfo/status/:id', async (req, res) => {
            const id = req.params.id
            const object = req.body;
            // console.log("ticketPurchaseInfo ", object);

            const update = {
                $set: {
                    status: object.status
                }
            }

            let result;
            if (ObjectId.isValid(id)) {
                result = await ticketPurchaseCollection.updateOne({ _id: new ObjectId(id) }, update);
                if (result.matchedCount === 0) {
                    result = await ticketPurchaseCollection.updateOne({ _id: id }, update);
                }
            } else {
                result = await ticketPurchaseCollection.updateOne({ _id: id }, update);
            }

            console.log("result is: ", result)
            res.send(result);

        })

        app.get('/ticketPurchaseInfo/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            // console.log(query)
            const cursor = ticketPurchaseCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
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

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const result = await userCollection.findOne(query);
            res.send(result)
        })

        //all user
        app.get('/users', async (req, res) => {
            const query = {}
            const cursor = userCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/users/:email/role', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await userCollection.findOne(query);
            res.send({ role: user?.role || 'user' })
        })

        //admin update the user role

        app.patch('/users/admin/:id', async (req, res) => {

            const id = req.params.id;
            console.log("id: ", id);
            const data = req.body;
            console.log("data ", data);
            const update = {
                $set: {
                    role: data.status
                }
            };
            console.log("update: ", update);
            let result;

            result = await userCollection.updateOne({ _id: new ObjectId(id) }, update);
            if (result.matchedCount === 0) {
                result = await userCollection.updateOne({ _id: id }, update);
            }

            // console.log('result ', result)
            res.send(result);

        })

        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
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