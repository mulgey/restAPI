'use strict';

// mongoose kurulumu
const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/sandbox");
const db = mongoose.connection;

// hata yönetimi
db.on("error", (err) => {
    console.error("connection error:", err)
});

db.once("open", () => { // db.on olay her cerayan ettiğinde çalışırken, db.once sadece ilkinde tek sefer için çalışır. bazı hallerde iyi gider.
    console.log("db bağlandı, haberin olsun");
    // Veritabanına ilişkin bütün iletişim buraya lütfen.
    const Schema = mongoose.Schema; // Şema için açılışı yaptık
    const AnimalSchema = new Schema({ // Şemayı çizdik.
        type: String,
        size: String,
        color: String,
        mass: Number,
        name: String
    });

    const Animal = mongoose.model("Animal", AnimalSchema); // Şemayı isimlendirdik. Veritabanına koleksiyon olarak kaydedildiğinde çoğaltarak isimlendirir. Bizim örneğimizde "Animals"

    const elephant = new Animal({ // Şemayı doldurduk
        type: "fil",
        size: "büyük",
        color: "gri",
        mass: 6000,
        name: "Kutay"
    });

    elephant.save((err) => {  // Demez isek kaydetmez
        if (err) console.error("Kayıt başarısız.", err);
        else console.log("Kaydettim!");
        db.close(() => { // "Bitince kapatalım" komutu. Kayıt işlemi bitmeden önce kapatmasın diye kayıt işlemine dahil ettik, son sıraya girsin.
            console.log("Bağlantıyı kapattım hadi..")
        }); 
    });
}); 