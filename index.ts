import Database from 'better-sqlite3';
import cors from 'cors';
import express from 'express';


const app = express()
app.use(cors())
app.use(express.json())


const db = new Database('./data.db',{
    verbose: console.log
})


const PORT = 4000

// API Homepage

app.get('/', (req,res)=>{
    res.send(`
        <h1>Museums and works API</h1>
        <p>Click here to view all <a href='/museums'>museums</a></p> 
        <p>Click here to view all <a href='/works'>works</a></p> 
    `)
})


// Functions needed to work with the database
const getAllMuseums = db.prepare(`SELECT * FROM museums;`)
const createMuseum = db.prepare(`INSERT INTO museums (name, city) VALUES(?,?)`)
const getMuseumByID = db.prepare(`SELECT * FROM museums WHERE id=?`)

const getAllWorks = db.prepare(`SELECT * FROM works;`)
const getWorksByMuseumID = db.prepare(`SELECT * FROM works WHERE museum=?;`)
const getWorkbyID = db.prepare(`SELECT * FROM works WHERE id=?;`)
const transferWorkToAnotherMuseum = db.prepare(`UPDATE works SET museum=? WHERE id=?`)
const createWork = db.prepare(`INSERT INTO works (name, picture, museum) VALUES(?,?,?)`)


// Getting all the museums
app.get('/museums', (req,res)=>{
    const allMuseums = getAllMuseums.all()

    if(allMuseums){
        for(const museum of allMuseums){
            museum.works = getWorksByMuseumID.all(museum.id)
        }
        res.send(allMuseums)
    }
})

// Adding a new museum
app.post('/museums', (req,res)=>{
    const name = req.body.name
    const city = req.body.city

    let errors = []

    if(name.length === 0)errors.push("Please a enter e name")
    
    if(city.length === 0) errors.push("Please a enter e city")
    if(errors.length > 0)res.status(406).send({errors})
    else{
        const result = createMuseum.run(name,city)
        if(result.changes > 0){
            res.send(getMuseumByID.get(result.lastInsertRowid))
        }
    }
})
// Get a single museum
app.get('/museums/:id',(req, res)=>{
    const id = req.params.id
    const museum = getMuseumByID.get(id)
    museum.works = getWorksByMuseumID.all(id)
    
    if(museum){
        res.send(museum)
    }else{
        res.status(404).send({error:"Museum not found :("})
    }
})

// Creating a new work for the current museum
app.post('/museums/:id',(req, res)=>{
    const id = req.params.id
    const name = req.body.name
    const picture = req.body.picture
    
    let errors = []

    if(name.length === 0) errors.push("Enter a name")
    if(picture.length === 0) errors.push("Enter a an picture url")
    if(errors.length > 0)res.status(406).send({errors})
    else{
        const result = createWork.run(name,picture,id)
        if(result.changes > 0){
            res.send(getWorkbyID.get(result.lastInsertRowid))
        }
    }
})

// Getting all the works
app.get('/works', (req,res)=>{
    const allWorks = getAllWorks.all()
    if(allWorks){
        for(const work of allWorks){
            work.museum = getMuseumByID.get(work.museum)
        }
        res.send(allWorks)
    }    
})
// Getting a single work
app.get('/works/:id',(req,res)=>{
    const id = req.params.id
    const work = getWorkbyID.get(id)
    work.museum = getMuseumByID.get(work.museum)
    if(work){
        res.send(work)
    }else{
        res.status(404).send({error:"Work not found :("})
    }
})
 
// Transferin a work to another museum
app.patch('/works/:id',(req,res)=>{
    const id = req.params.id
    const newMuseumID = req.body.museumID

    if(newMuseumID){
        const result = transferWorkToAnotherMuseum.run(newMuseumID, id)
        console.log(result)
        if(result.changes > 0  ){
            res.send(getWorkbyID.get(id))
        }else{
            res.status(404).send({error:"Museum id not found"})
        }
    }else{
        res.status(404).send({error:"ID "})
    }
})



app.listen(PORT, ()=>{console.log(`Server up and running on http://localhost:${PORT}`)})