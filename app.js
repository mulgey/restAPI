'use strict'; // "vira" yerine geçer, daha iyi kod yazmamızı sağlar imiş.

// express i kuruyoruz
const express = require('express');
const app = express();

// json lar ile ilgileniyoruz
const jsonParser = require('body-parser').json; // sahip olduğu yeteneklerden json ile çalışmak istedik
app.use(jsonParser()); // bundan sonraki tüm req ler işlendiğinde gövdesi json olarak parse lanacaktır, req.body den ulaşılabilir, süper

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

