import AdminLayout from "@/Layouts/AdminLayout"
import { Link, router } from "@inertiajs/react"

const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316', '#14b8a6']

export default function Dashboard({ stats = {}, latestProducts = [], chartLabels = [], chartData = [] }) {
    const formatRupiah = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(v || 0))
    const maxData = Math.max(...chartData, 1)

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <p className="text-sm font-semibold text-base-content/60">Dashboard</p>
                    <h1 className="mt-1 text-2xl font-bold">Ringkasan toko</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-xl">
                        <p className="text-sm opacity-80">Total Produk</p>
                        <h2 className="text-3xl font-bold mt-1">{stats.totalProduk ?? 0}</h2>
                    </div>
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xl">
                        <p className="text-sm opacity-80">Total Pesanan</p>
                        <h2 className="text-3xl font-bold mt-1">{stats.totalOrders ?? 0}</h2>
                    </div>
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-xl">
                        <p className="text-sm opacity-80">Total Pendapatan</p>
                        <h2 className="text-3xl font-bold mt-1">{formatRupiah(stats.totalRevenue)}</h2>
                    </div>
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xl">
                        <p className="text-sm opacity-80">Pesanan Hari Ini</p>
                        <h2 className="text-3xl font-bold mt-1">{stats.todayOrders ?? 0}</h2>
                    </div>
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-xl">
                        <p className="text-sm opacity-80">Uang Masuk Hari Ini</p>
                        <h2 className="text-3xl font-bold mt-1">{formatRupiah(stats.todayRevenue)}</h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-base-100/70 backdrop-blur rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-semibold">Grafik Penjualan 12 Bulan</h2>
                        </div>
                        {chartLabels.length > 0 ? (
                            <div className="relative h-56">
                                <div className="absolute inset-0 flex items-end gap-2 px-2">
                                    {chartLabels.map((label, i) => {
                                        const height = maxData > 0 ? (chartData[i] / maxData) * 100 : 0
                                        return (
                                            <div key={label} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                                                <span className="text-[10px] font-bold text-gray-600">{formatRupiah(chartData[i]).replace('Rp', '').trim()}</span>
                                                <div
                                                    className="w-full rounded-t-md transition-all duration-300 hover:opacity-80"
                                                    style={{ height: `${Math.max(height, 1)}%`, backgroundColor: colors[i % colors.length] }}
                                                    title={`${label}: ${formatRupiah(chartData[i])}`}
                                                ></div>
                                                <span className="text-[9px] text-gray-400 text-center leading-tight">{label.split(' ')[0]}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-10">Belum ada data penjualan.</p>
                        )}
                    </div>

                    <div className="bg-base-100/70 backdrop-blur rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Produk Terbaru</h2>
                            <Link href="/admin/tambahproduk" className="btn btn-primary btn-sm">+ Tambah</Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Produk</th>
                                        <th>Harga</th>
                                        <th>Stok</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {latestProducts.length > 0 ? (
                                        latestProducts.map((p) => (
                                            <tr key={p.id} className="hover">
                                                <td className="flex items-center gap-3">
                                                    {p.image && <img src={p.image} alt={p.nama} className="h-10 w-10 rounded-lg object-cover" />}
                                                    <span className="font-medium">{p.nama}</span>
                                                </td>
                                                <td>{formatRupiah(p.harga)}</td>
                                                <td><span className={`badge ${p.stok > 10 ? 'badge-success' : p.stok > 0 ? 'badge-warning' : 'badge-error'}`}>{p.stok}</span></td>
                                                <td><Link href="/admin/produk" className="btn btn-sm">Edit</Link></td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="4" className="py-8 text-center text-base-content/60">Belum ada produk.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
