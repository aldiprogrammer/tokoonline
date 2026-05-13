import AdminLayout from '@/Layouts/AdminLayout'
import { router } from '@inertiajs/react'
import React, { useState } from 'react'

export default function Laporan({ grouped = [], grandTotal = 0, bulan, tahun, totalOrder = 0, bulanList = [], tahunList = [], startDate, endDate }) {
    const [selectedBulan, setSelectedBulan] = useState(bulan)
    const [selectedTahun, setSelectedTahun] = useState(tahun)
    const [selectedStart, setSelectedStart] = useState(startDate || '')
    const [selectedEnd, setSelectedEnd] = useState(endDate || '')
    const [mode, setMode] = useState('bulan')

    const formatRupiah = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(v || 0))

    const filter = () => {
        const params = mode === 'bulan'
            ? { bulan: selectedBulan, tahun: selectedTahun }
            : { start_date: selectedStart, end_date: selectedEnd }
        router.get('/admin/laporan', params, { preserveState: true })
    }

    const exportPdf = () => {
        const params = mode === 'bulan'
            ? `bulan=${selectedBulan}&tahun=${selectedTahun}`
            : `start_date=${selectedStart}&end_date=${selectedEnd}`
        window.open(`/admin/laporan/pdf?${params}`, '_blank')
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-base-content/60">Laporan</p>
                        <h1 className="mt-1 text-2xl font-bold">Laporan Penjualan Bulanan</h1>
                    </div>
                </div>

                <div className="bg-base-100/70 backdrop-blur rounded-2xl shadow-lg p-6">
                    <div className="flex flex-wrap items-end gap-3 mb-6">
                        <div className="flex items-center gap-1 bg-base-200 rounded-lg p-1">
                            <button
                                type="button"
                                onClick={() => setMode('bulan')}
                                className={`px-3 py-1.5 text-sm font-semibold rounded-md transition ${mode === 'bulan' ? 'bg-white shadow-sm' : ''}`}
                            >
                                Per Bulan
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode('tanggal')}
                                className={`px-3 py-1.5 text-sm font-semibold rounded-md transition ${mode === 'tanggal' ? 'bg-white shadow-sm' : ''}`}
                            >
                                Per Tanggal
                            </button>
                        </div>

                        {mode === 'bulan' ? (
                            <>
                                <div>
                                    <label className="text-xs font-semibold mb-1 block">Bulan</label>
                                    <select value={selectedBulan} onChange={(e) => setSelectedBulan(e.target.value)} className="select select-bordered select-sm">
                                        {bulanList.map((b) => (
                                            <option key={b.value} value={b.value}>{b.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold mb-1 block">Tahun</label>
                                    <select value={selectedTahun} onChange={(e) => setSelectedTahun(e.target.value)} className="select select-bordered select-sm">
                                        {tahunList.map((t) => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="text-xs font-semibold mb-1 block">Dari Tanggal</label>
                                    <input type="date" value={selectedStart} onChange={(e) => setSelectedStart(e.target.value)} className="input input-bordered input-sm" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold mb-1 block">Sampai Tanggal</label>
                                    <input type="date" value={selectedEnd} onChange={(e) => setSelectedEnd(e.target.value)} className="input input-bordered input-sm" />
                                </div>
                            </>
                        )}

                        <button onClick={filter} className="btn btn-primary btn-sm">Tampilkan</button>
                        <button onClick={exportPdf} className="btn btn-accent btn-sm">
                            <i className="fas fa-file-pdf mr-1"></i> Export PDF
                        </button>
                    </div>

                    {grouped.length > 0 ? (
                        <>
                            <div className="flex flex-wrap gap-4 mb-4 text-sm">
                                <span className="font-semibold">Total Transaksi: <span className="text-primary">{totalOrder}</span></span>
                                <span className="font-semibold">Grand Total: <span className="text-primary">{formatRupiah(grandTotal)}</span></span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="table min-w-[800px]">
                                    <thead>
                                        <tr>
                                            <th>Tanggal</th>
                                            <th>Kode Order</th>
                                            <th>Penerima</th>
                                            <th className="text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {grouped.map((grup) => (
                                            <React.Fragment key={grup.tanggal}>
                                                <tr className="bg-base-200/50">
                                                    <td colSpan="4" className="font-bold text-sm">
                                                        {grup.tanggal} — {grup.jumlah_order} transaksi, {formatRupiah(grup.total_penjualan)}
                                                    </td>
                                                </tr>
                                                {grup.items.map((item) => (
                                                    <tr key={item.kode_order} className="hover">
                                                        <td></td>
                                                        <td className="font-semibold">{item.kode_order}</td>
                                                        <td>{item.nama_penerima}</td>
                                                        <td className="text-right font-bold">{formatRupiah(item.total_harga)}</td>
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="py-12 text-center text-base-content/60">
                            <i className="fas fa-file-invoice text-3xl mb-3 block opacity-50"></i>
                            <p>Tidak ada data penjualan untuk periode ini.</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}
