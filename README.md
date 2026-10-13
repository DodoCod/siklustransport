# Ringkasan Transportasi

Dashboard Next.js untuk tab Ringkasan pada spreadsheet sumber.

## Menjalankan

    npm install
    npm run dev

Buka http://localhost:3000.

## Fitur

- Tiga jalur terpisah: Jemput Day 1, Antar Day 2, dan Jemput Day 2.
- Pencarian nama/kelompok, filter kelompok dan lokasi, serta tampilan kartu atau tabel.
- Tombol WhatsApp per peserta.
- Data awal tersimpan di lib/summary-data.js.
- Tombol sinkronisasi mengambil data terbaru melalui /api/ringkasan dari Google Visualization endpoint spreadsheet.
