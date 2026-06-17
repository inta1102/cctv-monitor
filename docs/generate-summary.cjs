const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, Header, Footer, PageNumber,
} = require('docx');
const fs = require('fs');

const BLUE    = "1F4E79";
const LBLUE   = "2E75B6";
const LCYAN   = "D6E4F0";
const LGREEN  = "E2EFDA";
const LYELLOW = "FFF2CC";
const LGRAY   = "F2F2F2";
const WHITE   = "FFFFFF";
const DGREEN  = "375623";
const RED     = "C00000";

const b1 = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: b1, bottom: b1, left: b1, right: b1 };

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 300, after: 140 },
    shading: { fill: BLUE, type: ShadingType.CLEAR },
    indent: { left: 180, right: 180 },
    children: [new TextRun({ text, bold: true, size: 34, color: WHITE, font: "Arial" })],
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 100 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: LBLUE } },
    children: [new TextRun({ text, bold: true, size: 26, color: BLUE, font: "Arial" })],
  });
}
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 180, after: 80 },
    children: [new TextRun({ text, bold: true, size: 22, color: LBLUE, font: "Arial" })],
  });
}
function p(...runs) {
  const children = runs.map(r =>
    typeof r === "string"
      ? new TextRun({ text: r, size: 21, font: "Arial" })
      : r
  );
  return new Paragraph({ spacing: { before: 60, after: 80 }, children });
}
function bold(text) { return new TextRun({ text, bold: true, size: 21, font: "Arial" }); }
function mono(text) { return new TextRun({ text, font: "Courier New", size: 19, color: "C7254E" }); }
function sp(n = 100) { return new Paragraph({ spacing: { before: n, after: 0 }, children: [new TextRun("")] }); }

function bullet(runs, level = 0) {
  return new Paragraph({
    numbering: { reference: "bullets", level },
    spacing: { before: 40, after: 40 },
    children: typeof runs === "string"
      ? [new TextRun({ text: runs, size: 21, font: "Arial" })]
      : runs,
  });
}

function cell(text, fill, w, isBold = false) {
  return new TableCell({
    borders,
    shading: { fill, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    width: { size: w, type: WidthType.DXA },
    children: [new Paragraph({
      children: [new TextRun({ text, size: 20, font: "Arial", bold: isBold })],
    })],
  });
}
function hdrRow(cols, widths) {
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
function infoBox(text, fill, label) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [700, 8660],
    rows: [new TableRow({ children: [
      new TableCell({
        borders, shading: { fill: LBLUE, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 80, right: 80 },
        width: { size: 700, type: WidthType.DXA },
        children: [new Paragraph({ alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: label, bold: true, size: 18, color: WHITE, font: "Arial" })] })],
      }),
      new TableCell({
        borders, shading: { fill, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 160, right: 80 },
        width: { size: 8660, type: WidthType.DXA },
        children: [new Paragraph({ children: [new TextRun({ text, size: 20, font: "Arial" })] })],
      }),
    ]})]
  });
}

function statusRow(item, status, fill, note) {
  const statusColor = status === "SELESAI" ? DGREEN : (status === "PENDING" ? "833C00" : RED);
  return new TableRow({ children: [
    cell(item, WHITE, 3200),
    new TableCell({
      borders, shading: { fill, type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      width: { size: 1400, type: WidthType.DXA },
      children: [new Paragraph({ alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: status, bold: true, size: 19, color: statusColor, font: "Arial" })] })],
    }),
    cell(note, WHITE, 4760),
  ]});
}

