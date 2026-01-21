const router = require('express').Router();
const bincheck = require('./lib/bincheck');
const realaddress = require('./lib/realaddress');
const adyenv5 = require('./lib/adyenv5');
const randomdatav2Controller = require('./lib/randomdatav2');

router.get('/randomdatav2', randomdatav2Controller);
router.post('/randomdatav2', randomdatav2Controller);

router.get('/randomdatav2/new', randomdatav2Controller.newFormat);
router.post('/randomdatav2/new', randomdatav2Controller.newFormat);

router.post('/adyen', async (req, res, next) => {
  try {
    const adyen = require('./lib/adyenEncrypt');
    await adyen(req, res);
  } catch (err) {
    next(err);
  }
});

router.get('/bin/:BIN', async (req, res, next) => {
  try {
    await bincheck(req, res);
  } catch (err) {
    next(err);
  }
});

router.post('/adyenv4', async (req, res, next) => {
  try {
    const adyenv4 = require('./lib/adyenv4');
    await adyenv4(req, res);
  } catch (err) {
    next(err);
  }
});

router.get('/realaddress', async (req, res, next) => {
  try {
    await realaddress(req, res);
  } catch (err) {
    next(err);
  }
});

router.get('/realaddress/:COUNTRY', async (req, res, next) => {
  try {
    await realaddress(req, res);
  } catch (err) {
    next(err);
  }
});

router.post('/adyenv5', async (req, res, next) => {
  try {
    await adyenv5(req, res);
  } catch (err) {
    next(err);
  }
});

router.post('/adyenv450', async (req, res, next) => {
  try {
    const adyenv450 = require('./lib/adyenv450');
    await adyenv450(req, res);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
