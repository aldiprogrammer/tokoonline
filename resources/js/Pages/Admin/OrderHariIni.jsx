import AdminLayout from '@/Layouts/AdminLayout'
import { router } from '@inertiajs/react'
import React, { useState } from 'react'

export default function OrderHariIni({ orders, statusPengiriman = [] }) {
    const ordersData = orders?.data ?? orders ?? []
    const ordersLinks = orders?.links ?? []
    const [detailOrder, setDetailOrder] = useState(null)

    const formatRupiah = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(v || 0))

    const updateStatus = (orderId, status) => {
        router.put(`/admin/order/${orderId}/status-pengiriman`, {
            status_pengiriman: Number(status),
        }, { preserveScroll: true })
    }

    const updateResi = (orderId, resi) => {
        router.put(`/admin/order/${orderId}/resi`, {
            no_resi: resi,
        }, { preserveScroll: true })
    }

    const statusLabel = (value) => {
        return statusPengiriman.find((s) => Number(s.value) === Number(value))?.label || 'Pesanan dibuat'
    }

    const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

    return (
        <AdminLayout>
            <div className="rounded-2xl bg-base-100/80 p-6 shadow-lg">
                <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-base-content/60">Order Hari Ini</p>
                        <h1 className="mt-1 text-2xl font-bold">{today}</h1>
                    </div>
                    <div className="stats shadow">
                        <div className="stat py-3">
                            <div className="stat-title text-xs">Order hari ini</div>
                            <div className="stat-value text-2xl">{ordersData.length}</div>
                        </div>
                    </div>
                </div>

                {ordersData.length > 0 ? (
                    <div className="space-y-4">
                        {ordersData.map((order) => (
                            <div key={order.id} className="rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm">
                                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="font-bold">{order.kode_order}</p>
                                                <p className="text-xs text-base-content/50">{order.created_at ? new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</p>
                                            </div>
                                            <span className={`badge ${Number(order.status_pembayaran || 0) > 0 ? 'badge-success' : 'badge-warning'}`}>
                                                {Number(order.status_pembayaran || 0) > 0 ? 'Lunas' : 'Menunggu'}
                                            </span>
                                        </div>
                                        <div className="mt-3 grid gap-2 text-sm md:grid-cols-3">
                                            <div>
                                                <span className="text-base-content/50 text-xs">Penerima</span>
                                                <p className="font-semibold">{order.nama_penerima || '-'}</p>
                                                <p className="text-xs text-base-content/50">{order.whatsapp || '-'}</p>
                                            </div>
                                            <div>
                                                <span className="text-base-content/50 text-xs">Customer</span>
                                                <p className="font-semibold">{order.user?.name || order.user?.email || '-'}</p>
                                                <p className="text-xs text-base-content/50">{order.user?.email || '-'}</p>
                                            </div>
                                            <div>
                                                <span className="text-base-content/50 text-xs">Total</span>
                                                <p className="font-bold">{formatRupiah(order.total_harga)}</p>
                                                <span className="badge badge-info badge-outline badge-xs mt-1">{statusLabel(order.status_pengiriman)}</span>
                                            </div>
                                        </div>
                                        <div className="mt-2 text-xs text-base-content/50 truncate">
                                            {order.destination_label || '-'} &middot; {order.kurir || '-'} {order.layanan_kurir || ''}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setDetailOrder(order)}
                                        className="btn btn-primary btn-sm"
                                    >
                                        Detail
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-16 text-center text-base-content/60">
                        <i className="fas fa-calendar-day text-4xl mb-3 block opacity-50"></i>
                        <p className="font-semibold">Belum ada order hari ini.</p>
                    </div>
                )}
            </div>

            {ordersLinks.length > 3 && (
                <div className="mt-6 flex justify-center">
                    <div className="join">
                        {ordersLinks.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url || link.active}
                                onClick={() => router.get(link.url, {}, { preserveScroll: true, preserveState: true })}
                                className={`join-item btn btn-sm ${link.active ? 'btn-active' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {detailOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-xl font-bold">Detail Order</h2>
                            <button
                                type="button"
                                onClick={() => setDetailOrder(null)}
                                className="grid h-9 w-9 place-items-center rounded-lg hover:bg-gray-100"
                            >
                                <i className="fas fa-xmark"></i>
                            </button>
                        </div>

                        <div className="mb-5 grid gap-3 rounded-xl bg-gray-50 p-4 text-sm sm:grid-cols-2">
                            <div>
                                <span className="font-semibold text-gray-500">Kode Order</span>
                                <p className="font-bold">{detailOrder.kode_order}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-500">Tanggal</span>
                                <p>{detailOrder.tanggal || '-'}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-500">Penerima</span>
                                <p className="font-bold">{detailOrder.nama_penerima || '-'}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-500">WhatsApp</span>
                                <p>{detailOrder.whatsapp || '-'}</p>
                            </div>
                            <div className="sm:col-span-2">
                                <span className="font-semibold text-gray-500">Customer</span>
                                <p className="font-bold">{detailOrder.user?.name || detailOrder.user?.email || '-'}</p>
                                <p className="text-xs text-gray-500">{detailOrder.user?.email || '-'}</p>
                            </div>
                            <div className="sm:col-span-2">
                                <span className="font-semibold text-gray-500">Alamat Pengiriman</span>
                                <p>{detailOrder.alamat_pengiriman || '-'}</p>
                            </div>
                            <div className="sm:col-span-2">
                                <span className="font-semibold text-gray-500">Tujuan</span>
                                <p>{detailOrder.destination_label || '-'}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-500">Kurir</span>
                                <p className="uppercase">{detailOrder.kurir || '-'} {detailOrder.layanan_kurir || ''}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-500">Estimasi</span>
                                <p>{detailOrder.estimasi || '-'}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-500">Subtotal</span>
                                <p className="font-bold">{formatRupiah(detailOrder.subtotal)}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-500">Ongkir</span>
                                <p className="font-bold">{formatRupiah(detailOrder.ongkir)}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-500">Total Bayar</span>
                                <p className="text-lg font-black">{formatRupiah(detailOrder.total_harga)}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-500">Status Pembayaran</span>
                                <p>
                                    <span className={`badge ${Number(detailOrder.status_pembayaran || 0) > 0 ? 'badge-success' : 'badge-warning'}`}>
                                        {Number(detailOrder.status_pembayaran || 0) > 0 ? 'Lunas' : 'Menunggu'}
                                    </span>
                                </p>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-500">Status Pengiriman</span>
                                <select
                                    value={Number(detailOrder.status_pengiriman || 0)}
                                    onChange={(e) => updateStatus(detailOrder.id, e.target.value)}
                                    className="select select-bordered select-sm w-full mt-1"
                                >
                                    {statusPengiriman.map((s) => (
                                        <option key={s.value} value={s.value}>{s.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-500">No. Resi</span>
                                <input
                                    type="text"
                                    defaultValue={detailOrder.no_resi || ''}
                                    placeholder="Input nomor resi"
                                    className="input input-bordered input-sm w-full mt-1"
                                    onBlur={(e) => {
                                        const val = e.target.value.trim()
                                        if (val !== (detailOrder.no_resi || '')) {
                                            updateResi(detailOrder.id, val)
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.target.blur()
                                        }
                                    }}
                                />
                            </div>
                            <div>
                                <span className="font-semibold text-gray-500">Status Midtrans</span>
                                <p>{detailOrder.status_midtrans || '-'}</p>
                            </div>
                        </div>

                        <h3 className="mb-3 text-lg font-bold">Produk Dibeli</h3>
                        <div className="space-y-3">
                            {detailOrder.items?.length > 0 ? (
                                detailOrder.items.map((item) => (
                                    <div key={item.id} className="flex gap-3 rounded-xl border border-gray-200 p-3">
                                        {item.image && (
                                            <img src={item.image} alt={item.nama_produk} className="h-16 w-16 shrink-0 rounded-lg object-cover" />
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold">{item.nama_produk}</p>
                                            <p className="text-xs text-gray-500">Ukuran {item.ukuran || '-'}</p>
                                            <div className="mt-1 flex items-center gap-3 text-sm">
                                                <span>{formatRupiah(item.harga)} x {item.qty}</span>
                                                <span className="font-bold">= {formatRupiah(item.total_harga)}</span>
                                            </div>
                                            {item.sablon_position && (
                                                <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                                                    <i className="fas fa-palette"></i>
                                                    <span>Sablon {item.sablon_position} {item.sablon_price ? `(+${formatRupiah(item.sablon_price)})` : ''}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500">Tidak ada data produk.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    )
}
