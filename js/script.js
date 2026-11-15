var inputCari = document.getElementById("risma_cari");
var pilihUrut = document.getElementById("risma_urut");
var pesanKosong = document.getElementById("risma_kosong");

function ambilHarga(kartu) {
    return Number(kartu.querySelector(".risma_tambah".dataset.harga));
}

function ambilRating(kartu) {
    var teks = kartu.querySelector(".risma_kartu-info").textContent;
    var cocok = teks.match(/[0-9]+\.[0-9]+/);
    return cocok ? Number(cocok[0]) : 0;
}

function terapkanFilter(){
    var kata = inputCari.value.trim().toLowerCase();
    var urut = pilihUrut.value;
    var totalTampil = 0;

    document.querySelectorAll(".risma_kartu-daftar").forEach(function (grup){
        var daftar = Array.from(grup.children);

        daftar.sort(function (a, b){
            if (urut == "murah"){
                return ambilHarga(a) - ambilHarga(b);
            }
            if (urut == "mahal"){
                return ambilHarga(b) - ambilHarga(a);
            }
            if (urut == 'rating'){
                return ambilRating(b) - ambilRating(a);
            }
            return Number(a.dataset.urutan) - Number(b.dataset.urutan);
        });

        var tampilDiGrup = 0;

        daftar.forEach(function (kartu){
            grup.appendChild(kartu);

            var nama = kartu.querySelector("h3").textContent;
            var resto = kartu.querySelector(".risma_kartu-info").textContent;
            var cocok = (nama + " " + resto).toLowerCase().indexOf(kata) !== -1;

            kartu.style.display = cocok ? "" : "none";

            if (cocok) {
                tampilDiGrup++;
            }
        });

        var judul = grup.previousElementSibling;
        grup.style.display = tampilDiGrup > 0 ? "" : "none";
        if (judul) {
            judul.style.display = tampilDiGrup > 0 ? "" : "none";
        }
        totalTampil += tampilDiGrup
    });

    pesanKosong.hidden = totalTampil > 0;
}

if (inputCari && pilihUrut){
    document.querySelectorAll(".risma_kartu-daftar").forEach(function (grup){
        Array.from(grup.children).forEach(function (kartu, i){
            kartu.dataset.urutan = i;
        });
    });

    var kataAwal = new URLSearchParams(window.location.search).get("q");
    if (kataAwal){
        inputCari.value = kataAwal;
    }

    inputCari.addEventListener("input", terapkanFilter);
    pilihUrut.addEventListener("change", terapkanFilter);
    terapkanFilter();
}

function rp(angka) {
    return "Rp. " + angka.toLocaleString("id-ID");
}

function isiTeks(id, nilai){
    var el = document.getElementById(id);
    if (el) {
        el.textContent = nilai
    }
}

var ONGKIR = 8000;
var KUNCI = "risma_keranjang";

// ===== Fungsi bantu =====
function rp(angka) {
    return "Rp. " + angka.toLocaleString("id-ID");
}

function isiTeks(id, nilai) {
    var el = document.getElementById(id);
    if (el) {
        el.textContent = nilai;
    }
}

function ambilKeranjang() {
    try {
        return JSON.parse(localStorage.getItem(KUNCI)) || [];
    } catch (e) {
        return [];
    }
}

function perbaruiBadge() {
    var jumlah = 0;
    ambilKeranjang().forEach(function (it) {
        jumlah += it.jumlah;
    });
    isiTeks("risma_badge", jumlah > 0 ? jumlah : "");
}

function simpanKeranjang(data) {
    localStorage.setItem(KUNCI, JSON.stringify(data));
    perbaruiBadge();
}

function hitung(kode) {
    var subtotal = 0;
    ambilKeranjang().forEach(function (it) {
        subtotal += it.harga * it.jumlah;
    });
    var diskon = 0;
    if (kode.trim().toUpperCase() == "NYAM20" && subtotal > 50000) {
        diskon = subtotal * 0.2;
    }
    var ongkir = subtotal > 0 ? ONGKIR : 0;
    return {
        subtotal: subtotal,
        diskon: diskon,
        ongkir: ongkir,
        total: subtotal - diskon + ongkir
    };
}

