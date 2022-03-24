const express = require('express')
const router = express.Router()
const schemeModel = require('../Backend/models/Schemes')
const userModel = require('../Backend/models/verifiedUsers')

require("dotenv").config();
const jwt = require('jsonwebtoken')
const jwt_token = process.env.jwt_secret_key

async function checkToken(req, res, next) {
    try {
        let userToken = req.cookies.userToken;
        const tokenVerify = jwt.verify(userToken, jwt_token);
        let users = await userModel.findById(tokenVerify.id);
        if (users) {
            req.userId = users['_id']
            next()
        }
        else {
            return res.status(400).json({ message: "please log in again", status: false })
        }
    } catch (err) {
        res.status(500).send({ status: false, err })
    }
}

async function makeAdmin(req, res) {
    try {
        let userToken = req.cookies.userToken;
        const tokenVerify = jwt.verify(userToken, jwt_token);
        let users = await userModel.findById(tokenVerify.id);
        users.role = 'admin'
        await users.save();
        res.json({ users })
    } catch (err) {
        console.log(err)
        res.status(500).send({ status: false, err })
    }
}

async function checkTokenAdmin(req, res, next) {
    try {
        let userToken = req.cookies.userToken;
        const tokenVerify = jwt.verify(userToken, jwt_token);
        let users = await userModel.findById(tokenVerify.id);
        if (users) {
            if (users.role == 'admin') {
                req.userId = users['_id']
                next()
            }
            else return res.status(400).json({ message: "not authorised", status: false })
        }
        else {
            return res.status(400).json({ message: "please log in again", status: false })
        }
    } catch (err) {
        res.status(500).send({ status: false, err })
    }
}

router.route('/scheme/create').post(checkTokenAdmin, async (req, res) => {
    try {
        let newScheme = await schemeModel.create({
            title: req.body.title,
            description: req.body.description,
            date: req.body.date,
            eligibility: req.body.eligibility,
            img: req.body.img,
            agency: req.body.agency
        })
        res.status(200).json({ newScheme, status: true })
    } catch (err) {
        res.status(500).send({ status: false, err })
    }
})

router.route('/allSchemes').get(async (req, res) => {
    try {
        let schemes = await schemeModel.find();
        res.status(200).json({ schemes, status: true })
    } catch (err) {
        res.status(500).send({ status: false, err })
    }
})

router.route('/scheme/apply').post(checkToken, async (req, res) => {
    try {
        let schemes = await schemeModel.findById(req.body.schemeId);
        schemes.applicants.push(req.userId);
        await schemes.save();
        res.status(200).json({ schemes, status: true })
    } catch (err) {
        res.status(500).send({ status: false, err })
    }
})

router.route('/scheme/cancelApplication').post(checkToken, async (req, res) => {
    try {
        let schemes = await schemeModel.findById(req.body.schemeId);
        let idx = -1;
        idx = schemes.applicants.indexOf(req.userId);
        if (idx != -1) {
            schemes.applicants.splice(idx, 1);
            await schemes.save();
        }
        res.status(200).json({ status: true, schemes })
    } catch (err) {
        res.status(500).send({ status: false, err })
    }
})

router.route('/scheme/getApplicants').post(checkTokenAdmin, async (req, res) => {
    try {
        let schemes = await schemeModel.findById(req.body.schemeId).populate({ path: 'applicants' });
        res.status(200).json({ applicants: schemes.applicants, status: true })
    } catch (err) {
        res.status(500).send({ status: false, err })
    }
})

router.route('/scheme/approve').post(checkTokenAdmin, async (req, res) => {
    try {
        let schemes = await schemeModel.findById(req.body.schemeId);
        let idx = -1;
        idx = schemes.applicants.indexOf(req.body.userId);
        if (idx != -1) {
            schemes.applicants.splice(idx, 1);
            schemes.approved.push(req.body.userId)
            await schemes.save();
        }
        res.status(200).json({ status: true, schemes })
    } catch (err) {
        res.status(500).send({ status: false, err })
    }
})

router.route('/scheme/unapprove').post(checkTokenAdmin, async (req, res) => {
    try {
        let schemes = await schemeModel.findById(req.body.schemeId);
        let idx = -1;
        idx = schemes.approved.indexOf(req.body.userId);
        if (idx != -1) {
            schemes.approved.splice(idx, 1);
            schemes.applicants.push(req.body.userId)
            await schemes.save();
        }
        res.status(200).json({ status: true, schemes })
    } catch (err) {
        res.status(500).send({ status: false, err })
    }
})

router.route('/scheme/getApproved').post(checkTokenAdmin, async (req, res) => {
    try {
        let schemes = await schemeModel.findById(req.body.schemeId).populate({ path: 'approved' });
        res.status(200).json({ approved: schemes.approved, status: true })
    } catch (err) {
        res.status(500).send({ status: false, err })
    }
})

module.exports = router;