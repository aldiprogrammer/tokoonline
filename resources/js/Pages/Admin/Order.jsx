import AdminLayout from '@/Layouts/AdminLayout'
import { router } from '@inertiajs/react'
import React from 'react'

export default function Order({ orders = [], statusPengiriman = [] }) {
    const formatRupiah = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(Number(value || 0))
    }

    const updateStatus = (orderId, status) => {
        router.put(`/admin/order/${orderId}/status-pengiriman`, {
            status_pengiriman: Number(status),
        }, {
            preserveScroll: true,
        })
    }

    const statusLabel = (value) => {
        return statusPengiriman.find((status) => Number(status.value) === Number(value))?.label || 'Pesanan dibuat'
    }

    const paymentClass = (order) => {
        return Number(order.status_pembayaran || 0) > 0 ? 'badge-success' : 'badge-warning'
    }

    return (
        <AdminLayout>
            <div className="rounded-2xl bg-base-100/80 p-6 shadow-lg">
                <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-base-content/60">Manajemen Order</p>
                        <h1 className="mt-1 text-2xl font-bold">Data order dan status pengiriman</h1>
                    </div>
                    <div className="stats shadow">
                        <div className="stat py-3">
                            <div className="stat-title text-xs">Total order</div>
                            <div className="stat-value text-2xl">{orders.length}</div>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="table min-w-[980px]">
                        <thead>
                            <tr>
                                <th>Kode Order</th>
                                <th>Penerima</th>
                                <th>Pengiriman</th>
                                <th>Total</th>
                                <th>Pembayaran</th>
                                <th>Status Pengiriman</th>
                                <th>Update</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length > 0 ? (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover">
                                        <td>
                                            <p className="font-bold">{order.kode_order}</p>
                                            <p className="text-xs text-base-content/50">{order.tanggal || '-'}</p>
                                        </td>
                                        <td>
                                            <p className="font-semibold">{order.nama_penerima || '-'}</p>
                                            <p className="text-xs text-base-content/50">{order.whatsapp || '-'}</p>
                                        </td>
                                        <td>
                                            <p className="max-w-72 truncate font-semibold">{order.destination_label || '-'}</p>
                                            <p className="text-xs uppercase text-base-content/50">
                                                {order.kurir || '-'} {order.layanan_kurir || ''}
                                            </p>
                                        </td>
                                        <td className="font-bold">{formatRupiah(order.total_harga)}</td>
                                        <td>
                                            <span className={`badge ${paymentClass(order)}`}>
                                                {Number(order.status_pembayaran || 0) > 0 ? 'Lunas' : 'Menunggu'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="badge badge-info badge-outline text-xs">
                                                {statusLabel(order.status_pengiriman)}
                                            </span>
                                        </td>
                                        <td>
                                            <select
                                                value={Number(order.status_pengiriman || 0)}
                                                onChange={(e) => updateStatus(order.id, e.target.value)}
                                                className="input select-bordered text-xs w-full"
                                            >
                                                {statusPengiriman.map((status) => (
                                                    <option key={status.value} value={status.value}>
                                                        {status.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="py-10 text-center text-base-content/60">
                                        Belum ada order.
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
