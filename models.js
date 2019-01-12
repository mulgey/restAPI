'use strict';

// Giriş bölümü
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// cevapları nasıl sıralayacağımızı belirliyoruz
const sortAnswers = function (a,b) {
    // a önce olacaksa (-)
    // değişiklik olmayacaksa (0)
    // b önce olacaksa (+)
    if (a.votes === b.votes) {
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
    return b.votes - a.votes;
}

const AnswerSchema = new Schema({
    text: String,
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
    votes: {type: Number, default:0}
});

// cevap üzerinde yapılan değişiklikleri yansıtmak için
AnswerSchema.method("update", function (updates, callback) { // sandbox tan farklı bir instance örneği
    Object.assign(this, updates, {updatedAt: new Date()}); // güncellemeri cevap dokümanında birleştirmek için (this=dökümana, updates=güncelle ve yeni tarih)
    this.parent().save(callback); // this.parent = answer dan question a.. kayıt = son işlem = callback 
});

AnswerSchema.method("vote", function (vote, callback) {
    if (vote === "up") {
        this.votes += 1;
    } else {
        this.votes -=1;
    }
    this.parent().save(callback);
});

const QuestionSchema = new Schema({
    text: String,
    createdAt: {type: Date, default: Date.now},
    answers: [AnswerSchema] 
});

// cevaplar değiştirildiğinde veya oy verildiğinde, sırasının bozulmamasını istiyoruz
QuestionSchema.pre("save", function(next) {
    this.answers.sort(sortAnswers);
    next();
});

const Question = mongoose.model("Question", QuestionSchema);

module.exports.Question = Question;