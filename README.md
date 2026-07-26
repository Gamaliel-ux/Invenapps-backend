# 🛡️ InvenPro - Enterprise API & Security Engine (Backend)

InvenPro Backend adalah server REST API tangguh yang dibangun menggunakan **NestJS**, **TypeScript**, dan **Prisma ORM** dengan database **PostgreSQL**. Backend ini mengendalikan seluruh logika bisnis, transaksi logistik aman, pengawasan kepatuhan audit, dan protokol keamanan data inventaris.

---

## 🔒 Fitur Keamanan & Otentikasi Utama

### 1. Multi-Factor Authentication (MFA)
* Mengamankan hak akses khusus peran **ADMIN** menggunakan skema Time-based One-time Password (TOTP) yang ditenagai oleh pustaka `otplib` v12.
* Login Admin akan mengembalikan respons tantangan `mfaRequired` beserta token sementara (`mfaToken`). Sesi login penuh dan JWT token utama baru akan diterbitkan setelah kode OTP 6 digit berhasil divalidasi.

### 2. Kebijakan Brute-Force Lockout
* Melindungi akun operator dari serangan brute-force.
* Akun pengguna otomatis dinonaktifkan sementara (terkunci selama **5 menit**) jika salah memasukkan kata sandi sebanyak **3 kali** berturut-turut.
* Kolom `loginAttempts` dan `lockUntil` dikelola langsung di database PostgreSQL untuk menjaga persistensi status lockout.

### 3. Proteksi CORS (Cross-Origin Resource Sharing) Dinamis
* Mengizinkan koneksi dari `localhost` pada port apa saja untuk mempermudah tahap pengembangan.
* Menyaring domain produksi eksternal secara aman menggunakan daftar putih eksplisit (`allowedOrigins`) dan variabel lingkungan dinamis (`CORS_ORIGIN` di dalam berkas `.env`).

---

## 🏗️ Struktur Skema Database (Prisma PostgreSQL)

* **User**: Profil operator dengan atribut `Role` (ADMIN, MANAGER, STAFF), penanda MFA, dan catatan status kunci (*lockout*).
* **Product**: Menyimpan data SKU, barcode unik, harga beli/jual, stok riil, serta ambang batas stok minimum (`minStock`).
* **PurchaseOrder & SalesOrder**: Mengelola dokumen transaksi pengadaan barang (dari supplier) dan penjualan ritel (ke customer), lengkap beserta riwayat transisi status pembayaran/penerimaan barang.
* **StockMovement & StockOpname**: Mencatat mutasi inventaris secara rinci (IN, OUT, ADJUSTMENT, RETURN, TRANSFER) dan data rekonsiliasi audit fisik gudang.
* **AuditLog & Notification**: Log audit kepatuhan aktivitas sistem (siapa, melakukan apa, kapan) serta data antrean peringatan tingkat stok barang gudang.

---

## ⚙️ Cara Menjalankan Project (Local Development)

### 1. Prasyarat
* Node.js versi 18 atau 20+
* Docker / PostgreSQL server lokal yang sedang berjalan

### 2. Konfigurasi Lingkungan (`.env`)
Salin berkas konfigurasi lingkungan dan sesuaikan kredensial PostgreSQL Anda:
```env
DATABASE_URL="postgresql://postgres:gama@localhost:5432/inventory_pt"
JWT_SECRET="super_secret_jwt_key_invenapps_2026"
PORT=3000
CORS_ORIGIN="http://localhost:3001,http://localhost:3002"
```

### 3. Jalankan Migrasi Database & Prisma Client
```bash
# Instalasi dependensi
npm install

# Jalankan migrasi schema ke PostgreSQL
npx prisma db push

# Generate Prisma Client Types
npx prisma generate
```

### 4. Seed Awal Akun Operator (Penting)
Untuk memasukkan akun bawaan awal (*seeded users*):
* `Gama` (Role: `ADMIN`, Password: `password123`, memiliki MFA)
* `Staff` (Role: `STAFF`, Password: `password123`)
* `Manager` (Role: `MANAGER`, Password: `password123`)

Jalankan perintah berikut:
```bash
npx prisma db seed
```

### 5. Jalankan Backend Server
```bash
# Mode Development (Auto-Reload)
npm run start:dev

# Mode Produksi
npm run build
npm run start:prod
```
Server backend akan aktif di alamat `http://localhost:3000/api`.

---

## 📋 Pengujian & Dokumentasi API

* **Swagger API Docs**: Dokumentasi interaktif REST API secara lengkap dapat langsung diakses di alamat: `http://localhost:3000/api/docs`
* **Unit Testing**: Jalankan test suite terintegrasi (Jest) untuk memverifikasi logika login, registrasi, dan MFA:
  ```bash
  npm run test
  ```