const doc = new Document({
  numbering: {
    config: [
      { reference: "bullets", levels: [
        { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
        { level: 1, format: LevelFormat.BULLET, text: "-", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 1080, hanging: 360 } } } },
      ]},
      { reference: "numbers", levels: [
        { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
      ]},
    ],
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 21 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 34, bold: true, font: "Arial", color: WHITE },
        paragraph: { spacing: { before: 300, after: 140 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: BLUE },
        paragraph: { spacing: { before: 240, after: 100 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 22, bold: true, font: "Arial", color: LBLUE },
        paragraph: { spacing: { before: 180, after: 80 }, outlineLevel: 2 } },
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
      default: new Header({ children: [new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: LBLUE } },
        children: [
          new TextRun({ text: "CCTV Monitor ", bold: true, size: 21, color: BLUE, font: "Arial" }),
          new TextRun({ text: "  Development Summary  |  Juni 2026", size: 21, color: "777777", font: "Arial" }),
        ],
      })] })
    },
    footers: {
      default: new Footer({ children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        border: { top: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC" } },
        children: [
          new TextRun({ text: "PT BPR Madani Sejahtera Abadi  |  Tim IT  |  Halaman ", size: 18, color: "888888", font: "Arial" }),
          new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "888888", font: "Arial" }),
        ],
      })] })
    },
    children: [

      // ── COVER ────────────────────────────────────────────────────────────
      new Paragraph({
        spacing: { before: 1000, after: 0 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "CCTV MONITOR", bold: true, size: 80, color: BLUE, font: "Arial" })],
      }),
      new Paragraph({
        spacing: { before: 80, after: 0 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Sistem Monitoring Kamera Kantor — PT BPR Madani Sejahtera Abadi", size: 32, color: "555555", font: "Arial" })],
      }),
      sp(200),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "DEVELOPMENT & CONFIGURATION SUMMARY", bold: true, size: 38,
          color: WHITE, font: "Arial", shading: { fill: LBLUE, type: ShadingType.CLEAR } })],
      }),
      sp(300),
      new Table({
        width: { size: 5400, type: WidthType.DXA }, alignment: AlignmentType.CENTER,
        columnWidths: [2700, 2700],
        rows: [
          new TableRow({ children: [cell("Project", LGRAY, 2700, true), cell("cctv-monitor", WHITE, 2700)] }),
          new TableRow({ children: [cell("Tanggal", LGRAY, 2700, true), cell("Juni 2026", WHITE, 2700)] }),
          new TableRow({ children: [cell("Repo GitHub", LGRAY, 2700, true), cell("github.com/inta1102/cctv-monitor", WHITE, 2700)] }),
          new TableRow({ children: [cell("Stack", LGRAY, 2700, true), cell("Laravel 11 / PHP 8.2 / SQLite", WHITE, 2700)] }),
          new TableRow({ children: [cell("Tim", LGRAY, 2700, true), cell("Tim IT BPRMSA", WHITE, 2700)] }),
        ]
      }),
      new Paragraph({ children: [new TextRun("")], pageBreakBefore: true }),

      // ── 1. OVERVIEW ───────────────────────────────────────────────────────
      h1("  1.  GAMBARAN UMUM APLIKASI"),
      sp(),
      p("CCTV Monitor adalah aplikasi web internal berbasis Laravel 11 yang dijalankan di PC kantor. Aplikasi memantau kondisi seluruh perangkat kamera CCTV secara otomatis dalam 3 level, dan mengirimkan notifikasi WhatsApp serta Telegram bila ada masalah."),
      sp(80),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1100, 1900, 3600, 2760],
        rows: [
          hdrRow(["Level", "Nama", "Yang Dipantau", "Frekuensi Default"], [1100, 1900, 3600, 2760]),
          new TableRow({ children: [
            cell("Level 1", LCYAN, 1100, true),
            cell("Network", WHITE, 1900),
            cell("Ping ke IP device (DVR, IP Kamera, Switch, Router). Alert jika tidak merespon.", WHITE, 3600),
            cell("Setiap 1 menit", LGRAY, 2760),
          ]}),
          new TableRow({ children: [
            cell("Level 2", LCYAN, 1100, true),
            cell("Service", WHITE, 1900),
            cell("Cek port TCP: RTSP (554), HTTP (80), ONVIF (8000). Alert jika port tertutup.", WHITE, 3600),
            cell("Setiap 5 menit", LGRAY, 2760),
          ]}),
          new TableRow({ children: [
            cell("Level 3", LCYAN, 1100, true),
            cell("Visual", WHITE, 1900),
            cell("Capture snapshot via FFmpeg dari stream RTSP. Deteksi: blank, gelap, no-signal, freeze. Alert jika abnormal.", WHITE, 3600),
            cell("Setiap 10 menit", LGRAY, 2760),
          ]}),
        ]
      }),
      sp(120),
      infoBox("Aplikasi hanya bisa diakses dari dalam jaringan LAN kantor. Dashboard di http://[IP-PC-kantor]:8123", LCYAN, "INFO"),
      sp(),
      new Paragraph({ children: [new TextRun("")], pageBreakBefore: true }),

      // ── 2. TECH STACK ────────────────────────────────────────────────────
      h1("  2.  TECH STACK & DEPENDENSI"),
      sp(),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2400, 2000, 4960],
        rows: [
          hdrRow(["Komponen", "Versi / Detail", "Fungsi"], [2400, 2000, 4960]),
          new TableRow({ children: [cell("Laravel", WHITE, 2400, true), cell("11", LGRAY, 2000), cell("Framework PHP utama", WHITE, 4960)] }),
          new TableRow({ children: [cell("PHP", WHITE, 2400, true), cell("8.2.12", LGRAY, 2000), cell("Runtime, extension GD wajib aktif (analisis gambar)", WHITE, 4960)] }),
          new TableRow({ children: [cell("SQLite", WHITE, 2400, true), cell("3.x (built-in PHP)", LGRAY, 2000), cell("Database — file database/database.sqlite, tidak perlu MySQL", WHITE, 4960)] }),
          new TableRow({ children: [cell("FFmpeg", WHITE, 2400, true), cell("8.1.1 (Gyan.FFmpeg)", LGRAY, 2000), cell("Capture frame dari RTSP untuk Level 3 visual check", WHITE, 4960)] }),
          new TableRow({ children: [cell("Laravel Scheduler", WHITE, 2400, true), cell("Built-in Laravel", LGRAY, 2000), cell("Menjalankan cek otomatis via routes/console.php", WHITE, 4960)] }),
          new TableRow({ children: [cell("Laravel Queue", WHITE, 2400, true), cell("Database driver", LGRAY, 2000), cell("Antrian pengiriman notifikasi WA (queue: wa)", WHITE, 4960)] }),
          new TableRow({ children: [cell("Qontak API", WHITE, 2400, true), cell("service-chat.qontak.com", LGRAY, 2000), cell("Kirim notifikasi WhatsApp via template smartkpi_notification_ticket", WHITE, 4960)] }),
          new TableRow({ children: [cell("Telegram Bot API", WHITE, 2400, true), cell("api.telegram.org", LGRAY, 2000), cell("Kirim notifikasi Telegram (opsional)", WHITE, 4960)] }),
          new TableRow({ children: [cell("Windows Task Scheduler", WHITE, 2400, true), cell("Built-in Windows", LGRAY, 2000), cell("Jalankan scheduler, web server, dan queue worker otomatis saat PC nyala", WHITE, 4960)] }),
        ]
      }),
      sp(),
      new Paragraph({ children: [new TextRun("")], pageBreakBefore: true }),

      // ── 3. DEVICE TERDAFTAR ───────────────────────────────────────────────
      h1("  3.  DEVICE YANG SUDAH TERDAFTAR"),
      sp(),
      p("Total 7 device sudah terdaftar di database aplikasi:"),
      sp(80),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [480, 2200, 1600, 1600, 3480],
        rows: [
          hdrRow(["No", "Nama Device", "IP Address", "Tipe", "Konfigurasi Port"], [480, 2200, 1600, 1600, 3480]),
          new TableRow({ children: [
            cell("1", LGRAY, 480), cell("Camera 01", WHITE, 2200, true),
            cell("192.168.8.107", WHITE, 1600), cell("EZVIZ IP Cam", LCYAN, 1600),
            cell("Device:8000, HTTP:80, RTSP:554 (sudah aktif). Level 3 belum dikonfigurasi — username/password/rtsp_path belum diisi.", WHITE, 3480),
          ]}),
          new TableRow({ children: [
            cell("2", LGRAY, 480), cell("Camera 02", WHITE, 2200, true),
            cell("192.168.8.114", WHITE, 1600), cell("EZVIZ IP Cam", LCYAN, 1600),
            cell("Device:8000, HTTP:80, RTSP:554 (sudah aktif). Level 3 belum dikonfigurasi — username/password/rtsp_path belum diisi.", WHITE, 3480),
          ]}),
          new TableRow({ children: [
            cell("3", LGRAY, 480), cell("MSA 01", WHITE, 2200, true),
            cell("200.16.1.53", WHITE, 1600), cell("Remote Device", LYELLOW, 1600),
            cell("IP publik remote. Hanya bisa diakses dari jaringan yang sama atau via VPN. Saat ini expected offline dari jaringan kantor.", WHITE, 3480),
          ]}),
          new TableRow({ children: [
            cell("4", LGRAY, 480), cell("Omah Srikaton", WHITE, 2200, true),
            cell("192.168.8.64", WHITE, 1600), cell("DVR", LGREEN, 1600),
            cell("Web:80, RTSP:554, ONVIF:8000. Level 1 & 2 aktif. Level 3 menggunakan DVR Cam 1-4.", WHITE, 3480),
          ]}),
          new TableRow({ children: [
            cell("5", LGRAY, 480), cell("DVR Cam 1", WHITE, 2200, true),
            cell("192.168.8.64", WHITE, 1600), cell("DVR Channel", LGREEN, 1600),
            cell("RTSP path: /Streaming/Channels/101. Level 3 aktif (snapshot_enabled=true). Credentials: admin/Admin123.", WHITE, 3480),
          ]}),
          new TableRow({ children: [
            cell("6", LGRAY, 480), cell("DVR Cam 2", WHITE, 2200, true),
            cell("192.168.8.64", WHITE, 1600), cell("DVR Channel", LGREEN, 1600),
            cell("RTSP path: /Streaming/Channels/201. Level 3 aktif. Credentials: admin/Admin123.", WHITE, 3480),
          ]}),
          new TableRow({ children: [
            cell("7", LGRAY, 480), cell("DVR Cam 3 & 4", WHITE, 2200, true),
            cell("192.168.8.64", WHITE, 1600), cell("DVR Channel", LGREEN, 1600),
            cell("RTSP path: /Streaming/Channels/301 dan /401. Level 3 aktif. Credentials: admin/Admin123.", WHITE, 3480),
          ]}),
        ]
      }),
      sp(120),
      infoBox("DVR Cam 1-4 didaftarkan sebagai device terpisah meskipun IP-nya sama (192.168.8.64). Tujuannya agar Level 3 bisa mendeteksi kamera mana yang bermasalah secara individual.", LGREEN, "OK"),
      sp(),
      new Paragraph({ children: [new TextRun("")], pageBreakBefore: true }),

      // ── 4. FITUR YANG DIBANGUN ────────────────────────────────────────────
      h1("  4.  FITUR YANG SUDAH DIBANGUN"),
      sp(),

      h2("4.1  Level 1 — Network Monitoring"),
      bullet([bold("Command: "), new TextRun({ text: "php artisan cctv:check-network", font: "Courier New", size: 19, color: "C7254E" })]),
      bullet("Ping ke setiap device menggunakan Symfony Process (ping command)"),
      bullet("Timeout: 3 detik, 1 kali ping"),
      bullet("Jika tidak merespon: buat DeviceAlert level=network, kirim notifikasi"),
      bullet("Jika kembali normal: resolve alert, kirim notifikasi resolved"),
      sp(80),

      h2("4.2  Level 2 — Service Monitoring"),
      bullet([bold("Command: "), new TextRun({ text: "php artisan cctv:check-service", font: "Courier New", size: 19, color: "C7254E" })]),
      bullet("Cek port TCP via fsockopen() dengan timeout 3 detik"),
      bullet("Port yang dicek per device: RTSP (554), HTTP (80), ONVIF (8000) — sesuai yang dikonfigurasi di tabel devices"),
      bullet("Alert per port (check_type = rtsp / http / onvif)"),
      sp(80),

      h2("4.3  Level 3 — Visual Health Check"),
      bullet([bold("Command: "), new TextRun({ text: "php artisan cctv:check-visual", font: "Courier New", size: 19, color: "C7254E" })]),
      bullet([bold("Capture snapshot"), new TextRun({ text: " dari RTSP stream menggunakan FFmpeg (1 frame, timeout 15 detik)", size: 21, font: "Arial" })]),
      bullet("Analisis gambar menggunakan PHP extension GD:"),
      bullet("Deteksi blank: stddev brightness < threshold (default 5.0)", 1),
      bullet("Deteksi gelap: avg brightness < threshold (default 15.0)", 1),
      bullet("Deteksi no-signal: mendeteksi warna biru khas layar no-signal", 1),
      bullet([
        bold("Deteksi freeze: "),
        new TextRun({ text: "perbandingan pixel-by-pixel dengan snapshot sebelumnya menggunakan grid 32x32 sample. Freeze jika >97% pixel berubah <2.0 brightness", size: 21, font: "Arial" }),
      ], 1),
      bullet("Snapshot tersimpan di storage/app/snapshots/ dan ditampilkan di dashboard"),
      bullet("Samples (32x32 grid) disimpan di tabel camera_snapshots.samples (JSON) untuk deteksi freeze berikutnya"),
      sp(80),

      h2("4.4  Notifikasi"),
      h3("WhatsApp (via Qontak)"),
      bullet("Driver: qontak | Template: smartkpi_notification_ticket (UUID: b1ec5a6c-fd33-47c0-be99-016a2b0fd854)"),
      bullet("Endpoint: POST https://service-chat.qontak.com/api/open/v1/broadcasts/whatsapp/direct"),
      bullet("Dikirim via queue (queue: wa) menggunakan SendWaTemplateJob"),
      bullet("Retry otomatis: 5x dengan backoff 10s/30s/60s/120s/300s"),
      bullet("Penerima: dikonfigurasi via CCTV_WA_NUMBERS di .env (pisah koma)"),
      bullet([
        bold("5 variabel template: "),
        new TextRun({ text: "var1=salam, var2=judul alert, var3=detail device, var4=waktu, var5=lokasi & pesan", size: 21, font: "Arial" }),
      ]),
      bullet([
        bold("Wajib: "),
        new TextRun({ text: "parameters.buttons harus diisi (tombol URL template punya variabel wajib #131008)", size: 21, font: "Arial" }),
      ]),
      sp(80),
      h3("Telegram"),
      bullet("Opsional — dikonfigurasi via CCTV_TELEGRAM_BOT_TOKEN dan CCTV_TELEGRAM_CHAT_ID"),
      bullet("Dikirim langsung (tidak via queue) menggunakan HTTP ke api.telegram.org"),
      sp(80),

      h2("4.5  Web Dashboard"),
      bullet("URL: http://[IP-PC-kantor]:8123"),
      bullet("Menampilkan status semua device (Network / Service / Visual) secara real-time"),
      bullet("Thumbnail snapshot dari kamera yang aktif di Level 3"),
      bullet("Daftar alert aktif dan history alert"),
      sp(),
      new Paragraph({ children: [new TextRun("")], pageBreakBefore: true }),

      // ── 5. STRUKTUR FILE PENTING ───────────────────────────────────────────
      h1("  5.  STRUKTUR FILE PENTING"),
      sp(),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [4200, 5160],
        rows: [
          hdrRow(["File / Path", "Fungsi"], [4200, 5160]),
          new TableRow({ children: [cell("app/Console/Commands/Cctv/CheckNetworkCommand.php", LGRAY, 4200, true), cell("Command cek ping Level 1", WHITE, 5160)] }),
          new TableRow({ children: [cell("app/Console/Commands/Cctv/CheckServiceCommand.php", LGRAY, 4200, true), cell("Command cek port TCP Level 2", WHITE, 5160)] }),
          new TableRow({ children: [cell("app/Console/Commands/Cctv/CheckVisualCommand.php", LGRAY, 4200, true), cell("Command capture & analisis snapshot Level 3", WHITE, 5160)] }),
          new TableRow({ children: [cell("app/Services/AlertService.php", LGRAY, 4200, true), cell("Buat/resolve alert, kirim notifikasi WA & Telegram", WHITE, 5160)] }),
          new TableRow({ children: [cell("app/Services/WhatsApp/WhatsAppNotifier.php", LGRAY, 4200, true), cell("HTTP client ke Qontak API", WHITE, 5160)] }),
          new TableRow({ children: [cell("app/Services/WhatsApp/CctvAlertMessageFactory.php", LGRAY, 4200, true), cell("Build variabel template WA untuk alert & resolved", WHITE, 5160)] }),
          new TableRow({ children: [cell("app/Jobs/SendWaTemplateJob.php", LGRAY, 4200, true), cell("Queue job untuk kirim WA (queue: wa, retry 5x)", WHITE, 5160)] }),
          new TableRow({ children: [cell("config/whatsapp.php", LGRAY, 4200, true), cell("Konfigurasi WA: driver, recipients, Qontak config", WHITE, 5160)] }),
          new TableRow({ children: [cell("config/cctv.php", LGRAY, 4200, true), cell("Threshold visual check, config telegram, ffmpeg path", WHITE, 5160)] }),
          new TableRow({ children: [cell("routes/console.php", LGRAY, 4200, true), cell("Jadwal scheduler (Schedule::command(...))", WHITE, 5160)] }),
          new TableRow({ children: [cell("database/database.sqlite", LGRAY, 4200, true), cell("File database SQLite", WHITE, 5160)] }),
          new TableRow({ children: [cell("storage/app/snapshots/", LGRAY, 4200, true), cell("Folder penyimpanan file snapshot JPEG dari kamera", WHITE, 5160)] }),
          new TableRow({ children: [cell("deploy/install.bat", LGRAY, 4200, true), cell("Script instalasi pertama kali di PC kantor", WHITE, 5160)] }),
          new TableRow({ children: [cell("deploy/update.bat", LGRAY, 4200, true), cell("Script update: git pull + migrate + config clear", WHITE, 5160)] }),
          new TableRow({ children: [cell("deploy/setup-scheduler.bat", LGRAY, 4200, true), cell("Daftarkan 3 Task Scheduler Windows", WHITE, 5160)] }),
          new TableRow({ children: [cell("deploy/run-server.bat", LGRAY, 4200, true), cell("Jalankan web server (php artisan serve)", WHITE, 5160)] }),
          new TableRow({ children: [cell("deploy/run-queue.bat", LGRAY, 4200, true), cell("Jalankan queue worker dengan auto-restart loop", WHITE, 5160)] }),
          new TableRow({ children: [cell("docs/Panduan-Instalasi-CCTV-Monitor.docx", LGRAY, 4200, true), cell("Panduan instalasi lengkap untuk PC kantor", WHITE, 5160)] }),
          new TableRow({ children: [cell(".env", LGRAY, 4200, true), cell("Konfigurasi rahasia (tidak ada di GitHub)", WHITE, 5160)] }),
        ]
      }),
      sp(),
      new Paragraph({ children: [new TextRun("")], pageBreakBefore: true }),

      // ── 6. KONFIGURASI .ENV ───────────────────────────────────────────────
      h1("  6.  KONFIGURASI .ENV YANG RELEVAN"),
      sp(),
      p("Berikut bagian .env yang spesifik untuk CCTV Monitor (di luar config Laravel standar):"),
      sp(80),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3200, 6160],
        rows: [
          hdrRow(["Variabel", "Nilai / Keterangan"], [3200, 6160]),
          new TableRow({ children: [cell("QUEUE_CONNECTION", LGRAY, 3200, true), cell("database  (wajib untuk queue WA)", WHITE, 6160)] }),
          new TableRow({ children: [cell("CCTV_FFMPEG_PATH", LGRAY, 3200, true), cell("Path lengkap ffmpeg.exe (gunakan tanda kutip tunggal karena ada backslash)", WHITE, 6160)] }),
          new TableRow({ children: [cell("WA_ENABLED", LGRAY, 3200, true), cell("true", WHITE, 6160)] }),
          new TableRow({ children: [cell("WA_DRIVER", LGRAY, 3200, true), cell("qontak  (ganti 'log' jika ingin test tanpa kirim WA sungguhan)", WHITE, 6160)] }),
          new TableRow({ children: [cell("QONTAK_BASE", LGRAY, 3200, true), cell("https://service-chat.qontak.com/api/open/v1", WHITE, 6160)] }),
          new TableRow({ children: [cell("QONTAK_TOKEN", LGRAY, 3200, true), cell("API token dari Qontak (samakan dengan CRMS)", WHITE, 6160)] }),
          new TableRow({ children: [cell("QONTAK_CHANNEL_ID", LGRAY, 3200, true), cell("71ee4ad2-542e-47f5-ae0b-384e21dd3d10 (samakan dengan CRMS)", WHITE, 6160)] }),
          new TableRow({ children: [cell("QONTAK_ENDPOINT_SEND_TEMPLATE", LGRAY, 3200, true), cell("broadcasts/whatsapp/direct  (BUKAN whatsapp/send-template)", WHITE, 6160)] }),
          new TableRow({ children: [cell("QONTAK_TMP_TICKET_NOTIFY", LGRAY, 3200, true), cell("b1ec5a6c-fd33-47c0-be99-016a2b0fd854 (UUID template)", WHITE, 6160)] }),
          new TableRow({ children: [cell("CCTV_WA_NUMBERS", LGRAY, 3200, true), cell("Nomor HP penerima alert, pisah koma. Contoh: 081568401122,08xxx,08xxx", WHITE, 6160)] }),
        ]
      }),
      sp(120),
      infoBox("PENTING: QONTAK_ENDPOINT_SEND_TEMPLATE harus 'broadcasts/whatsapp/direct', bukan 'whatsapp/send-template'. Endpoint lama return 404.", LYELLOW, "!"),
      sp(),
      new Paragraph({ children: [new TextRun("")], pageBreakBefore: true }),

      // ── 7. MASALAH & SOLUSI ───────────────────────────────────────────────
      h1("  7.  MASALAH YANG DITEMUKAN & SOLUSINYA"),
      sp(),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3200, 3000, 3160],
        rows: [
          hdrRow(["Masalah", "Penyebab", "Solusi"], [3200, 3000, 3160]),
          new TableRow({ children: [
            cell("dotenv parse error pada CCTV_FFMPEG_PATH", WHITE, 3200),
            cell("Path Windows pakai backslash, double-quote di .env dianggap escape sequence", LGRAY, 3000),
            cell("Gunakan single quote: CCTV_FFMPEG_PATH='C:\\path\\ffmpeg.exe'", WHITE, 3160),
          ]}),
          new TableRow({ children: [
            cell("RTSP port 554 EZVIZ tidak terbuka (Level 2 FAIL)", WHITE, 3200),
            cell("EZVIZ disable RTSP/ONVIF secara default, harus diaktifkan manual di kamera", LGRAY, 3000),
            cell("Masuk ke EZVIZ Remote Config > Platform Access > aktifkan RTSP & ONVIF", WHITE, 3160),
          ]}),
          new TableRow({ children: [
            cell("False-positive 'freeze' di semua 4 DVR Cam setiap run", WHITE, 3200),
            cell("Deteksi freeze pakai perbandingan rata-rata brightness global — scene statis selalu dianggap freeze", LGRAY, 3000),
            cell("Ganti ke per-pixel comparison: 32x32 grid sample disimpan di camera_snapshots.samples (JSON)", WHITE, 3160),
          ]}),
          new TableRow({ children: [
            cell("WA Qontak return 404 saat kirim template", WHITE, 3200),
            cell("Endpoint salah: 'whatsapp/send-template' tidak valid", LGRAY, 3000),
            cell("Ganti ke endpoint yang benar: 'broadcasts/whatsapp/direct'", WHITE, 3160),
          ]}),
          new TableRow({ children: [
            cell("WA gagal — message_template_id berisi string nama bukan UUID", WHITE, 3200),
            cell("AlertService kirim nama template ('ticket_notify_any') bukan UUID-nya", LGRAY, 3000),
            cell("Resolve UUID via config('whatsapp.qontak.templates.{$name}') sebelum dispatch", WHITE, 3160),
          ]}),
          new TableRow({ children: [
            cell("WA gagal — error #131008 Required parameter is missing", WHITE, 3200),
            cell("Template punya tombol URL dengan variabel {{1}} yang wajib diisi di parameters.buttons", LGRAY, 3000),
            cell("Tambahkan meta['buttons'] = [['index'=>'0','type'=>'url','value'=>'cctv-alert']] di AlertService::sendWa()", WHITE, 3160),
          ]}),
          new TableRow({ children: [
            cell("ffmpeg tidak dikenali setelah install via WinGet", WHITE, 3200),
            cell("PATH belum refresh di sesi PowerShell/CMD yang sedang terbuka", LGRAY, 3000),
            cell("Set path absolut ffmpeg.exe langsung di .env via CCTV_FFMPEG_PATH", WHITE, 3160),
          ]}),
        ]
      }),
      sp(),
      new Paragraph({ children: [new TextRun("")], pageBreakBefore: true }),

      // ── 8. STATUS FITUR ───────────────────────────────────────────────────
      h1("  8.  STATUS FITUR SAAT INI"),
      sp(),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3200, 1400, 4760],
        rows: [
          hdrRow(["Fitur", "Status", "Catatan"], [3200, 1400, 4760]),
          statusRow("Level 1 — Network ping", "SELESAI", LGREEN, "Berjalan untuk semua 7 device"),
          statusRow("Level 2 — Service/port check", "SELESAI", LGREEN, "Berjalan untuk semua device yang punya port dikonfigurasi"),
          statusRow("Level 3 — Visual (DVR Cam 1-4)", "SELESAI", LGREEN, "Snapshot & analisis berjalan. Freeze detection per-pixel sudah fix."),
          statusRow("Level 3 — Visual (EZVIZ Cam 01 & 02)", "PENDING", LYELLOW, "RTSP port sudah aktif, tapi username/password/rtsp_path belum diisi di dashboard. Perlu dikonfigurasi."),
          statusRow("Notifikasi WhatsApp via Qontak", "SELESAI", LGREEN, "Sudah ditest — WA masuk ke HP KTI (081568401122). Nomor KTI + 2 Staff TI belum lengkap (baru 1 nomor)."),
          statusRow("Notifikasi Telegram", "OPSIONAL", LGRAY, "Belum dikonfigurasi. Bisa diaktifkan dengan isi CCTV_TELEGRAM_BOT_TOKEN & CHAT_ID di .env"),
          statusRow("Web Dashboard", "SELESAI", LGREEN, "Bisa diakses di jaringan LAN kantor"),
          statusRow("Deploy Scripts (install/update/scheduler)", "SELESAI", LGREEN, "install.bat, update.bat, setup-scheduler.bat, run-server.bat, run-queue.bat sudah siap"),
          statusRow("Git Repo GitHub", "SELESAI", LGREEN, "https://github.com/inta1102/cctv-monitor (private)"),
          statusRow("Panduan Instalasi PC Kantor", "SELESAI", LGREEN, "docs/Panduan-Instalasi-CCTV-Monitor.docx"),
          statusRow("Akses Dashboard dari Luar Kantor", "PENDING", LYELLOW, "Belum dikonfigurasi. Opsi: Cloudflare Tunnel, VPN, atau port forwarding."),
        ]
      }),
      sp(),
      new Paragraph({ children: [new TextRun("")], pageBreakBefore: true }),

      // ── 9. TODO / NEXT STEPS ─────────────────────────────────────────────
      h1("  9.  TODO & NEXT STEPS"),
      sp(),

      h2("Prioritas Tinggi"),
      bullet([bold("Tambah nomor WA KTI + 2 Staff TI"), new TextRun({ text: ": Edit CCTV_WA_NUMBERS di .env PC kantor setelah deploy. Format: 081568401122,08xxx,08xxx", size: 21, font: "Arial" })]),
      bullet([bold("Konfigurasi Level 3 Camera 01 & 02 (EZVIZ)"), new TextRun({ text: ": Isi username, password, dan RTSP path di halaman edit device pada dashboard. RTSP path EZVIZ biasanya: /h264/ch1/main/av_stream", size: 21, font: "Arial" })]),
      bullet([bold("Deploy ke PC Kantor"), new TextRun({ text: ": Ikuti panduan Panduan-Instalasi-CCTV-Monitor.docx. Jalankan install.bat as Administrator.", size: 21, font: "Arial" })]),
      sp(80),

      h2("Prioritas Menengah"),
      bullet([bold("Akses dari luar kantor"), new TextRun({ text: ": Pertimbangkan Cloudflare Tunnel (gratis, mudah) agar dashboard bisa diakses dari HP atau PC di luar kantor.", size: 21, font: "Arial" })]),
      bullet([bold("Tambah device baru"), new TextRun({ text: ": Cukup tambah via dashboard web, tidak perlu ubah kode.", size: 21, font: "Arial" })]),
      bullet([bold("Konfigurasi Telegram"), new TextRun({ text: ": Isi CCTV_TELEGRAM_BOT_TOKEN dan CCTV_TELEGRAM_CHAT_ID jika ingin notifikasi ganda (WA + Telegram).", size: 21, font: "Arial" })]),
      sp(80),

      h2("Perintah Berguna di PC Kantor"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [4500, 4860],
        rows: [
          hdrRow(["Perintah", "Fungsi"], [4500, 4860]),
          new TableRow({ children: [cell("php artisan cctv:check-network", LGRAY, 4500, true), cell("Cek manual Level 1 (ping semua device)", WHITE, 4860)] }),
          new TableRow({ children: [cell("php artisan cctv:check-service", LGRAY, 4500, true), cell("Cek manual Level 2 (port check)", WHITE, 4860)] }),
          new TableRow({ children: [cell("php artisan cctv:check-visual", LGRAY, 4500, true), cell("Cek manual Level 3 (snapshot & analisis)", WHITE, 4860)] }),
          new TableRow({ children: [cell("php artisan queue:work --queue=wa --once", LGRAY, 4500, true), cell("Proses 1 job WA dari antrian (untuk test)", WHITE, 4860)] }),
          new TableRow({ children: [cell("php artisan config:clear", LGRAY, 4500, true), cell("Bersihkan cache konfigurasi (wajib setelah edit .env)", WHITE, 4860)] }),
          new TableRow({ children: [cell("deploy\\update.bat", LGRAY, 4500, true), cell("Update aplikasi dari GitHub", WHITE, 4860)] }),
        ]
      }),
      sp(120),
      infoBox("Setelah setiap edit file .env, wajib jalankan: php artisan config:clear", LYELLOW, "!"),
      sp(),
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("D:/Proyek/cctv-monitor/docs/Summary-CCTV-Monitor.docx", buf);
  console.log("DONE: Summary-CCTV-Monitor.docx");
});
