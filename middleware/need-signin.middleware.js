const express = require('express')
require('dotenv').config()

const jwt = require('jsonwebtoken')
const { UsersData } = require('../models')

async function middleware(req, res, next) {
  //Authorization" 헤더로 전달받는 토큰 가져오기
  // const token = req.headers["authorization"] 이런식으로도 사용 가능.
  const { authorization } = req.headers
  // console.log('auth=> ', req.headers)
  const [authType, authToken] = authorization.split(' ')
  // console.log('authType', authType)
  // console.log('authToken', authToken)

  //타입이 bearer가 아니거나, authToken이 값이 없을 경우
  if (!authToken || authType !== 'Bearer') {
    return res.status(400).json({
      message: '토큰이 없습니다.',
    })
  }

  try {
    //토큰 변조여부 검증 & 시크릿 키 확인.
    const { authorization } = jwt.verify(authToken, process.env.SECRET_KEY)
    console.log(authorization, 'authorization')

    //토큰 유효기간 만료되면,
    if (!authorization) {
      return res.status(401).json({ message: '로그인을 해주세요.' })
    }

    const findUser = await UsersData.findOne({ where: { id: authorization } })
    // console.log("user=>", findUser);

    if (!findUser) {
      return res.status(401).json({ message: '로그인을 해주세요.' })
    }

    //req.user = findUser
    res.locals.user = findUser
    //이게 뭐냐면. 데이터베이스에 담겨잇는 사용자 정보를 가져온거. 포괄적 관리 용이.
    //이 미들웨어를 사용하는 라우터는 굳이 데이터베이스에 접근하지 않아도 express가 제공하는 안전한 변수에 담아 언제든 사용 가능함.
    //데이터도 res 하고나면 소멸되서 걱정 노노

    // console.log('로컬 점 유저', res.locals.user)
    //성공했을때도 리턴하면 다된밥 재뿌리기.... 라우터를 안가고 다시 돌아감.
  } catch (error) {
    console.log(error) // 에러가 날때만 리턴. 해야 서버가 안죽음
    return res.status(401).json({
      message: '로그인을 해주세요.',
    })
  }
  next() //미들웨어에서 next 안쓰면 안넘어 가고 머무름. 지박령됨.
}

module.exports = middleware
//익스포트 할때 괄호 금지.
