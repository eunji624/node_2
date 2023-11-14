const express = require('express')
const { UsersData, Products, sequelize } = require('../models')
const middleware = require('../middleware/need-signin.middleware.js')
const passwordCompare = require('../middleware/password.compare.js')
const router = express.Router()

//상품 리스트 가져오기
router.get('/product', middleware, async (req, res) => {
  try {
    let queryString = req.query.sort
    if (queryString === undefined || req.query.sort.toLowerCase() === 'desc') {
      sort = 'desc'
    } else if (queryString.toLowerCase() === 'asc') {
      sort = 'asc'
    } else {
      return res.status(405).json({ message: '주소를 확인하여 주십시오.' })
    }

    const listData = await Products.findAll({
      include: { model: UsersData },
      order: [['updatedAt', sort]],
    })
    if (!listData) {
      return res.status(404).json({ message: '리스트를 가져오는데 실패하였습니다.' })
    }

    const showListData = listData.map((data) => {
      return {
        productId: data.productId,
        productName: data.productName,
        comment: data.comment,
        name: data.UsersDatum.name,
        price: data.price,
        status: data.status,
        updatedAt: data.updatedAt,
      }
    })
    return res.status(200).json(showListData)
  } catch (err) {
    console.log(err)
    return res.status(500).json({ messege: '잠시 후 다시 시도해주세요' })
  }
})

//상품 작성하기
router.post('/product', middleware, async (req, res) => {
  const userId = res.locals.user.dataValues.id // 단순 고정. 토큰에서 가져올것.
  const { productName, comment, price } = req.body
  if (!productName || !comment || !price) {
    return res.status(400).json({ message: '상품에 대한 정보를 입력해 주세요.' })
  }

  try {
    await Products.create({ productName, comment, price, userId })
    res.status(200).json({ message: '데이터를 저장하는데 성공하였습니다.' })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ messege: '잠시 후 다시 시도해주세요' })
  }
})

//상품 상세 조회하기__ id 값을 미들웨어 에서 가져와서, 테이블 조인후 네임값 가져오기.
router.get('/product/:productId', middleware, async (req, res) => {
  const productId = req.params.productId
  console.log(productId)
  try {
    let detailData = await Products.findByPk(productId, {
      attributes: ['productName', 'comment', 'status', 'price', 'createdAt', [sequelize.col('userId'), 'userId']],
      include: [
        {
          model: UsersData,
          attributes: ['name'],
        },
      ],
    })

    if (!detailData) {
      return res.status(404).json({ message: '존재하지 않는 상품입니다.' })
    }

    const { productName, comment, status, price, createdAt } = detailData
    const name = detailData.UsersDatum.name
    detailData = {
      productName,
      name,
      comment,
      status,
      price,
      createdAt,
    }
    return res.status(200).json(detailData)
  } catch (err) {
    console.log(err)
    return res.status(500).json({ messege: '잠시 후 다시 시도해주세요' })
  }
})

//상품 삭제하기
router.delete('/product/:productId', middleware, async (req, res) => {
  const productId = req.params.productId
  try {
    const data = await Products.findByPk(productId)
    if (!data) {
      return res.status(404).json({ messege: '존재하지 않는 상품입니다.' })
    }
    if (data.userId !== res.locals.user.id) {
      return res.status(401).json({ messege: '작성자가 아님으로 삭제 권한이 없습니다.' })
    }
    await Products.destroy({ where: { productId } })
    return res.status(200).json({ messege: '상품이 삭제되었습니다.' })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ messege: '잠시 후 다시 시도해주세요' })
  }
})

//상품 수정하기
router.patch('/product/:productId', middleware, async (req, res) => {
  const { productName, comment, status, price } = req.body

  if (!productName || !comment || !status || !price) {
    return res.status(400).json({ messege: '데이터 형식이 올바르지 않습니다.' })
  }
  try {
    const productId = req.params.productId
    const data = await Products.findOne({ where: { productId } })
    if (!data) {
      res.status(404).json({ messege: '존재하지 않는 상품입니다.' })
    }
    if (data.userId !== res.locals.user.id) {
      return res.status(401).json({ messege: '작성자가 아님으로 삭제 권한이 없습니다.' })
    }

    await Products.update({ productName, comment, status, price }, { where: { productId: data.productId } })
    return res.status(200).json({ messege: '상품이 수정되었습니다.' })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ messege: '잠시 후 다시 시도해주세요' })
  }
})

module.exports = router
