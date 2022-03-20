const express = require('express')
const router = express.Router()
const schemeModel = require('../Backend/models/Schemes')

router.route('/allSchemes').get(async (req, res) => {
    try {
        let schemes = await schemeModel.find();
        res.status(200).json({ schemes, status: true })
    } catch (error) {
        res.status(500).send({ status: false, error })
    }
})

router.route('/scheme/apply').post(async (req, res) => {
    try {
        let schemes = await schemeModel.findById(req.body.schemeId);
        schemes.applicants.push(req.body.userId);
        await schemes.save();
        res.status(200).json({ schemes, status: true })
    } catch (error) {
        res.status(500).send({ status: false, error })
    }
})

router.route('/scheme/cancelApplication').post(async (req, res) => {
    try {
        let schemes = await schemeModel.findById(req.body.schemeId);
        let idx = -1;
        idx = schemes.applicants.indexOf(req.body.userId);
        if (idx != -1) {
            schemes.applicants.splice(idx, 1);
            await schemes.save();
        }
        res.status(200).json({ status: true, schemes })
    } catch (error) {
        res.status(500).send({ status: false, error })
    }
})

router.route('/scheme/getApplicants').post(async (req, res) => {
    try {
        let schemes = await schemeModel.findById(req.body.schemeId).populate({ path: 'applicants' });
        res.status(200).json({ applicants: schemes.applicants, status: true })
    } catch (error) {
        res.status(500).send({ status: false, error })
    }
})

router.route('/scheme/approve').post(async (req, res) => {
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
    } catch (error) {
        res.status(500).send({ status: false, error })
    }
})

router.route('/scheme/unapprove').post(async (req, res) => {
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
    } catch (error) {
        res.status(500).send({ status: false, error })
    }
})

router.route('/scheme/getApproved').post(async (req, res) => {
    try {
        let schemes = await schemeModel.findById(req.body.schemeId).populate({ path: 'approved' });
        res.status(200).json({ approved: schemes.approved, status: true })
    } catch (error) {
        res.status(500).send({ status: false, error })
    }
})