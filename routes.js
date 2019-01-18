'use strict'; // "vira" yerine geçer, daha iyi kod yazmamızı sağlar imiş.

// express router ı kuruyoruz
const express = require('express');
const router = express.Router();

// models.js ten çekme vakti
const Question = require("./models").Question; // Question olarak ihraç etmiştik.

// seçtiğimiz soruyu görelim için geliştirdiğimiz metod. qID olduğunda çalışacaktır
router.param("qID", function(req, res, next, id) { // 1)route parametresinin ismi 2)callback func.(qID varlığında icraa edilecektir) id değeri adres çubuğundan alınan qID değeri.
    Question.findById(id, function(err, doc) { // soru dokümanını yükledik. ("id" yerine "req.params.id" vardı fakat router.param şimdi o işi görüyor)
        if(err) return next(err);
        if(!doc) { // doküman bulunmazsa özel hata durumu tanımladık
            err = new Error("Dokümanı bulamadık.");
            err.status = 404; // status tanımlamayı unutmayalım, error handler bakacaktır
            return next(err);
        }
        // soo.. req.quest is the question of the current request from now on
        req.question = doc; // eğer varsa, req nesnesine atamasını yaparız, talepte bulunan diğer MW ve route handler ların da işini görsün diye.
        next(); // sonraki MW ye paslarız
    });
});

//belirli bir cevap için geliştirmiş olduğumuz metod
router.param("aID", function(req, res, next, id) {
    req.answer = req.question.answers.id(id); // id metodu, alt dokümanın ID'sini alır ve eşleşen bu ID ile dokümanı geri gönderir
    if (!req.answer) {
        err = new Error("Dokümanı bulamadık.");
        err.status = 404;
        return next(err)
    }
    next();
});

// GET /questions 
// soruları görelim
router.get('/', (req, res, next) => {
    // Soruların hepsinin, oluşturulma zamanına göre (en güncel en üstte) gelmesini istiyoruz
    Question.find({}) // Tüm sonuçları aldık..            
            .sort({createdAt: -1}) // ..sıraladık ve icraa etmeye hazır hale getirdik. Sonrasında istediğin kadar ekleyebilirsin. Biz 1 tane ölçüt kullandık
            .exec((err, questions) => { // ..fonksiyonumuzu ateşledik
                if (err) return next(err);
                res.json(questions); // sorun yoksa fonksiyondaki callback kelimesi ile gönder kullanıcıya
            });
});

/* Üsttekine alternatif kısım, ama kullanmadık
router.get('/', (req, res, next) => {
    // Soruların hepsinin, oluşturulma zamanına göre (en güncel en üstte) gelmesini istiyoruz
    Question.find({}, null, {sort: {createdAt: -1}}, (err, questions) => { // null = opsiyonlu alanı kullanmak istemediğimizi belirtmek için. Zorunlu
        if (err) return next(err);
        res.json(questions); // sorun yoksa fonksiyondaki callback kelimesi ile gönder kullanıcıya
    });
});
*/

// GET /questions/:qID
// seçtiğimiz soruyu görelim
router.get('/:qID', (req, res, next) => {
        // arama ve hata işleri yukarıda hallediliyor zaten..
        res.json(req.question) // .. yukarıdaki handler ı çalıştırıp dokümanı kullanıcıya gönderdik.   
    }); 

// POST /questions 
// soru oluşturalım
router.post('/', (req, res, next) => {
    const question = new Question(req.body); // gelen veriyi const ladık..
    question.save(function(err, question) { // ..kaydedip fonksiyonu başlattık
        if (err) return next(err);
        res.status(201); // kullanıcıya başarılı kodu göndermek istedik
        res.json(question) // dokümanı kullancıya json olarak geri gönderdik
    });
});

// POST /questions/:qID/answers 
// cevap oluşturalım
router.post('/:qID/answers', (req, res, next) => {
    req.question.answers.push(req.body); // istediğimiz soruya (req.quest) ve cevaplarına (answers) ulaştık, şimdi girdiğimiz datayı ekle
    req.question.save( function(err, question) { // oluşturduğumuz dökümanı kaydet
        if (err) return next(err);
        res.status(201); // kullanıcıya kaynak başarıyla oluşturuldu dedik..
        res.json(question) // ..ve kaynağı gönderdik 
    });
});

// PUT /questions/:qID/answers/:aID
// belirli bir cevabı değiştirelim
router.put('/:qID/answers/:aID', (req, res) => {
    // models.js de update metodunu tanımlamıştık 
    req.answer.update(req.body, function(err, results) {
        if (err) return next(err);
        res.json(results);
    });
    /* EĞİTİM AMAÇLIYDI
    res.json({
        response: '/answers yoluna bir PUT talebi geldi sanırım.',
        questionId: req.params.qID,
        answerID: req.params.aID,
        body: req.body
    });
    */
});

// DELETE /questions/:qID/answers/:aID
// belirli bir cevabı silelim
router.delete('/:qID/answers/:aID', (req, res) => {
    //req.answer zaten önceden tanımladığımız haliyle, bize ID ye uygun cevabı getirdi
    req.answer.remove( function(err) {
        req.question.save( function(err, question) { // iç fonksiyon içerisinde parent question ı kaydederiz
            if (err) return next(err);
            res.json(question); // kaydettiğimiz haliyle de göndeririz
        });
    });
});

// POST /questions/:qID/answers/:aID/vote-up
// POST /questions/:qID/answers/:aID/vote-down
// belirli bir cevabı oylayalım
router.post('/:qID/answers/:aID/vote-:yol', (req, res, next) => { // araya MW koyarak, vote sonrasında rastgele bir kelimenin çalışmasını engellemeye çalıştık. 
    if (req.params.yol.search(/^(up|down)$/) === -1) { // search un sonucu: 0,1,2 .. array olacaktır. Olumsuz ise -1 gelir.
        var err = new Error("Adresi bulamadım!");
        err.status = 404;
        next(err);
    } else {
        // req.question ve req.answer varken req.vote neden olmasın; hemen tanımladık
        req.vote = req.params.yol;
        next();
    }
}, (req, res, next) => {
        // models.js te yazdığımız vote instance'ı, req.answer üzerinde kullanalım
        req.answer.vote(req.vote, function(err, question) {
            if (err) return next(err);
            res.json(question); // işlemleri kendisi halletti, kullanıcıya geri yolladık
        });
    /* res.json({ EĞİTİM AMAÇLIYDI
        response: '/vote-' + req.params.yol + ' üzerinden bir POST talebi geldi sanki',
        questionId: req.params.qID,
        answerID: req.params.aID,
        vote: req.params.yol
    });
    */
});

//ihraç ediyoruz
module.exports = router; 