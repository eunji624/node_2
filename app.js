//express 와 schemas 가져오기
const express = require('express')
require('dotenv').config()
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const app = express()

const port = process.env.PORT

//body-parser
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

//router 연결하기
const productRouter = require('./routers/product.router.js')
const usersModels = require('./models')
const usersRouter = require('./routers/users.router.js')
app.use('/auth', usersRouter)
app.use('/api', productRouter)

app.get('/', (req, res) => {
  res.send('mallish에 오신걸 환영합니다')
})

app.listen(port, () => {
  // connect();  //mongoose 연결 해제
  console.log(port, '로 서버가 열렸습니다.')
})
