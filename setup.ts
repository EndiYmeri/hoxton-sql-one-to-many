import Database from 'better-sqlite3';

const db = new Database('./data.db',{
    verbose: console.log
})

type MuseumType ={
    id: number,
    name: string,
    city: string
}
type WorkType ={
    id: number,
    name: string,
    picture: string,
    museumID: number
}

type Museum = Omit<MuseumType, "id">
type Work = Omit<WorkType, "id">




const museums: Museum[] = [
    {name: "Muzeu Historik Kombëtar", city: "Tirane"},
    {name: "Skanderbeg Museum", city: "Kruje"},
    {name: "Muzeu i Vlores", city: "Vlore"},
    {name: "Muzeu i Lezhes", city: "Lezhe"},
]

const works: Work[] = [
    {name: "The flag sewed by Marigo", picture: "https://live.staticflickr.com/3846/14627365765_599b8bd0e3_b.jpg", museumID: 3},
    {name: "Skanderbeg's Sword and Helmet", picture: "https://www.thevintagenews.com/wp-content/uploads/2017/02/lead-skander445.jpg", museumID: 4},
    {name: "Commander Bato", picture: "http://albanianstudies.weebly.com/uploads/3/4/6/9/3469404/bato-1.jpg?250", museumID: 1},
    {name: "Epitach of Gllavenica", picture: "https://www.intoalbania.com/wp-content/uploads/2018/01/TR_SPI_EPITAFI-I-GLLAVENICES_03-e1521563693133.jpg", museumID: 1},
    {name: "Queen Teuta and King Pirro", picture: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Skanderbeg_Museum_%284%29.JPG/1280px-Skanderbeg_Museum_%284%29.JPG", museumID: 2},
]

const dropTableMuseums = db.prepare(`DROP TABLE IF EXISTS museums`)
const dropTableWorks = db.prepare(`DROP TABLE IF EXISTS works`)

dropTableWorks.run()
dropTableMuseums.run()

const createMuseumsTable = db.prepare(`
    CREATE TABLE museums(
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        city TEXT NOT NULL
);
`)

createMuseumsTable.run()

const createWorksTable = db.prepare(`
    CREATE TABLE works(
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        picture TEXT NOT NULL,
        museum INTEGER,
        FOREIGN KEY (museum) REFERENCES museums(id)
    );
`)
createWorksTable.run()

const createMuseum = db.prepare(`INSERT INTO museums(name, city) VALUES(?,?)`)
const createWork = db.prepare(`INSERT INTO works(name, picture, museum ) VALUES(?,?,?)`)


for(const museum of museums){
    createMuseum.run(museum.name, museum.city)
}

for(const work of works){
    createWork.run(work.name, work.picture, work.museumID)
}



