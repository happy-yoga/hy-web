import express from 'express'
// import helmet from 'helmet'
import morgan from 'morgan'
import 'pug'

const app = express()

// app.use(helmet())
app.use(morgan('combined'))
app.set('view engine', 'pug')
app.set('views', './lib/views')

export default app
