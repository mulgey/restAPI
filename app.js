'use strict'; // "vira" yerine geçer, daha iyi kod yazmamızı sağlar imiş.

// express i kuruyoruz
const express = require('express');
const app = express();

// json lar ile ilgileniyoruz
const jsonParser = require('body-parser').json; // sahip olduğu yeteneklerden json ile çalışmak istedik
app.use(jsonParser()); // bundan sonraki tüm req ler işlendiğinde gövdesi json olarak parse lanacaktır, req.body den ulaşılabilir, süper. routes vs bunun altında olsun lütfen

// morgen lütfen
const logger = require('morgan');
app.use(logger("dev")); // bu sayede terminalimizde bol bol "HTTPVerb + URL + statusCode" bilgisi alacağız

// routes u ithal edelim
const routes = require('./routes');
app.use('/questions', routes); // sadece questions yolağında çalışacak şekilde ayarladık

// MONGOOSE HERE
// mongoose kurulumu
const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/QA");
const db = mongoose.connection;

// hata yönetimi
db.on("error", (err) => {
    console.error("connection error:", err)
});

db.once("open", () => { // db.on olay her cerayan ettiğinde çalışırken, db.once sadece ilkinde tek sefer için çalışır. bazı hallerde iyi gider.
    console.log("db bağlandı, haberin olsun");
    // Veritabanına ilişkin bütün iletişim buraya lütfen.
});

// 404 ü yakalayıp, temel olan "error handler" a ilet
app.use((req, res, next) => {
    var err = new Error("Adresi bulamadık!");
    err.status = 404;
    next(err);
});

// temel Error Handler
app.use((err, req, res, next) => { // sadece temel olanda "err" bulunur
    res.status(err.status || 500); // hata nesnesinin status özelliği varsa, onu ayarlarız. Internal server error => undefined => 500
    res.json({ // Hata kullanıcıya json olarak gönderilir
        error: {
            message: err.message
        }
    }); 
});

/* MİDDLEWARE SHOWCASE
app.use((req, res, next) => { // Route tanımlanmadığı için her şartta çalışır
    console.log("Middleware, ilk örneği");
    req.benimMesaj = "Selam 2 no'lu MW"; // 1 de oluşturup 2 de kullanabilmemize bir örnek
    next();
});

app.use('/different/:id', (req, res, next) => {
    console.log("Middleware, ikinci örneği, ID:", req.params.id); // different route u altındaki her route için route bilgisi vererek konsola yansıtır
    console.log(req.benimMesaj); // 1'den aldığımızı kullanabildik
    next();
});

app.use((req, res, next) => { // Route tanımlanmadığı için her şartta çalışır
    console.log("Bu sınavdan alabileceğin not olsa olsa", req.query.not); // " localhost:3000?not=pekiyi " adresi örneğinde kullandık
    next();
});
*/

// port u kuruyoruz. Üretim ortamında olmazsa eğer port olarak 3000'i değerlendirecektir
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("Express", port, "portunda görüşlerinize hazırdır!")
});

