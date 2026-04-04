import express from 'express'
import cors from 'cors'

const app = express()

app.use(cors())
app.use(express.json())

app.post('/generate', (req, res) => {
  const { resumeText, jobTitle } = req.body

  const result = `AI Resume for ${jobTitle}\n\n${resumeText}`

  res.json({ result })
})

app.listen(8000, () => {
  console.log('Server running on http://localhost:8000')
})