const express = require('express')
require('dotenv').config()
const { UsersData } = require('../models') //시퀄라이즈 사용할떄 모델만 가져오면 다 가져와짐. 뒤에 경로 쓰면 안됨.
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')

const middleware = require('../middleware/need-signin.middleware.js')

// console.log("User table dropped!");
const emailValidation = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[0-9a-zA-Z]{2,3}$/i

//회원가입 기능
router.post('/signup', async (req, res) => {
  const { email, password, passwordRE, name } = req.body
  console.log(req.body)

  // await UsersData.drop();
  //이메일이 이상한 경우 에러
  if (!email || email.match(emailValidation) === null) {
    return res.status(400).json({ message: '이메일을 입력하세요' })
  }

  //비밀번호가 6자리 사이가 아닌 경우
  if (password.length !== 10) {
    return res.status(400).json({ message: '비밀번호는 10자리를 입력해야 하며, 한글은 불가합니다.' })
  }

  //비밀번호가 확인비밀번호와 다를 경우.
  if (password !== passwordRE) {
    return res.status(400).json({ message: '비밀번호가 일치하지 않습니다.' })
  }
  try {
    //정상적으로 입력한 경우 db에 데이터 삽입
    const salt = await bcrypt.genSalt(10) // 기본이 10번이고 숫자가 올라갈수록 연산 시간과 보안이 높아진다.
    const hashed = await bcrypt.hash(password, salt) // 비밀번호를 해쉬해서 변수에 담기.
    const usersinfo = await UsersData.create({ email, password: hashed, name })
    return res.status(200).json({ data: usersinfo })
  } catch (err) {
    console.log(err)
  }
})

//회원 로그인 기능
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body

  //입력한 이메일 값과 같은 유저 데이터 찾기
  const loginUserData = await UsersData.findOne({ where: { email } })
  console.log(loginUserData.id)

  if (!loginUserData) {
    return res.status(404).json({ message: '존재하지 않는 회원입니다. 회원가입을 해주세요.' })
  }

  //입력 비밀번호 값이 암호화된 비번 값과 같은지 비교.
  const validPassword = await bcrypt.compare(password, loginUserData.password)
  if (!validPassword) {
    return res.status(400).json({ message: '비밀번호가 일치하지 않습니다.' })
  }

  //회원이 맞는 순간 jwt 토큰 발행 및 쿠키에 넣고, 로그인 성공처리.
  try {
    const token = await jwt.sign({ authorization: loginUserData.id }, process.env.SECRET_KEY, { expiresIn: '12h' })
    console.log(token, 'token')
    res.cookie('authorization', `Bearer ${token}`)
    res.status(200).json({ message: '로그인에 성공하였습니다.' })
    // return res.redirect(303, '/auth/middleware');
  } catch (error) {
    console.log(error)
  }
})

//회원 정보 조회 기능
router.get('/info', middleware, (req, res, next) => {
  //middleware 인증한 뒤, 회원 데이터 가져오기

  console.log('토큰값 =>', res.locals.user)
  const { name, email, createdAt } = res.locals.user
  res.status(200).json({
    message: {
      name,
      email,
      createdAt,
    },
  })
})

module.exports = router
