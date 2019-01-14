'use strict';

// Giriş bölümü
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// pre-save içerisinde cevapları nasıl sıralayacağımızı belirliyoruz
const sortAnswers = function (a,b) {
    // a önce olacaksa (-)
    // değişiklik olmayacaksa (0)
    // b önce olacaksa (+)
    if (a.votes === b.votes) { // oylar eşitse buraya göre sıradık
        return b.updatedAt - a.updatedAt;
        // Bu kısım uzun olduğu için iptal ettik, direkt çıkartma işlemi
        /* if(a.updatedAt > b.updatedAt) {
            return -1;
        } else if(a.updatedAt < b.updatedAt) {
            return 1;
        } else {
            return 0;
        } */
    }
    return b.votes - a.votes; // oylar eşit değilse güncelliğine göre sıraladık
}

const AnswerSchema = new Schema({
    text: String,
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
    votes: {type: Number, default:0}
});

// cevap üzerinde yapılan değişiklikleri yansıtmak için. Soru şemasının üstünde olmalı
AnswerSchema.method("update", function (updates, callback) { // sandbox tan farklı bir instance örneği
    // Object.assign kalıbı: güncellemeri cevap dokümanında birleştirmek için. 1) Döküman (this = Cevap şeması) 2)fonksiyondaki güncelleme nesnesi (ismi) 3) Uyguladığımız güncelleme
    Object.assign(this, updates, {updatedAt: new Date()});
    // Parent dökümana kaydetmeliyiz. son işlem = kayıt = callback
    this.parent().save(callback);
});

// yapılan oylamaları yansıtmak için. Soru şemasının üstünde olmalı
AnswerSchema.method("vote", function (vote, callback) {
    if (vote === "up") {
        this.votes += 1; // Cevaplar şeması içindeki votes kısmına +1 (integer)
    } else {
        this.votes -=1;
    }
    // Parent dökümana kaydetmeliyiz. son işlem = kayıt = callback
    this.parent().save(callback);
});

const QuestionSchema = new Schema({
    text: String,
    createdAt: {type: Date, default: Date.now},
    answers: [AnswerSchema] // projemiz için temel olan parent-child ilişkisini kurmuş oluruz
});

// cevaplar değiştirildiğinde veya oy verildiğinde, sırasının bozulmamasını istiyoruz
QuestionSchema.pre("save", function(next) {
    this.answers.sort(sortAnswers); // this = QuestionSchema. yukarıdaki fonksiyona göre kayıt yapacaktır bundan sonra
    next();
});

const Question = mongoose.model("Question", QuestionSchema); // QuestionSchema şemamızı routes ta kullanmak üzere ihraç ediyoruz

module.exports.Question = Question;