function isiRingkasan(kode) {
    var h = hitung(kode);
    isiTeks("risma_sub", rp(h.subtotal));
    isiTeks("risma_ongkir", rp(h.ongkir));
    isiTeks("risma_diskon", "- " + rp(h.diskon));
    isiTeks("risma_total", rp(h.total));
}

// ===== Tombol "+ Tambah" =====

document.querySelectorAll(".risma_tambah").forEach(function (tombol) {
    tombol.addEventListener("click", function () {
        var data = ambilKeranjang();
        var id = tombol.dataset.id;
        var ada = data.find(function (it) {
            return it.id === id;
        });

        if (ada) {
            ada.jumlah++;
        } else {
            data.push({
                id: id,
                nama: tombol.dataset.nama,
                resto: tombol.dataset.resto,
                harga: Number(tombol.dataset.harga),
                emoji: tombol.dataset.emoji,
                jumlah: 1
            });
        }

        simpanKeranjang(data);
        tombol.textContent = "✓ Ditambahkan";
        setTimeout(function () {
            tombol.textContent = "+ Tambah";
        }, 1000);
    });
});

// ===== Halaman keranjang =====
var daftarItem = document.getElementById("risma_daftar_item");

function tampilKeranjang() {
    var data = ambilKeranjang();
    var html = "";

    if (data.length === 0) {
        html = '<p class="risma_kosong">Keranjang masih kosong 🛒<br>Yuk pilih menu dulu.</p>';
    }

    data.forEach(function (it, i) {
        html += '<div class="risma_item">' +
            '<div class="risma_item-emoji">' + it.emoji + '</div>' +
            '<div class="risma_item-info"><h3>' + it.nama + '</h3><p>' + it.resto + '</p>' +
            '<span class="risma_kartu-harga">' + rp(it.harga) + '</span></div>' +
            '<div class="risma_item-jumlah"><span>Jumlah</span><div class="risma_qty">' +
            '<button data-aksi="kurang" data-i="' + i + '">−</button>' +
            '<b>' + it.jumlah + '</b>' +
            '<button data-aksi="tambah" data-i="' + i + '">+</button></div></div>' +
            '<div class="risma_item-subtotal">' + rp(it.harga * it.jumlah) + '</div>' +
            '</div>';
    });

    daftarItem.innerHTML = html;
    isiRingkasan("");
}

if (daftarItem) {
    daftarItem.addEventListener("click", function (e) {
        var aksi = e.target.dataset.aksi;
        if (!aksi) {
            return;
        }
        var data = ambilKeranjang();
        var i = Number(e.target.dataset.i);

        if (aksi == "tambah") {
            data[i].jumlah++;
        } else {
            data[i].jumlah--;
        }
        if (data[i].jumlah <= 0) {
            data.splice(i, 1);
        }

        simpanKeranjang(data);
        tampilKeranjang();
    });
    tampilKeranjang();
}

// ===== Halaman checkout =====
var ringkasItem = document.getElementById("risma_ringkas_item");
var inputPromo = document.getElementById("risma_promo");

if (ringkasItem) {
    var dataCo = ambilKeranjang();
    var htmlCo = "";

    if (dataCo.length === 0) {
        htmlCo = '<p class="risma_kosong">Keranjang kosong. <a href="menu.html">Pilih menu</a></p>';
    }
    dataCo.forEach(function (it) {
        htmlCo += '<div class="risma_baris"><span>' + it.jumlah + 'x ' + it.nama +
            '</span><span>' + rp(it.harga * it.jumlah) + '</span></div>';
    });
    ringkasItem.innerHTML = htmlCo;
}

if (inputPromo) {
    inputPromo.addEventListener("input", function () {
        isiRingkasan(inputPromo.value);
    });
    isiRingkasan(inputPromo.value);

    var formCheckout = document.querySelector(".risma_form");
    formCheckout.addEventListener("submit", function (e) {
        if (ambilKeranjang().length === 0) {
            e.preventDefault();
            alert("Keranjang masih kosong. Pilih menu dulu ya!");
        }
    });
}

