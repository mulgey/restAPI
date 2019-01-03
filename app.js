'use strict'; // "vira" yerine geçer, daha iyi kod yazmamızı sağlar imiş.

// express i kuruyoruz
const express = require('express');
const app = express();

// port u kuruyoruz. Üretim ortamında olmazsa eğer port olarak 3000'i değerlendirecektir
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("Express", port, "portunda görüşlerinize hazırdır!")
});