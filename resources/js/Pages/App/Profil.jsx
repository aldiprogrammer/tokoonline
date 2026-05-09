import { Head, Link, router, useForm, usePage } from '@inertiajs/react'
import React, { useEffect, useState } from 'react'
import Swal from 'sweetalert2'

export default function Profil({ profil, alamat, orders = [] }) {
    const { auth, flash, cart: initialCart } = usePage().props
    const [activeMenu, setActiveMenu] = useState('profil')
    const [cart, setCart] = useState(initialCart ?? [])
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [payingOrderId, setPayingOrderId] = useState(null)

    const { data, setData, post, processing, errors } = useForm({
        nama: profil?.nama || auth?.user?.name || '',
        whatsapp: profil?.whatsapp || '',
        provinsi: alamat?.provinsi || '',
        kabupaten: alamat?.kabupaten || '',
        kecamatan: alamat?.kecamatan || '',
        kelurahan: alamat?.kelurahan || '',
        alamat: alamat?.alamat || '',
        kode_pos: alamat?.kode_pos || '',
    })

    useEffect(() => {
        setCart(initialCart ?? [])
    }, [initialCart])

    useEffect(() => {
        if (flash?.success || flash?.error) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: flash.success ? 'success' : 'error',
                title: flash.success || flash.error,
                showConfirmButton: false,
                timer: 2400,
                timerProgressBar: true,
            })
        }
    }, [flash?.success, flash?.error])

    const formatRupiah = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(Number(value || 0))
    }

    const cartCount = cart.reduce((total, item) => total + item.qty, 0)
    const cartTotal = cart.reduce((total, item) => total + item.harga * item.qty, 0)
    const latestOrder = orders[0]

    const statusList = [
        { label: 'Pesanan dibuat', icon: 'fa-receipt' },
        { label: 'Pembayaran berhasil', icon: 'fa-wallet' },
        { label: 'Pesanan dikemas', icon: 'fa-box' },
        { label: 'Dalam pengiriman', icon: 'fa-truck-fast' },
        { label: 'Selesai', icon: 'fa-circle-check' },
    ]

    const getStatusIndex = (status) => Math.min(Math.max(Number(status || 0), 0), statusList.length - 1)

    const orderStatusText = (order) => {
        if (Number(order?.status_pembayaran || 0) === 0) {
            return 'Menunggu pembayaran'
        }

        const index = getStatusIndex(order?.status_pembayaran)
        return statusList[index]?.label || 'Pesanan dibuat'
    }

    const paymentBadgeClass = (order) => {
        return Number(order?.status_pembayaran || 0) > 0
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-amber-50 text-amber-700'
    }

    const submitProfil = (e) => {
        e.preventDefault()
        post('/profil', { preserveScroll: true })
    }

    const sendCartRequest = async (url, method, payload = null) => {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
            },
            credentials: 'same-origin',
            body: payload ? JSON.stringify(payload) : null,
        })

        const result = await response.json()

        if (!response.ok) {
            throw new Error(result.message || 'Gagal memperbarui keranjang')
        }

        setCart(result.cart || [])
    }

    const increaseQty = async (cartId) => {
        const item = cart.find((cartItem) => cartItem.id === cartId)
        if (!item) return
        await sendCartRequest(`/cart/${cartId}`, 'PUT', { qty: Math.min(item.qty + 1, item.stok) })
    }

    const decreaseQty = async (cartId) => {
        const item = cart.find((cartItem) => cartItem.id === cartId)
        if (!item) return

        if (item.qty <= 1) {
            await sendCartRequest(`/cart/${cartId}`, 'DELETE')
            return
        }

        await sendCartRequest(`/cart/${cartId}`, 'PUT', { qty: item.qty - 1 })
    }

    const removeFromCart = async (cartId) => {
        await sendCartRequest(`/cart/${cartId}`, 'DELETE')
    }

    const payOrder = async (orderId) => {
        try {
            setPayingOrderId(orderId)
            const response = await fetch(`/orders/${orderId}/pay`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                },
                credentials: 'same-origin',
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.message || 'Gagal membuka pembayaran')
            }

            if (result.payment?.redirect_url) {
                window.location.href = result.payment.redirect_url
                return
            }

            Swal.fire('Info', result.message || 'Link pembayaran belum tersedia.', 'info')
        } catch (error) {
            Swal.fire('Gagal', error.message, 'error')
        } finally {
            setPayingOrderId(null)
        }
    }

    const logoutUser = () => {
        router.post('/logoutuser')
    }

    const menuItems = [
        { key: 'profil', label: 'Data Diri', icon: 'fa-user' },
        { key: 'pengiriman', label: 'Proses Pengiriman', icon: 'fa-truck-fast' },
        { key: 'pembelian', label: 'Data Pembelian', icon: 'fa-bag-shopping' },
    ]

    return (
        <>
            <Head title="Profil Customer" />

            <div className="min-h-screen bg-white text-gray-950">
                <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                        <Link href="/" className="flex min-w-0 items-center gap-2 text-lg font-bold">
                            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gray-950 text-white">
                                <i className="fas fa-shirt"></i>
                            </span>
                            <span className="truncate">FEBRINOX</span>
                        </Link>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setIsCartOpen(true)}
                                className="relative grid h-10 w-10 place-items-center rounded-lg bg-gray-950 text-white hover:bg-gray-800"
                            >
                                <i className="fas fa-bag-shopping"></i>
                                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-xs">
                                    {cartCount}
                                </span>
                            </button>

                            <div className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 px-2 sm:px-3">
                                {auth.user.avatar ? (
                                    <img src={auth.user.avatar} alt={auth.user.name} className="h-6 w-6 rounded-full object-cover" />
                                ) : (
                                    <span className="grid h-6 w-6 place-items-center rounded-full bg-gray-950 text-xs font-bold text-white">
                                        {auth.user.name?.charAt(0)?.toUpperCase()}
                                    </span>
                                )}
                                <span className="hidden max-w-32 truncate text-sm font-semibold sm:inline">{auth.user.name}</span>
                            </div>

                            <button
                                type="button"
                                onClick={logoutUser}
                                className="hidden h-10 w-10 place-items-center rounded-lg border border-gray-200 text-red-600 hover:bg-red-50 sm:grid"
                            >
                                <i className="fas fa-right-from-bracket"></i>
                            </button>
                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mb-5 text-sm text-gray-500">
                        <Link href="/" className="font-semibold text-gray-950 hover:underline">Toko</Link>
                        <span className="mx-2">/</span>
                        <span>Profil</span>
                    </div>

                    <section className="mb-6 border-b border-gray-200 pb-6">
                        <p className="text-sm font-semibold text-gray-500">Akun Customer</p>
                        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <h1 className="text-3xl font-black">Profil dan pesanan kamu</h1>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                                    Lengkapi data diri dan alamat supaya checkout serta pengiriman pesanan lebih cepat diproses.
                                </p>
                            </div>
                            <div className="grid grid-cols-3 overflow-hidden rounded-lg border border-gray-200 text-center text-sm">
                                <div className="px-4 py-3">
                                    <p className="font-black">{orders.length}</p>
                                    <p className="text-xs text-gray-500">Order</p>
                                </div>
                                <div className="border-x border-gray-200 px-4 py-3">
                                    <p className="font-black">{Number(profil?.point || 0)}</p>
                                    <p className="text-xs text-gray-500">Point</p>
                                </div>
                                <div className="px-4 py-3">
                                    <p className="font-black">{cartCount}</p>
                                    <p className="text-xs text-gray-500">Keranjang</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
                        <aside className="lg:sticky lg:top-24 lg:self-start">
                            <div className="grid gap-2 rounded-lg border border-gray-200 p-2">
                                {menuItems.map((item) => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        onClick={() => setActiveMenu(item.key)}
                                        className={`flex h-11 items-center gap-3 rounded-lg px-3 text-left text-sm font-bold ${activeMenu === item.key ? 'bg-gray-950 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                                    >
                                        <i className={`fas ${item.icon} w-5 text-center`}></i>
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </aside>

                        <section>
                            {activeMenu === 'profil' && (
                                <form onSubmit={submitProfil} className="rounded-lg border border-gray-200 p-4 sm:p-6">
                                    <div className="mb-5 flex items-center justify-between gap-4">
                                        <div>
                                            <h2 className="text-xl font-black">Data diri customer</h2>
                                            <p className="mt-1 text-sm text-gray-500">Nama, WhatsApp, dan alamat utama untuk pengiriman.</p>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="rounded-lg bg-gray-950 px-4 py-3 text-sm font-bold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                                        >
                                            {processing ? 'Menyimpan...' : 'Simpan'}
                                        </button>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <Input label="Nama lengkap" value={data.nama} error={errors.nama} onChange={(value) => setData('nama', value)} />
                                        <Input label="Nomor WhatsApp" type="tel" value={data.whatsapp} error={errors.whatsapp} onChange={(value) => setData('whatsapp', value)} />
                                        <Input label="Provinsi" value={data.provinsi} error={errors.provinsi} onChange={(value) => setData('provinsi', value)} />
                                        <Input label="Kabupaten / Kota" value={data.kabupaten} error={errors.kabupaten} onChange={(value) => setData('kabupaten', value)} />
                                        <Input label="Kecamatan" value={data.kecamatan} error={errors.kecamatan} onChange={(value) => setData('kecamatan', value)} />
                                        <Input label="Kelurahan" value={data.kelurahan} error={errors.kelurahan} onChange={(value) => setData('kelurahan', value)} />
                                        <Input label="Kode pos" value={data.kode_pos} error={errors.kode_pos} onChange={(value) => setData('kode_pos', value)} />
                                        <div className="md:col-span-2">
                                            <label className="text-sm font-bold text-gray-700">Alamat lengkap</label>
                                            <textarea
                                                value={data.alamat}
                                                onChange={(e) => setData('alamat', e.target.value)}
                                                className="mt-2 min-h-28 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-950"
                                                placeholder="Nama jalan, nomor rumah, RT/RW, patokan"
                                                required
                                            ></textarea>
                                            {errors.alamat && <p className="mt-1 text-xs font-semibold text-red-600">{errors.alamat}</p>}
                                        </div>
                                    </div>
                                </form>
                            )}

                            {activeMenu === 'pengiriman' && (
                                <div className="rounded-lg border border-gray-200 p-4 sm:p-6">
                                    <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                        <div>
                                            <h2 className="text-xl font-black">Proses pengiriman</h2>
                                            <p className="mt-1 text-sm text-gray-500">Pantau posisi pesanan terakhir dari status order.</p>
                                        </div>
                                        {latestOrder && (
                                            <span className="rounded-lg bg-gray-950 px-3 py-2 text-sm font-bold text-white">
                                                {latestOrder.kode_order}
                                            </span>
                                        )}
                                    </div>

                                    {latestOrder ? (
                                        <div>
                                            <div className="mb-6 rounded-lg bg-gray-50 p-4">
                                                <p className="text-sm text-gray-500">Status saat ini</p>
                                                <p className="mt-1 text-2xl font-black">{orderStatusText(latestOrder)}</p>
                                                <p className="mt-1 text-sm text-gray-600">Tanggal order: {latestOrder.tanggal || '-'}</p>
                                            </div>

                                            <div className="grid gap-3 md:grid-cols-5">
                                                {statusList.map((status, index) => {
                                                    const isDone = index <= getStatusIndex(latestOrder.status_pembayaran)

                                                    return (
                                                        <div key={status.label} className={`rounded-lg border p-4 ${isDone ? 'border-gray-950 bg-gray-950 text-white' : 'border-gray-200 bg-white text-gray-500'}`}>
                                                            <i className={`fas ${status.icon} mb-3 text-lg`}></i>
                                                            <p className="text-sm font-black">{status.label}</p>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        <EmptyState icon="fa-truck-fast" title="Belum ada proses pengiriman" description="Setelah kamu membuat pesanan, status pengiriman akan tampil di sini." />
                                    )}
                                </div>
                            )}

                            {activeMenu === 'pembelian' && (
                                <div className="rounded-lg border border-gray-200 p-4 sm:p-6">
                                    <div className="mb-5">
                                        <h2 className="text-xl font-black">Data pembelian customer</h2>
                                        <p className="mt-1 text-sm text-gray-500">Riwayat order yang pernah dibuat oleh akun ini.</p>
                                    </div>

                                    {orders.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full min-w-[680px] text-left text-sm">
                                                <thead>
                                                    <tr className="border-b border-gray-200 text-xs uppercase text-gray-500">
                                                        <th className="py-3 pr-4">Kode Order</th>
                                                        <th className="py-3 pr-4">Tanggal</th>
                                                        <th className="py-3 pr-4">Total</th>
                                                        <th className="py-3 pr-4">Status</th>
                                                        <th className="py-3 pr-4">Aksi</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {orders.map((order) => (
                                                        <tr key={order.id} className="border-b border-gray-100">
                                                            <td className="py-4 pr-4 font-black">{order.kode_order}</td>
                                                            <td className="py-4 pr-4 text-gray-600">{order.tanggal || '-'}</td>
                                                            <td className="py-4 pr-4 font-black">{formatRupiah(order.total_harga)}</td>
                                                            <td className="py-4 pr-4">
                                                                <span className={`rounded-md px-2 py-1 text-xs font-bold ${paymentBadgeClass(order)}`}>
                                                                    {orderStatusText(order)}
                                                                </span>
                                                            </td>
                                                            <td className="py-4 pr-4">
                                                                {Number(order.status_pembayaran || 0) === 0 ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => payOrder(order.id)}
                                                                        disabled={payingOrderId === order.id}
                                                                        className="rounded-lg bg-gray-950 px-3 py-2 text-xs font-bold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                                                                    >
                                                                        {payingOrderId === order.id ? 'Membuka...' : 'Bayar Sekarang'}
                                                                    </button>
                                                                ) : (
                                                                    <span className="text-xs font-semibold text-gray-400">Lunas</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <EmptyState icon="fa-receipt" title="Belum ada data pembelian" description="Order yang berhasil dibuat akan tersimpan sebagai riwayat pembelian." />
                                    )}
                                </div>
                            )}
                        </section>
                    </div>
                </main>

                {isCartOpen && (
                    <div className="fixed inset-0 z-50">
                        <button
                            type="button"
                            aria-label="Tutup keranjang"
                            onClick={() => setIsCartOpen(false)}
                            className="absolute inset-0 bg-black/50"
                        ></button>

                        <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
                            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
                                <div>
                                    <h2 className="text-lg font-black">Keranjang</h2>
                                    <p className="text-sm text-gray-500">{cartCount} item dipilih</p>
                                </div>
                                <button type="button" onClick={() => setIsCartOpen(false)} className="grid h-10 w-10 place-items-center rounded-lg border border-gray-200 hover:bg-gray-100">
                                    <i className="fas fa-xmark"></i>
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto px-4 py-4">
                                {cart.length > 0 ? (
                                    <div className="space-y-4">
                                        {cart.map((item) => (
                                            <div key={item.id} className="flex gap-3 rounded-lg border border-gray-200 p-3">
                                                <img src={item.image} alt={item.nama_produk} className="h-20 w-20 rounded-lg object-cover" />
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="truncate text-sm font-bold">{item.nama_produk}</h3>
                                                    <p className="text-xs text-gray-500">Ukuran {item.ukuran}</p>
                                                    <p className="mt-1 text-sm font-black">{formatRupiah(item.harga * item.qty)}</p>

                                                    <div className="mt-2 flex items-center justify-between gap-2">
                                                        <div className="flex items-center rounded-lg border border-gray-200">
                                                            <button type="button" onClick={() => decreaseQty(item.id)} className="grid h-8 w-8 place-items-center hover:bg-gray-100">
                                                                <i className="fas fa-minus text-xs"></i>
                                                            </button>
                                                            <span className="grid h-8 min-w-8 place-items-center text-sm font-bold">{item.qty}</span>
                                                            <button type="button" onClick={() => increaseQty(item.id)} className="grid h-8 w-8 place-items-center hover:bg-gray-100">
                                                                <i className="fas fa-plus text-xs"></i>
                                                            </button>
                                                        </div>

                                                        <button type="button" onClick={() => removeFromCart(item.id)} className="text-sm font-semibold text-red-600 hover:text-red-700">
                                                            Hapus
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState icon="fa-bag-shopping" title="Keranjang masih kosong" description="Pilih produk favorit kamu dulu." />
                                )}
                            </div>

                            <div className="border-t border-gray-200 p-4">
                                <div className="mb-4 flex items-center justify-between">
                                    <span className="text-sm font-semibold text-gray-600">Total</span>
                                    <span className="text-xl font-black">{formatRupiah(cartTotal)}</span>
                                </div>
                                <button
                                    type="button"
                                    disabled={cart.length === 0}
                                    onClick={() => router.visit('/checkout')}
                                    className="w-full rounded-lg bg-gray-950 px-4 py-3 text-sm font-bold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                                >
                                    Checkout
                                </button>
                            </div>
                        </aside>
                    </div>
                )}
            </div>
        </>
    )
}

function Input({ label, value, onChange, error, type = 'text' }) {
    return (
        <div>
            <label className="text-sm font-bold text-gray-700">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-950"
                required={label !== 'Kode pos'}
            />
            {error && <p className="mt-1 text-xs font-semibold text-red-600">{error}</p>}
        </div>
    )
}

function EmptyState({ icon, title, description }) {
    return (
        <div className="grid min-h-56 place-items-center text-center">
            <div>
                <i className={`fas ${icon} mb-3 text-4xl text-gray-300`}></i>
                <h3 className="font-bold">{title}</h3>
                <p className="mt-1 text-sm text-gray-500">{description}</p>
            </div>
        </div>
    )
}