// ===== Halaman berhasil =====

if (document.getElementById("risma_out_nomor")) {
    var params = new URLSearchParams(window.location.search);
    var bayar = {
        cod: "Bayar di Tempat (COD)",
        ewallet: "E-Wallet",
        transfer: "Transfer Bank"
    };
    var pesanan = null;

    if (ambilKeranjang().length > 0) {
        var h = hitung(params.get("promo") || "");
        pesanan = {
            nomor: "NA-" + Math.floor(100000 + Math.random() * 900000),
            total: h.total
        };
        localStorage.setItem("risma_pesanan", JSON.stringify(pesanan));
        localStorage.removeItem(KUNCI);
    } else {
        try {
            pesanan = JSON.parse(localStorage.getItem("risma_pesanan"));
        } catch (e) {
            pesanan = null;
        }
    }

    isiTeks("risma_out_nomor", pesanan ? pesanan.nomor : "-");
    isiTeks("risma_out_nama", params.get("nama") || "Pelanggan");
    isiTeks("risma_out_alamat", params.get("alamat") || "-");
    isiTeks("risma_out_bayar", bayar[params.get("bayar")] || "-");
    isiTeks("risma_out_total", rp(pesanan ? pesanan.total : 0));
}

// ===== Halaman menu: cari dan urutkan =====
var inputCari = document.getElementById("risma_cari");
var pilihUrut = document.getElementById("risma_urut");
var pesanKosong = document.getElementById("risma_kosong");

function ambilHarga(kartu) {
    return Number(kartu.querySelector(".risma_tambah").dataset.harga);
}

function ambilRating(kartu) {
    var teks = kartu.querySelector(".risma_kartu-info").textContent;
    var cocok = teks.match(/[0-9]+\.[0-9]+/);
    return cocok ? Number(cocok[0]) : 0;
}

function terapkanFilter() {
    var kata = inputCari.value.trim().toLowerCase();
    var urut = pilihUrut.value;
    var totalTampil = 0;

    document.querySelectorAll(".risma_kartu-daftar").forEach(function (grup) {
        var daftar = Array.from(grup.children);

        daftar.sort(function (a, b) {
            if (urut == "murah") {
                return ambilHarga(a) - ambilHarga(b);
            }
            if (urut == "mahal") {
                return ambilHarga(b) - ambilHarga(a);
            }
            if (urut == "rating") {
                return ambilRating(b) - ambilRating(a);
            }
            return Number(a.dataset.urutan) - Number(b.dataset.urutan);
        });

        var tampilDiGrup = 0;

        daftar.forEach(function (kartu) {
            grup.appendChild(kartu);

            var nama = kartu.querySelector("h3").textContent;
            var resto = kartu.querySelector(".risma_kartu-info").textContent;
            var cocok = (nama + " " + resto).toLowerCase().indexOf(kata) !== -1;

            kartu.style.display = cocok ? "" : "none";
            if (cocok) {
                tampilDiGrup++;
            }
        });

        var judul = grup.previousElementSibling;
        grup.style.display = tampilDiGrup > 0 ? "" : "none";
        if (judul) {
            judul.style.display = tampilDiGrup > 0 ? "" : "none";
        }
        totalTampil += tampilDiGrup;
    });

    pesanKosong.hidden = totalTampil > 0;
}

if (inputCari && pilihUrut) {
    document.querySelectorAll(".risma_kartu-daftar").forEach(function (grup) {
        Array.from(grup.children).forEach(function (kartu, i) {
            kartu.dataset.urutan = i;
        });
    });

    var kataAwal = new URLSearchParams(window.location.search).get("q");
    if (kataAwal) {
        inputCari.value = kataAwal;
    }

    inputCari.addEventListener("input", terapkanFilter);
    pilihUrut.addEventListener("change", terapkanFilter);
    terapkanFilter();
}

// ===== Semua halaman: angka di ikon keranjang =====
perbaruiBadge();