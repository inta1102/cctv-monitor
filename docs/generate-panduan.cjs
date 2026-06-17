const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, Header, Footer, PageNumber, UnderlineType,
} = require('docx');
const fs = require('fs');

const BLUE    = "1F4E79";
const LBLUE   = "2E75B6";
const LCYAN   = "D6E4F0";
const LGREEN  = "E2EFDA";
const LYELLOW = "FFF2CC";
const LGRAY   = "F2F2F2";
const RED     = "C00000";
const GREEN   = "375623";
const ORANGE  = "833C00";
const WHITE   = "FFFFFF";

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 320, after: 160 },
    children: [new TextRun({ text, bold: true, size: 36, color: WHITE, font: "Arial" })],
    shading: { fill: BLUE, type: ShadingType.CLEAR },
    indent: { left: 200, right: 200 },
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: LBLUE } },
    children: [new TextRun({ text, bold: true, size: 28, color: BLUE, font: "Arial" })],
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text, bold: true, size: 24, color: LBLUE, font: "Arial" })],
  });
}

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 60, after: 80 },
    children: [new TextRun({ text, size: 22, font: "Arial", ...opts })],
  });
}

function bold(text) { return new TextRun({ text, bold: true, size: 22, font: "Arial" }); }
function code(text) { return new TextRun({ text, font: "Courier New", size: 20, color: "C7254E", highlight: "yellow" }); }
function normal(text) { return new TextRun({ text, size: 22, font: "Arial" }); }

function bullet(children, level = 0) {
  return new Paragraph({
    numbering: { reference: "bullets", level },
    spacing: { before: 40, after: 40 },
    children: typeof children === "string"
      ? [new TextRun({ text: children, size: 22, font: "Arial" })]
      : children,
  });
}

function numbered(children, level = 0) {
  return new Paragraph({
    numbering: { reference: "numbers", level },
    spacing: { before: 60, after: 60 },
    children: typeof children === "string"
      ? [new TextRun({ text: children, size: 22, font: "Arial" })]
      : children,
  });
}

function codeBlock(lines, fillColor = "F8F8F8") {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [new TableRow({
      children: [new TableCell({
        borders: {
          top: { style: BorderStyle.SINGLE, size: 2, color: "AAAAAA" },
          bottom: { style: BorderStyle.SINGLE, size: 2, color: "AAAAAA" },
          left: { style: BorderStyle.THICK, size: 8, color: LBLUE },
          right: { style: BorderStyle.SINGLE, size: 2, color: "AAAAAA" },
        },
        shading: { fill: fillColor, type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 100, left: 160, right: 100 },
        width: { size: 9360, type: WidthType.DXA },
        children: lines.map(line => new Paragraph({
          spacing: { before: 20, after: 20 },
          children: [new TextRun({ text: line, font: "Courier New", size: 18, color: "1A1A2E" })],
        })),
      })]
    })]
  });
}

function infoBox(text, fillColor = LCYAN, iconText = "INFO") {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [800, 8560],
    rows: [new TableRow({
      children: [
        new TableCell({
          borders,
          shading: { fill: LBLUE, type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          width: { size: 800, type: WidthType.DXA },
          verticalAlign: "center",
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: iconText, bold: true, size: 18, color: WHITE, font: "Arial" })],
          })],
        }),
        new TableCell({
          borders,
          shading: { fill: fillColor, type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 160, right: 120 },
          width: { size: 8560, type: WidthType.DXA },
          children: [new Paragraph({
            spacing: { before: 0, after: 0 },
            children: [new TextRun({ text, size: 21, font: "Arial" })],
          })],
        }),
      ]
    })]
  });
}

function warningBox(text) { return infoBox(text, LYELLOW, "!"); }
function noteBox(text)    { return infoBox(text, LGREEN,  "OK"); }

function space(n = 120) {
  return new Paragraph({ spacing: { before: n, after: 0 }, children: [new TextRun("")] });
}

function softwareRow(no, name, version, why, required) {
  const reqColor = required ? "C00000" : "375623";
  const reqText  = required ? "WAJIB" : "Opsional";
  return new TableRow({
    children: [
      cell(no, LGRAY, 480),
      cell(name, WHITE, 2200, true),
      cell(version, WHITE, 1800),
      cell(why, WHITE, 3680),
      new TableCell({
        borders,
        shading: { fill: required ? "FFE0E0" : LGREEN, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        width: { size: 1200, type: WidthType.DXA },
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: reqText, bold: true, size: 20, color: reqColor, font: "Arial" })],
        })],
      }),
    ]
  });
}

