'use strict'; // "vira" yerine geçer, daha iyi kod yazmamızı sağlar imiş.

// express router ı kuruyoruz
const express = require('express');
const router = express.Router();

// GET /questions 
// soruları görelim
router.get('/', (req, res) => { // kullanıcıya yanıtın gönderileceği son durak olduğu için next i kullanmadık. hata ile ilişkili olsaydı kullanırdık.
    res.json({response: "GET talebi geldi sanırım."});
});

// GET /questions/:id
// seçtiğimiz soruyu görelim
router.get('/:qID', (req, res) => {
    res.json({
        response: req.params.qID + " ID'si için bir GET talebi geldi sanırım.",
    });
});

// POST /questions 
// soru oluşturalım
router.post('/', (req, res) => {
    res.json({
        response: 'POST talebi geldi sanırım.',
        body: req.body
    });
});

// POST /questions/:qID/answers 
// cevap oluşturalım
router.post('/:qID/answers', (req, res) => {
    res.json({
        response: '/answers yoluna bir POST talebi geldi sanırım.',
        questionId: req.params.qID,
        body: req.body
    });
});

// PUT /questions/:qID/answers/:aID
// belirli bir cevabı değiştirelim
router.put('/:qID/answers/:aID', (req, res) => {
    res.json({
        response: '/answers yoluna bir PUT talebi geldi sanırım.',
        questionId: req.params.qID,
        answerID: req.params.aID,
        body: req.body
    });
});

// DELETE /questions/:qID/answers/:aID
// belirli bir cevabı silelim
router.delete('/:qID/answers/:aID', (req, res) => {
    res.json({
        response: '/answers yoluna bir DELETE talebi geldi sanırım.',
        questionId: req.params.qID,
        answerID: req.params.aID
    });
});

// POST /questions/:qID/answers/:aID/vote-up
// POST /questions/:qID/answers/:aID/vote-down
// belirli bir cevabı oylayalım
router.post('/:qID/answers/:aID/vote-:yol', (req, res) => {
    res.json({
        response: '/vote-' + req.params.yol + ' üzerinden bir POST talebi geldi sanki',
        questionId: req.params.qID,
        answerID: req.params.aID,
        vote: req.params.yol
    });
});

//ihraç ediyoruz
module.exports = router;