<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Penjualan {{ $bulan }} {{ $tahun }}</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; color: #1f2937; }
        h1 { text-align: center; font-size: 18px; margin-bottom: 4px; }
        .subtitle { text-align: center; font-size: 13px; color: #6b7280; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        th, td { border: 1px solid #d1d5db; padding: 6px 8px; text-align: left; }
        th { background: #1f2937; color: white; font-size: 11px; }
        .tgl-header { background: #f3f4f6; font-weight: bold; }
        .text-right { text-align: right; }
        .grand-total { font-weight: bold; font-size: 14px; text-align: right; margin-top: 10px; }
        .summary { margin-bottom: 16px; }
        .summary p { margin: 2px 0; }
    </style>
</head>
<body>
    <h1>LAPORAN PENJUALAN</h1>
    <p class="subtitle">Bulan {{ $bulan }} {{ $tahun }}</p>

    <div class="summary">
        <p><strong>Total Transaksi:</strong> {{ $totalOrder }}</p>
        <p><strong>Total Penjualan:</strong> Rp {{ number_format($grandTotal, 0, ',', '.') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Tanggal</th>
                <th>Kode Order</th>
                <th>Penerima</th>
                <th class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($grouped as $grup)
                <tr class="tgl-header">
                    <td colspan="4">{{ $grup['tanggal'] }} — {{ $grup['jumlah_order'] }} transaksi, Rp {{ number_format($grup['total_penjualan'], 0, ',', '.') }}</td>
                </tr>
                @foreach ($grup['items'] as $item)
                    <tr>
                        <td></td>
                        <td>{{ $item->kode_order }}</td>
                        <td>{{ $item->nama_penerima }}</td>
                        <td class="text-right">Rp {{ number_format((int) $item->total_harga, 0, ',', '.') }}</td>
                    </tr>
                @endforeach
            @endforeach
        </tbody>
    </table>

    <div class="grand-total">
        Grand Total: Rp {{ number_format($grandTotal, 0, ',', '.') }}
    </div>
</body>
</html>