function cell(text, fill, w, bold2 = false) {
  return new TableCell({
    borders,
    shading: { fill, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    width: { size: w, type: WidthType.DXA },
    children: [new Paragraph({
      children: [new TextRun({ text, size: 20, font: "Arial", bold: bold2 })],
    })],
  });
}

function headerRow(cols, widths) {
  return new TableRow({
    tableHeader: true,
    children: cols.map((c, i) => new TableCell({
      borders,
      shading: { fill: BLUE, type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      width: { size: widths[i], type: WidthType.DXA },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: c, bold: true, size: 20, color: WHITE, font: "Arial" })],
      })],
    }))
  });
}

// ─── DOCUMENT ────────────────────────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "•",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }, {
          level: 1, format: LevelFormat.BULLET, text: "◦",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 1080, hanging: 360 } } }
        }],
      },
      {
        reference: "numbers",
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }, {
          level: 1, format: LevelFormat.DECIMAL, text: "%1.%2.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 1080, hanging: 360 } } }
        }],
      },
    ],
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: WHITE },
        paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: BLUE },
        paragraph: { spacing: { before: 280, after: 120 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: LBLUE },
        paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 2 } },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 },
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: LBLUE } },
          children: [
            new TextRun({ text: "CCTV Monitor ", bold: true, size: 22, color: BLUE, font: "Arial" }),
            new TextRun({ text: "  Panduan Instalasi di PC Kantor", size: 22, color: "555555", font: "Arial" }),
          ],
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" } },
          children: [
            new TextRun({ text: "PT BPR Madani Sejahtera Abadi  |  Tim IT  |  Halaman ", size: 18, color: "888888", font: "Arial" }),
            new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "888888", font: "Arial" }),
          ],
        })]
      })
    },
    children: [

      // ── COVER ──────────────────────────────────────────────────────────────
      new Paragraph({
        spacing: { before: 1200, after: 0 },
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "CCTV Monitor", bold: true, size: 72, color: BLUE, font: "Arial" })],
      }),
      new Paragraph({
        spacing: { before: 80, after: 0 },
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Sistem Monitoring Kamera Kantor", size: 36, color: "444444", font: "Arial" })],
      }),
      space(160),
      new Paragraph({
        spacing: { before: 0, after: 0 },
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "PANDUAN INSTALASI DI PC KANTOR", bold: true, size: 40, color: WHITE, font: "Arial",
          shading: { fill: LBLUE, type: ShadingType.CLEAR } })],
      }),
      space(300),
      new Table({
        width: { size: 5000, type: WidthType.DXA },
        alignment: AlignmentType.CENTER,
        columnWidths: [2500, 2500],
        rows: [
          new TableRow({ children: [
            cell("Versi", LGRAY, 2500, true),
            cell("1.0", WHITE, 2500),
          ]}),
          new TableRow({ children: [
            cell("Tanggal", LGRAY, 2500, true),
            cell("Juni 2026", WHITE, 2500),
          ]}),
          new TableRow({ children: [
            cell("Dibuat oleh", LGRAY, 2500, true),
            cell("Tim IT", WHITE, 2500),
          ]}),
        ]
      }),
      new Paragraph({ children: [new TextRun("")], pageBreakBefore: true }),

      // ── 1. GAMBARAN UMUM ───────────────────────────────────────────────────
      h1("  1.  GAMBARAN UMUM"),
      space(),
      p("CCTV Monitor adalah aplikasi web berbasis Laravel yang dijalankan di PC kantor (bukan hosting internet). Aplikasi ini secara otomatis memantau kondisi kamera CCTV dalam 3 level:"),
      space(80),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1200, 2000, 6160],
        rows: [
          headerRow(["Level", "Nama", "Yang Dipantau"], [1200, 2000, 6160]),
          new TableRow({ children: [
            cell("Level 1", LCYAN, 1200, true),
            cell("Network", WHITE, 2000),
            cell("Ping ke IP device (DVR, IP Camera, Switch). Alert jika tidak merespon.", WHITE, 6160),
          ]}),
          new TableRow({ children: [
            cell("Level 2", LCYAN, 1200, true),
            cell("Service", WHITE, 2000),
            cell("Cek port RTSP/HTTP/ONVIF. Alert jika port tidak bisa diakses.", WHITE, 6160),
          ]}),
          new TableRow({ children: [
            cell("Level 3", LCYAN, 1200, true),
            cell("Visual", WHITE, 2000),
            cell("Ambil snapshot dari stream RTSP. Deteksi blank, gelap, no-signal, atau freeze. Alert jika gambar tidak normal.", WHITE, 6160),
          ]}),
        ]
      }),
      space(120),
      p("Jika ada device yang bermasalah, notifikasi otomatis dikirim ke WhatsApp (via Qontak) dan Telegram."),
      space(80),
      warningBox("Aplikasi HARUS dijalankan di PC kantor yang terhubung ke jaringan lokal yang sama dengan kamera CCTV, DVR, dan NVR. Tidak bisa dijalankan dari PC rumah atau hosting internet."),
      space(),
      new Paragraph({ children: [new TextRun("")], pageBreakBefore: true }),

      // ── 2. SYARAT SOFTWARE ─────────────────────────────────────────────────
      h1("  2.  SYARAT SOFTWARE DI PC KANTOR"),
      space(),
      p("Berikut daftar software yang harus tersedia di PC kantor sebelum instalasi:"),
      space(80),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [480, 2200, 1800, 3680, 1200],
        rows: [
          headerRow(["No", "Software", "Versi Min.", "Fungsi", "Status"], [480, 2200, 1800, 3680, 1200]),
          softwareRow("1", "PHP", "8.2 atau lebih baru", "Engine utama aplikasi Laravel", true),
          softwareRow("2", "Composer", "2.x", "Manajer paket PHP (install library)", true),
          softwareRow("3", "Git", "2.x", "Download & update kode dari GitHub", true),
          softwareRow("4", "FFmpeg", "4.x atau lebih baru", "Ambil snapshot dari stream RTSP kamera (Level 3)", true),
          softwareRow("5", "SQLite", "3.x (sudah include di PHP)", "Database aplikasi (tidak perlu install terpisah)", true),
          softwareRow("6", "Node.js", "18.x (opsional)", "Hanya jika ingin build ulang asset frontend", false),
          softwareRow("7", "WinGet", "Built-in Windows 10/11", "Manajer paket Windows, memudahkan instalasi", false),
        ]
      }),
      space(120),
      noteBox("SQLite sudah built-in di PHP, jadi tidak perlu install MySQL/MariaDB/PostgreSQL. Database disimpan sebagai file .sqlite di dalam folder project."),
      space(),
      new Paragraph({ children: [new TextRun("")], pageBreakBefore: true }),

      // ── 3. CARA INSTALL SOFTWARE ───────────────────────────────────────────
      h1("  3.  CARA INSTALL SOFTWARE SATU PER SATU"),
      space(),

      h2("3.1  PHP 8.2"),
      p("PHP adalah software utama yang menjalankan aplikasi. Tanpa PHP, aplikasi tidak bisa jalan sama sekali."),
      space(80),
      h3("Cara 1: Via WinGet (Direkomendasikan)"),
      p("Buka PowerShell atau Command Prompt sebagai Administrator, lalu ketik:"),
      space(60),
      codeBlock([
        "winget install --id PHP.PHP.8.2 --source winget",
      ]),
      space(80),
      h3("Cara 2: Download Manual"),
      numbered("Buka browser, pergi ke https://windows.php.net/download/"),
      numbered([bold("Download"), normal(" versi "), bold("PHP 8.2.x Non Thread Safe (NTS) ZIP for Windows x64")]),
      numbered("Ekstrak ke folder C:\\php"),
      numbered([normal("Rename file "), code("php.ini-development"), normal(" menjadi "), code("php.ini")]),
      numbered([normal("Buka "), code("php.ini"), normal(" dengan Notepad, cari dan hapus tanda titik koma (;) di depan baris:")]),
      space(60),
      codeBlock([
        ";extension=gd      <-- hapus titik koma jadi: extension=gd",
        ";extension=sqlite3 <-- hapus titik koma jadi: extension=sqlite3",
        ";extension=pdo_sqlite",
        ";extension=openssl",
        ";extension=fileinfo",
        ";extension=mbstring",
        ";extension=curl",
      ]),
      numbered([normal("Tambahkan "), code("C:\\php"), normal(" ke Environment Variable PATH (lihat petunjuk di bawah)")]),
      space(80),
      warningBox("Extension GD wajib diaktifkan! GD digunakan untuk analisis gambar Level 3 (deteksi blank/freeze). Tanpa GD, cek visual tidak akan berjalan."),
      space(80),
      h3("Cara Tambahkan PATH (agar php bisa dijalankan dari mana saja):"),
      numbered("Klik kanan ikon Windows/Start > klik System"),
      numbered("Klik Advanced System Settings > klik Environment Variables"),
      numbered([normal("Pada bagian "), bold("System Variables"), normal(", cari variable "), bold("Path"), normal(", klik Edit")]),
      numbered([normal("Klik "), bold("New"), normal(", ketik "), code("C:\\php"), normal(" (atau path tempat PHP terinstall)")]),
      numbered("Klik OK > OK > OK"),
      numbered([normal("Buka Command Prompt baru, ketik "), code("php -v"), normal(" untuk verifikasi")]),
      space(),
      p("Hasil yang benar:"),
      codeBlock([
        "PHP 8.2.x (cli) (...)",
        "Copyright (c) The PHP Group",
      ]),
      space(80),

      h2("3.2  Composer"),
      p("Composer adalah manajer paket untuk PHP, digunakan untuk menginstall semua library yang dibutuhkan aplikasi."),
      space(60),
      numbered([bold("Download installer"), normal(": buka https://getcomposer.org/Composer-Setup.exe")]),
      numbered("Jalankan installer, ikuti wizard sampai selesai"),
      numbered([normal("Pilih path ke "), code("php.exe"), normal(" yang sudah diinstall tadi")]),
      numbered([normal("Setelah selesai, buka Command Prompt baru, ketik "), code("composer -V")]),
      space(60),
      codeBlock(["Composer version 2.x.x ..."]),
      space(80),

      h2("3.3  Git"),
      p("Git digunakan untuk mengunduh kode aplikasi dari GitHub dan melakukan update secara mudah di kemudian hari."),
      space(60),
      h3("Cara 1: Via WinGet"),
      codeBlock(["winget install --id Git.Git --source winget"]),
      space(80),
      h3("Cara 2: Download Manual"),
      numbered("Buka https://git-scm.com/download/win"),
      numbered([bold("Download"), normal(" versi 64-bit installer")]),
      numbered("Jalankan installer, semua pilihan bisa dibiarkan default (klik Next terus)"),
      numbered([normal("Setelah selesai, buka Command Prompt baru, ketik "), code("git --version")]),
      space(60),
      codeBlock(["git version 2.x.x.windows.x"]),
      space(80),
      noteBox("Saat instalasi Git, pastikan pilihan 'Git from the command line and also from 3rd-party software' dipilih. Ini memastikan Git bisa diakses dari Command Prompt biasa."),
      space(80),

      h2("3.4  FFmpeg"),
      p("FFmpeg digunakan untuk mengambil satu frame (snapshot) dari stream video RTSP kamera. Tanpa FFmpeg, Level 3 (Visual Health Check) tidak bisa berjalan."),
      space(60),
      h3("Cara 1: Via WinGet (Paling Mudah)"),
      codeBlock(["winget install --id Gyan.FFmpeg --source winget"]),
      space(80),
      h3("Cara 2: Download Manual"),
      numbered("Buka https://www.gyan.dev/ffmpeg/builds/"),
      numbered([normal("Download "), bold("ffmpeg-release-full.7z"), normal(" atau "), bold("ffmpeg-release-essentials.zip")]),
      numbered([normal("Ekstrak ke folder, misalnya "), code("C:\\ffmpeg")]),
      numbered([normal("Tambahkan "), code("C:\\ffmpeg\\bin"), normal(" ke PATH (sama seperti cara tambah PATH untuk PHP di atas)")]),
      numbered([normal("Atau: catat path lengkap ke "), code("ffmpeg.exe"), normal(", misal "), code("C:\\ffmpeg\\bin\\ffmpeg.exe")]),
      space(80),
      warningBox("Setelah install via WinGet, FFmpeg tidak otomatis masuk PATH di sesi yang sama. Catat path lengkap (biasanya ada di C:\\Users\\[nama]\\AppData\\Local\\Microsoft\\WinGet\\Packages\\...) dan set di file .env nanti."),
      space(),
      new Paragraph({ children: [new TextRun("")], pageBreakBefore: true }),

      // ── 4. DOWNLOAD APLIKASI ───────────────────────────────────────────────
      h1("  4.  DOWNLOAD APLIKASI DARI GITHUB"),
      space(),
      p("Setelah semua software terpasang, langkah berikutnya adalah mengunduh kode aplikasi dari GitHub."),
      space(80),
      infoBox("Repositori GitHub: https://github.com/inta1102/cctv-monitor (Private - perlu akun GitHub yang sudah diinvite)"),
      space(120),

      h2("4.1  Pertama Kali (Clone)"),
      p("Buka Command Prompt atau PowerShell, pindah ke folder yang diinginkan (misal D:\\Proyek), lalu jalankan:"),
      space(60),
      codeBlock([
        "cd D:\\Proyek",
        "git clone https://github.com/inta1102/cctv-monitor.git",
        "cd cctv-monitor",
      ]),
      space(80),
      p("Git akan meminta username dan password GitHub. Masukkan akun GitHub yang sudah diinvite ke repo."),
      space(80),
      infoBox("Tips: Agar tidak perlu memasukkan password setiap kali, bisa pakai Git Credential Manager (sudah include di installer Git Windows) atau Personal Access Token dari settings GitHub."),
      space(80),

      h2("4.2  Update Kode (Setelah Ada Perubahan)"),
      p("Untuk update aplikasi ke versi terbaru, jalankan file yang sudah tersedia:"),
      space(60),
      codeBlock([
        "D:\\Proyek\\cctv-monitor\\deploy\\update.bat",
      ]),
      space(80),
      p("Script update.bat akan otomatis:"),
      bullet([bold("git pull"), normal(" - download perubahan terbaru dari GitHub")]),
      bullet([bold("composer install"), normal(" - update library PHP jika ada yang berubah")]),
      bullet([bold("php artisan migrate"), normal(" - update struktur database jika ada perubahan")]),
      bullet([bold("php artisan config:clear"), normal(" - bersihkan cache konfigurasi")]),
      space(),
      new Paragraph({ children: [new TextRun("")], pageBreakBefore: true }),

      // ── 5. KONFIGURASI .env ────────────────────────────────────────────────
      h1("  5.  KONFIGURASI FILE .ENV"),
      space(),
      p("File .env adalah file konfigurasi rahasia yang berisi password, API token, nomor WA, dll. File ini TIDAK tersimpan di GitHub (sengaja dikecualikan untuk keamanan), jadi harus dibuat manual di PC kantor."),
      space(80),
      warningBox("File .env JANGAN dishare ke orang lain atau di-upload ke internet. File ini berisi password dan API token yang bersifat rahasia."),
      space(120),

      h2("5.1  Cara Membuat File .env"),
      numbered([normal("Masuk ke folder project: "), code("D:\\Proyek\\cctv-monitor")]),
      numbered([normal("Copy file "), code(".env.example"), normal(" menjadi "), code(".env")]),
      space(60),
      codeBlock(["copy .env.example .env"]),
      space(80),
      numbered([normal("Buka "), code(".env"), normal(" dengan Notepad atau Notepad++")]),
      numbered("Isi nilai-nilai yang diperlukan (lihat tabel di bawah)"),
      space(80),

      h2("5.2  Daftar Konfigurasi yang Perlu Diisi"),
      space(60),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3000, 3000, 3360],
        rows: [
          headerRow(["Variabel", "Contoh Nilai", "Keterangan"], [3000, 3000, 3360]),
          new TableRow({ children: [
            cell("APP_KEY", LGRAY, 3000, true),
            cell("base64:xxxxx...", WHITE, 3000),
            cell("Kunci enkripsi aplikasi. Generate dengan: php artisan key:generate", WHITE, 3360),
          ]}),
          new TableRow({ children: [
            cell("APP_URL", LGRAY, 3000, true),
            cell("http://192.168.8.100:8123", WHITE, 3000),
            cell("IP PC kantor dan port yang digunakan", WHITE, 3360),
          ]}),
          new TableRow({ children: [
            cell("CCTV_FFMPEG_PATH", LGRAY, 3000, true),
            cell("C:\\ffmpeg\\bin\\ffmpeg.exe", WHITE, 3000),
            cell("Path lengkap ke file ffmpeg.exe. Gunakan tanda kutip tunggal jika ada backslash.", WHITE, 3360),
          ]}),
          new TableRow({ children: [
            cell("WA_DRIVER", LGRAY, 3000, true),
            cell("qontak", WHITE, 3000),
            cell("Ganti 'log' menjadi 'qontak' untuk kirim WA sungguhan", WHITE, 3360),
          ]}),
          new TableRow({ children: [
            cell("QONTAK_TOKEN", LGRAY, 3000, true),
            cell("(token dari Qontak)", WHITE, 3000),
            cell("API token dari dashboard Qontak. Samakan dengan CRMS.", WHITE, 3360),
          ]}),
          new TableRow({ children: [
            cell("QONTAK_CHANNEL_ID", LGRAY, 3000, true),
            cell("(UUID dari Qontak)", WHITE, 3000),
            cell("Channel Integration ID dari Qontak. Samakan dengan CRMS.", WHITE, 3360),
          ]}),
          new TableRow({ children: [
            cell("QONTAK_TMP_TICKET_NOTIFY", LGRAY, 3000, true),
            cell("(UUID template)", WHITE, 3000),
            cell("ID template WA di Qontak. Samakan dengan CRMS.", WHITE, 3360),
          ]}),
          new TableRow({ children: [
            cell("CCTV_WA_NUMBERS", LGRAY, 3000, true),
            cell("081234567890,081298765432", WHITE, 3000),
            cell("Nomor HP penerima alert WA. Pisahkan dengan koma, tanpa spasi.", WHITE, 3360),
          ]}),
          new TableRow({ children: [
            cell("CCTV_TELEGRAM_BOT_TOKEN", LGRAY, 3000, true),
            cell("(opsional)", WHITE, 3000),
            cell("Token Telegram Bot. Biarkan kosong jika tidak pakai Telegram.", WHITE, 3360),
          ]}),
          new TableRow({ children: [
            cell("CCTV_TELEGRAM_CHAT_ID", LGRAY, 3000, true),
            cell("(opsional)", WHITE, 3000),
            cell("Chat ID Telegram. Biarkan kosong jika tidak pakai Telegram.", WHITE, 3360),
          ]}),
        ]
      }),
      space(120),
      h3("Contoh isi .env bagian CCTV:"),
      codeBlock([
        "CCTV_FFMPEG_PATH='C:\\ffmpeg\\bin\\ffmpeg.exe'",
        "",
        "WA_ENABLED=true",
        "WA_DRIVER=qontak",
        "QONTAK_BASE=https://service-chat.qontak.com/api/open/v1",
        "QONTAK_TOKEN=isi-token-dari-qontak-di-sini",
        "QONTAK_CHANNEL_ID=isi-channel-id-dari-qontak-di-sini",
        "QONTAK_ENDPOINT_SEND_TEMPLATE=broadcasts/whatsapp/direct",
        "QONTAK_TMP_TICKET_NOTIFY=isi-uuid-template-dari-qontak-di-sini",
        "",
        "CCTV_WA_NUMBERS=081568401122,08xxx,08xxx",
      ]),
      space(),
      new Paragraph({ children: [new TextRun("")], pageBreakBefore: true }),

      // ── 6. INSTALL APLIKASI ────────────────────────────────────────────────
      h1("  6.  INSTALL & SETUP APLIKASI"),
      space(),
      p("Setelah software siap dan file .env sudah dibuat, jalankan script instalasi otomatis:"),
      space(80),
      h2("6.1  Jalankan install.bat"),
      warningBox("Jalankan install.bat dengan klik kanan > Run as Administrator agar bisa mendaftarkan Task Scheduler."),
      space(80),
      p("Cara menjalankan:"),
      numbered([normal("Buka File Explorer, pergi ke "), code("D:\\Proyek\\cctv-monitor\\deploy\\")]),
      numbered([normal("Klik kanan file "), bold("install.bat"), normal(" > pilih "), bold("Run as Administrator")]),
      numbered("Tunggu proses selesai (akan ada output baris demi baris di layar hitam)"),
      space(80),
      p("Script install.bat akan melakukan:"),
      bullet("composer install - menginstall semua library PHP yang dibutuhkan"),
      bullet("php artisan key:generate - membuat kunci enkripsi aplikasi"),
      bullet("php artisan migrate - membuat struktur database SQLite"),
      bullet("php artisan storage:link - membuat link folder public/storage"),
      bullet("Mendaftarkan 3 Task Scheduler Windows (lihat penjelasan di bawah)"),
      space(80),

      h2("6.2  Task Scheduler yang Terbuat Otomatis"),
      space(60),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2500, 2000, 4860],
        rows: [
          headerRow(["Nama Task", "Jadwal", "Fungsi"], [2500, 2000, 4860]),
          new TableRow({ children: [
            cell("CCTV-Checker", WHITE, 2500, true),
            cell("Setiap 1 menit", LGREEN, 2000),
            cell("Menjalankan pengecekan Level 1/2/3 sesuai jadwal yang dikonfigurasi", WHITE, 4860),
          ]}),
          new TableRow({ children: [
            cell("CCTV-WebServer", WHITE, 2500, true),
            cell("Saat PC Nyala", LCYAN, 2000),
            cell("Menjalankan web dashboard di http://[IP-PC]:8123", WHITE, 4860),
          ]}),
          new TableRow({ children: [
            cell("CCTV-QueueWorker", WHITE, 2500, true),
            cell("Saat PC Nyala", LCYAN, 2000),
            cell("Memproses antrian pengiriman notifikasi WhatsApp", WHITE, 4860),
          ]}),
        ]
      }),
      space(120),
      noteBox("Ketiga task ini berjalan otomatis saat PC nyala. Tidak perlu membuka aplikasi secara manual setiap hari."),
      space(),
      new Paragraph({ children: [new TextRun("")], pageBreakBefore: true }),

      // ── 7. VERIFIKASI ─────────────────────────────────────────────────────
      h1("  7.  VERIFIKASI INSTALASI"),
      space(),
      p("Setelah instalasi selesai, lakukan pengecekan berikut untuk memastikan semua berjalan:"),
      space(80),

      h2("7.1  Cek Dashboard Web"),
      numbered([normal("Buka browser di PC kantor")]),
      numbered([normal("Ketik alamat: "), code("http://localhost:8123"), normal(" atau "), code("http://[IP-PC-kantor]:8123")]),
      numbered("Pastikan muncul halaman dashboard CCTV Monitor dengan daftar device"),
      space(80),

      h2("7.2  Cek Monitoring Berjalan"),
      p("Buka Command Prompt, masuk ke folder project, jalankan cek manual:"),
      codeBlock([
        "cd D:\\Proyek\\cctv-monitor",
        "",
        "REM Cek Level 1 (network/ping)",
        "php artisan cctv:check-network",
        "",
        "REM Cek Level 2 (service/port)",
        "php artisan cctv:check-service",
        "",
        "REM Cek Level 3 (visual snapshot)",
        "php artisan cctv:check-visual",
      ]),
      space(80),
      p("Lihat hasilnya di dashboard web, atau cek log:"),
      codeBlock([
        "type storage\\logs\\laravel.log",
      ]),
      space(80),

      h2("7.3  Cek Notifikasi WhatsApp"),
      p("Jalankan perintah berikut untuk trigger alert tes dan cek apakah WA terkirim:"),
      codeBlock([
        "php artisan tinker",
        "",
        "// Dalam tinker, ketik:",
        "$d = App\\Models\\Device::first();",
        "app(App\\Services\\AlertService::class)->trigger($d, 'network', 'ping', 'TES NOTIFIKASI WA');",
        "exit",
        "",
        "// Jalankan queue worker untuk proses pengiriman:",
        "php artisan queue:work --queue=wa --once",
      ]),
      space(80),
      p("Periksa HP penerima. Jika WA masuk dalam 1-2 menit, berarti konfigurasi sudah benar."),
      space(),
      new Paragraph({ children: [new TextRun("")], pageBreakBefore: true }),

      // ── 8. CARA UPDATE ─────────────────────────────────────────────────────
      h1("  8.  CARA UPDATE APLIKASI"),
      space(),
      p("Saat ada perbaikan atau fitur baru, Tim IT pusat akan push ke GitHub. Cara update di PC kantor:"),
      space(80),

      h2("Menggunakan update.bat (Cara Mudah)"),
      numbered([normal("Buka File Explorer, pergi ke "), code("D:\\Proyek\\cctv-monitor\\deploy\\")]),
      numbered([normal("Klik dua kali file "), bold("update.bat")]),
      numbered("Tunggu proses selesai"),
      numbered("Aplikasi sudah terupdate - tidak perlu restart manual karena Task Scheduler akan melakukannya"),
      space(80),

      h2("Menggunakan Git Manual (Cara Teknis)"),
      codeBlock([
        "cd D:\\Proyek\\cctv-monitor",
        "git pull origin main",
        "composer install --no-interaction",
        "php artisan migrate --force",
        "php artisan config:clear",
        "php artisan cache:clear",
      ]),
      space(80),
      noteBox("Setelah update, jika ada perubahan pada konfigurasi .env.example, Tim IT akan menginformasikan apakah ada variabel baru yang perlu ditambahkan ke file .env di PC kantor."),
      space(80),

      h2("Apakah Perlu Koneksi Internet?"),
      p("Untuk update aplikasi: Ya, PC kantor perlu koneksi internet untuk git pull dari GitHub."),
      p("Untuk operasional sehari-hari (monitoring kamera): Tidak perlu internet, cukup jaringan lokal kantor."),
      p("Untuk kirim notifikasi WA ke Qontak: Ya, PC kantor perlu koneksi internet saat akan mengirim alert."),
      space(),
      new Paragraph({ children: [new TextRun("")], pageBreakBefore: true }),

      // ── 9. TROUBLESHOOTING ─────────────────────────────────────────────────
      h1("  9.  TROUBLESHOOTING"),
      space(),

      h2("php tidak dikenali / 'php' is not recognized"),
      p("PHP belum masuk PATH. Cek apakah folder PHP sudah ditambahkan ke Environment Variable PATH."),
      codeBlock([
        "REM Cek php di mana:",
        "where php",
        "",
        "REM Jika tidak ketemu, tambahkan ke PATH atau jalankan dengan path lengkap:",
        "C:\\php\\php.exe -v",
      ]),
      space(80),

      h2("ffmpeg tidak bisa ambil snapshot (no_signal / error)"),
      bullet("Pastikan path ffmpeg.exe di .env sudah benar (gunakan tanda kutip tunggal untuk path dengan backslash)"),
      bullet("Test manual dari Command Prompt: jalankan ffmpeg.exe -version"),
      bullet("Pastikan RTSP URL kamera benar (coba buka di VLC dulu)"),
      bullet("Pastikan PC kantor terhubung ke jaringan yang sama dengan kamera"),
      space(80),

      h2("WA tidak terkirim"),
      bullet("Cek apakah queue worker berjalan: buka Task Scheduler, lihat CCTV-QueueWorker statusnya Running"),
      bullet([normal("Atau jalankan manual: "), code("php artisan queue:work --queue=wa --once")]),
      bullet([normal("Cek log: "), code("type storage\\logs\\laravel.log | findstr /i \"wa\\|qontak\\|error\"")]),
      bullet("Pastikan koneksi internet PC kantor aktif"),
      space(80),

      h2("Dashboard tidak bisa dibuka"),
      bullet("Pastikan Task Scheduler CCTV-WebServer statusnya Running"),
      bullet([normal("Atau jalankan manual: "), code("php artisan serve --host=0.0.0.0 --port=8123")]),
      bullet([normal("Cek apakah port 8123 sedang dipakai aplikasi lain: "), code("netstat -ano | findstr 8123")]),
      space(80),

      h2("Database error / migration failed"),
      codeBlock([
        "cd D:\\Proyek\\cctv-monitor",
        "php artisan migrate:status",
        "php artisan migrate",
      ]),
      space(),
      new Paragraph({ children: [new TextRun("")], pageBreakBefore: true }),

      // ── 10. RINGKASAN URUTAN INSTALASI ─────────────────────────────────────
      h1("  10.  RINGKASAN URUTAN INSTALASI"),
      space(),
      p("Berikut urutan instalasi dari awal sampai selesai:"),
      space(80),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [600, 4400, 4360],
        rows: [
          headerRow(["No", "Langkah", "Perintah / Cara"], [600, 4400, 4360]),
          new TableRow({ children: [
            cell("1", LCYAN, 600, true),
            cell("Install PHP 8.2", WHITE, 4400),
            cell("winget install --id PHP.PHP.8.2", LGRAY, 4360),
          ]}),
          new TableRow({ children: [
            cell("2", LCYAN, 600, true),
            cell("Aktifkan extension GD, SQLite, dll di php.ini", WHITE, 4400),
            cell("Edit C:\\php\\php.ini, hapus ; di depan extension=gd", LGRAY, 4360),
          ]}),
          new TableRow({ children: [
            cell("3", LCYAN, 600, true),
            cell("Install Composer", WHITE, 4400),
            cell("Download & jalankan https://getcomposer.org/Composer-Setup.exe", LGRAY, 4360),
          ]}),
          new TableRow({ children: [
            cell("4", LCYAN, 600, true),
            cell("Install Git", WHITE, 4400),
            cell("winget install --id Git.Git", LGRAY, 4360),
          ]}),
          new TableRow({ children: [
            cell("5", LCYAN, 600, true),
            cell("Install FFmpeg", WHITE, 4400),
            cell("winget install --id Gyan.FFmpeg", LGRAY, 4360),
          ]}),
          new TableRow({ children: [
            cell("6", LCYAN, 600, true),
            cell("Clone repo dari GitHub", WHITE, 4400),
            cell("git clone https://github.com/inta1102/cctv-monitor.git", LGRAY, 4360),
          ]}),
          new TableRow({ children: [
            cell("7", LCYAN, 600, true),
            cell("Buat file .env dari .env.example", WHITE, 4400),
            cell("copy .env.example .env", LGRAY, 4360),
          ]}),
          new TableRow({ children: [
            cell("8", LCYAN, 600, true),
            cell("Isi konfigurasi di .env (path ffmpeg, token WA, nomor HP)", WHITE, 4400),
            cell("Edit dengan Notepad/Notepad++", LGRAY, 4360),
          ]}),
          new TableRow({ children: [
            cell("9", LCYAN, 600, true),
            cell("Jalankan install.bat (sebagai Administrator)", WHITE, 4400),
            cell("Klik kanan install.bat > Run as Administrator", LGRAY, 4360),
          ]}),
          new TableRow({ children: [
            cell("10", LCYAN, 600, true),
            cell("Verifikasi: buka dashboard di browser", WHITE, 4400),
            cell("Buka http://localhost:8123", LGRAY, 4360),
          ]}),
          new TableRow({ children: [
            cell("11", LCYAN, 600, true),
            cell("Test notifikasi WA", WHITE, 4400),
            cell("php artisan tinker > trigger alert > queue:work", LGRAY, 4360),
          ]}),
        ]
      }),
      space(120),
      noteBox("Jika ada pertanyaan atau kendala saat instalasi, hubungi Tim IT pusat. Simpan file panduan ini dan file .env di tempat yang aman."),
      space(),
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("D:/Proyek/cctv-monitor/docs/Panduan-Instalasi-CCTV-Monitor.docx", buf);
  console.log("DONE: Panduan-Instalasi-CCTV-Monitor.docx");
});
