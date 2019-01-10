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
        size: String, //{type: String, default: "small"},
        color: {type: String, default: "golden"},
        mass: {type: Number, default: 0.007},
        name: {type: String, default: "Angela"}
    });

    AnimalSchema.pre("save", function (next) { // ön kayıtlayıp devam ediyoruz. dinamik içerik oluşturmamıza yardımcı olur. Bu arada () => yapısını kullanamazsın.
        if (this.mass >= 100) { // this = kaydedilecek döküman veya modeli işaret eder (Animal)
            this.size = "big";
        } else if (this.mass >= 5 && this.mass < 100) {
            this.size = "medium";
        } else {
            this.size = "small";
        }
        next();
    });

    // Statik metodu, verimize ulaşmak için şema üzerine direkt olarak fonk. oluşturmamızı sağlar
    AnimalSchema.statics.findSize = function (size, callback) { // fonksiyon ile bağlantı kurabilmek için "callback" geçtik.
        return this.find({size: size}, callback); // this = şema
    }

    // Belirlediğimiz hayvan ile aynı renkte olanları çağırmak istiyoruz
    AnimalSchema.methods.findSameColor = function (callback) { 
        return this.model("Animal").find({color: this.color}, callback); // Hangi şemaya ulaşmak istediğimizi belirttik("Animal") // this = doküman // Renk = Söz konusu olan nesnenin rengi
    }

    const Animal = mongoose.model("Animal", AnimalSchema); // Şemayı isimlendirdik. Veritabanına koleksiyon olarak kaydedildiğinde çoğaltarak isimlendirir. Bizim örneğimizde "Animals"

    const elephant = new Animal({ // Şemayı doldurduk
        type: "elephant",
        // size: "büyük",
        color: "gray",
        mass: 6000,
        name: "Kutay"
    });

    const animal = new Animal({}); // default değerleri tetiklemek için kodu yerleştirdik

    const whale = new Animal({ // default un üzerine yazma testi amacıyla. color belirtmedik, default tan alsın.
        type: "whale",
        // size: "büyük",
        mass: 190500,
        name: "Enes"
    });

    const animalData = [
        {
            type: "mouse",
            color: "gray",
            mass: 0.035,
            name: "Marvin"
        },
        {
            type: "nutria",
            color: "brown",
            mass: 6.35,
            name: "Gretchen" 
        },
        {
            type: "wolf",
            color: "gray",
            mass: 45,
            name: "Iris"
        },
        elephant,
        animal,
        whale
    ];

    Animal.remove({}, (err) => { // tekrar kaydetmesin diye önce siliyoruz. querry object ile neyi sileceğini belirtebiliriz fakat burada herşeyi silsin istedik.
        // silme işleminden sonra başlasın diye "elephant.save()" fonksiyonunun hepsini buraya taşıdık
        if (err) console.error(err);
        Animal.create(animalData, (err, animals) => { // aşağıda comment-out ladığımız kısmın yerine bu özelliği sunduk
        /* elephant.save((err) => {  // Demez isek fil imizi kaydetmez
            if (err) console.error(err);
            animal.save((err) => { // default u buraya yerleştirdik, senkronizasyon dışı bir işlem yapmasın diye
                if (err) console.error(err);
                whale.save((err) => { // default üzerine yazacak şekilde balina mızı buraya yerleştirdik */
            if (err) console.error(err);
            // Birden fazla değişiklikten sonra comment-out ladık
            // Animal.findSize("big", (err, animals) => { // ilk parametre: sonuçlarla eşleşecek anahtar ve değerleri içerir. Direkt küçük olanları bulacak findSmall fonksiyonunu sunduğumuzda çıkartmıştık. şimdiki haliyle istediğimizi aratabiliyoruz. İkinci parametre hata ve arama sonuçlarını içerir
            Animal.findOne({type: "elephant"}, (err, elephant) => { // belirttiğimiz özellikteki ilk nesneyi bulduk ve sonra içine yazdığımız fonksiyonu çalıştırdık
                elephant.findSameColor(function(err, animals) {
                    if (err) console.error(err);
                    animals.forEach((animal) => {
                        if (err) console.error(err); // Bu yoktu, ben ekledim
                        console.log(animal.name + " the " + animal.color + " " + animal.type + " is a " + animal.size + "-sized animal.");
                    });
                    db.close(() => { // "Bitince kapatalım" komutu. Kayıt işlemi bitmeden önce kapatmasın diye kayıt işlemine dahil ettik, son sıraya girsin.
                        console.log("Bağlantıyı kapattım hadi..");
                    });
                });
            });
        });    
    });
});