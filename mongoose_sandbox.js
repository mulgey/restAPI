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
        type: {type: String, default: "goldfish"}, //default değerler de atadık
        size: {type: String, default: "small"},
        color: {type: String, default: "golden"},
        mass: {type: Number, default: "0.007"},
        name: {type: String, default: "Angela"}
    });

    const Animal = mongoose.model("Animal", AnimalSchema); // Şemayı isimlendirdik. Veritabanına koleksiyon olarak kaydedildiğinde çoğaltarak isimlendirir. Bizim örneğimizde "Animals"

    const elephant = new Animal({ // Şemayı doldurduk
        type: "fil",
        size: "büyük",
        color: "gri",
        mass: 6000,
        name: "Kutay"
    });

    const animal = new Animal({}); // default değerleri tetiklemek için kodu yerleştirdik

    const whale = new Animal({ // default un üzerine yazma testi amacıyla. color belirtmedik, default tan alsın.
        type: "whale",
        size: "büyük",
        mass: 190500,
        name: "Enes"
    });

    Animal.remove({}, (err) => { // tekrar kaydetmesin diye önce siliyoruz. querry object ile neyi sileceğini belirtebiliriz fakat burada herşeyi silsin istedik.
        // silme işleminden sonra başlasın diye "elephant.save()" fonksiyonunun hepsini buraya taşıdık
        if (err) console.error(err);
        elephant.save((err) => {  // Demez isek fil imizi kaydetmez
            if (err) console.error(err);
            animal.save((err) => { // default u buraya yerleştirdik, senkronizasyon dışı bir işlem yapmasın diye
                if (err) console.error(err);
                whale.save((err) => { // default üzerine yazacak şekilde balina mızı buraya yerleştirdik
                    if (err) console.error(err);
                    Animal.find({size: "büyük"}, (err, animals) => { // ilk parametre: sonuçlarla eşleşecek anahtar ve değerleri içerir. ikinci parametre hata ve arama sonuçlarını içerir
                        animals.forEach((animal) => {
                            if (err) console.error(err); // Bu yoktu, ben ekledim
                            console.log(animal.name + " the " + animal.color + " " + animal.type);
                        });
                        db.close(() => { // "Bitince kapatalım" komutu. Kayıt işlemi bitmeden önce kapatmasın diye kayıt işlemine dahil ettik, son sıraya girsin.
                            console.log("Bağlantıyı kapattım hadi..");
                        });
                    });
                });        
            }); 
        });
    }); 
}); 