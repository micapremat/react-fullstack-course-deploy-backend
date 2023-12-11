const express = require('express')

const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.json())

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}
// app.use(requestLogger)

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
  
// app.use(unknownEndpoint)

let notes = [
    {
      id: 1,
      content: "HTML is easy",
      important: true
    },
    {
      id: 2,
      content: "Browser can execute only JavaScript",
      important: false
    },
    {
      id: 3,
      content: "GET and POST are the most important methods of HTTP protocol",
      important: true
    }
  ]

  let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]
//exercise 3.1
app.get('/api/persons', (request, response) => {
    response.json(persons)
})
//example
app.get('/', (request, response) => {
    response.send('<h1>Hello World</h1>')
})
//exercise 3.2
app.get('/info', (request, response) => {
    const date = new Date();
    response.send(`
    <p>Phonebook has info for 2 people</p>
    <p>${date}</p>
    `)
})
//exercise 3.3
app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})
//exercise 3.4
app.delete('/api/persons/:id', (request, respons) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {
        persons = persons.filter(person => person.id !== id)
        respons.status(204).end()
    } else {
        respons.status(404).end()
    }
})
//exercise 3.5
app.post('/api/persons', (request, response) => {
    const body = request.body
    if (!body.name || !body.number) {
        response.status(400).json({
            error: 'content missing'
        })
    }
    const person = persons.filter(person => person.name.toLowerCase() === body.name.toLowerCase())
    console.log(person)
    if (person.length) {
        response.status(200).json({
            error: 'name already exist'
        })
    } else {
        const newPerson = {
            name: body.name,
            number: body.number,
            id: (persons.length > 0 ? Math.max(...persons.map(p => p.id)) : 0) + 1
        }
        persons = persons.concat(newPerson)
        response.json(newPerson)
    }
})

app.get('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id)
    const note = notes.find(note => note.id === id)
    if (note) {
        response.json(note)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id)
    notes = notes.filter(note.id !== id)
    response.status(204).end()
})

const generateId = () => {
    const maxId = notes.length > 0 ? Math.max(...notes.map(n => n.id)) : 0
    return maxId + 1
}
app.post('/api/notes', (request, response) => {
    const body = request.body
    if(!body.content) {
        return response.status(400).json({
            error: 'content missing'
        })
    }    
    const note = {
        content: body.content,
        important: body.important || false,
        id: generateId(),
    }
    notes = notes.concat(note)
    response.json(note)
})

app.get('/api/notes', (request, response) => {
    response.json(notes)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})