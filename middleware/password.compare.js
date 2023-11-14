const express = require('express')
const jwt = require('jsonwebtoken')
const { UsersData } = require('../models')
const bcrypt = require('bcrypt')

// async function passwordCompare(req, res, next) {
//   const token = req.headers['authorization']
//   const [authType, authToken] = token.split(' ')

//   authToken.compare()
// }
// module.exports = passwordCompare
