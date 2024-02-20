require('dotenv').config()
const express = require('express')
const Note = require('./models/note')
const Person = require('./models/person')

const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())

const mongoose = require('mongoose')

//const password = process.argv[2]

//const url = `mongodb+srv://micapremat:${password}@cluster0.zxpqxld.mongodb.net/noteApp?retryWrites=true&w=majority`
const url = process.env.MONGODB_URI
console.log('connecting to ', url)

mongoose.set('strictQuery',false)
mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB: ', error.message)
  })

// const noteSchema = new mongoose.Schema({
//   content: String,
//   important: Boolean,
// })

// const Note = mongoose.model('Note', noteSchema)

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

//exercise 3.1
app.get('/api/persons', (request, response) => {
  Person.find({}).then(person => {
    response.json(person)
    console.log(person)
  })
})
//example
app.get('/', (request, response) => {
  response.send('<h1>Hello World</h1>')
})
//exercise 3.2
app.get('/info', (request, response) => {
  const date = new Date()
  response.send(`
    <p>Phonebook has info for 2 people</p>
    <p>${date}</p>
  `)
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body
  Person.findByIdAndUpdate(request.params.id, { name, number }, { new: true,  runValidators: true, context: 'query' })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.post('/api/persons', async (request, response, next) => {
  const body = request.body
  let person = await Person.exists({name: body.name})
  console.log(person)
  if (person) {
    response.status(200).json({
      error: 'name already exist'
    })
  } else {
    const newPerson = new Person ({
      name: body.name,
      number: body.number,
    })
    newPerson.save()
      .then(savedPerson => {
        response.json(savedPerson)
        mongoose.connection.close()
      })
      .catch(error => next(error))
  }  
})

app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  })
})

app.get('/api/notes/:id', (request, response, next) => {
  Note.findById(request.params.id)
    .then(note => {
      if (note) {
        response.json(note)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/notes/:id', (request, response, next) => {
  Note.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/notes/:id', (request, response, next) => {
  const { content, important } = request.body
  Note.findByIdAndUpdate(request.params.id, { content, important }, { new: true, runValidators: true, context: 'query' })
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})

app.post('/api/notes', (request, response, next) => {
  const body = request.body
  const note = new Note({
    content: body.content,
    important: body.important || false,
  })
  note.save()
    .then(savedNote => {
      response.json(savedNote)
      mongoose.connection.close()
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.log(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({error: error.message})
  }
  next(error)
}

app.use(errorHandler)


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})