import AdminLayout from '@/Layouts/AdminLayout'
import React, { useState } from 'react'

export default function Customer({ customers = [] }) {
    const [search, setSearch] = useState('')

    const formatRupiah = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(v || 0))

    const filtered = customers.filter((c) => {
        if (!search.trim()) return true
        const q = search.toLowerCase()
        return c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)
    })

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

                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Cari nama atau email customer..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input input-bordered w-full max-w-xs input-sm"
                    />
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
                            {filtered.length > 0 ? (
                                filtered.map((c) => (
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
            </div>
        </AdminLayout>
    )
}
