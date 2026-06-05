import AdminLayout from '@/Layouts/AdminLayout'
import React, { useState, useMemo } from 'react'

export default function Customer({ customers = [] }) {
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(10)

    const formatRupiah = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(v || 0))

    const filtered = useMemo(() => {
        if (!search.trim()) return customers
        const q = search.toLowerCase()
        return customers.filter((c) =>
            c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)
        )
    }, [customers, search])

    const totalPages = Math.ceil(filtered.length / perPage)
    const start = (page - 1) * perPage
    const end = start + perPage
    const paginated = filtered.slice(start, end)

    const pageNumbers = () => {
        const pages = []
        const maxVisible = 5
        let startPage = Math.max(1, page - Math.floor(maxVisible / 2))
        let endPage = Math.min(totalPages, startPage + maxVisible - 1)
        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1)
        }
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i)
        }
        return pages
    }

    return (
        <AdminLayout>
            <div className="rounded-2xl bg-base-100/80 p-6 shadow-lg">
                <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-base-content/60">Customer</p>
                        <h1 className="mt-1 text-2xl font-bold">Data customer</h1>
                    </div>
                    <div className="stats shadow">
                        <div className="stat py-3">
                            <div className="stat-title text-xs">Total customer</div>
                            <div className="stat-value text-2xl">{customers.length}</div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                        <span>Tampilkan</span>
                        <select
                            className="select select-bordered select-sm w-20 text-xs"
                            value={perPage}
                            onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <span>data</span>
                    </div>
                    <div className="join">
                        <span className="join-item bg-base-200 border border-base-300 border-r-0 px-3 flex items-center text-base-content/50">
                            <i className="fas fa-search text-xs"></i>
                        </span>
                        <input
                            type="text"
                            className="join-item input input-bordered input-sm w-56"
                            placeholder="Cari nama atau email..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Email</th>
                                <th>Bergabung</th>
                                <th className="text-center">Total Order</th>
                                <th className="text-right">Total Belanja</th>
                                <th>Terakhir Order</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.length > 0 ? (
                                paginated.map((c) => (
                                    <tr key={c.id} className="hover">
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="avatar">
                                                    <div className="w-9 rounded-full">
                                                        {c.avatar ? (
                                                            <img src={c.avatar} alt={c.name} />
                                                        ) : (
                                                            <div className="bg-primary text-white flex items-center justify-center text-sm font-bold">
                                                                {c.name?.charAt(0)?.toUpperCase() || '?'}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="font-semibold">{c.name || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="text-sm">{c.email || '-'}</td>
                                        <td className="text-sm text-base-content/60">{c.created_at ? new Date(c.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}</td>
                                        <td className="text-center font-semibold">{c.total_orders}</td>
                                        <td className="text-right font-bold">{formatRupiah(c.total_spent)}</td>
                                        <td className="text-sm text-base-content/60">{c.last_order_date || '-'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-10 text-center text-base-content/60">
                                        {search ? 'Tidak ada customer yang cocok.' : 'Belum ada customer.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4 text-sm">
                    <div className="text-base-content/60">
                        Menampilkan {filtered.length > 0 ? start + 1 : 0} - {Math.min(end, filtered.length)} dari {filtered.length} data
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            className="btn btn-sm btn-ghost"
                            disabled={page <= 1}
                            onClick={() => setPage(page - 1)}
                        >
                            <i className="fas fa-chevron-left"></i>
                        </button>
                        {pageNumbers().map((p) => (
                            <button
                                key={p}
                                className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => setPage(p)}
                            >
                                {p}
                            </button>
                        ))}
                        <button
                            className="btn btn-sm btn-ghost"
                            disabled={page >= totalPages}
                            onClick={() => setPage(page + 1)}
                        >
                            <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
