import { Head, Link, router, useForm, usePage } from '@inertiajs/react'
import React, { useEffect, useRef, useState } from 'react'
import Swal from 'sweetalert2'

export default function Profil({ profil, alamat, orders = [], profileConfig }) {
    const { auth, flash, cart: initialCart } = usePage().props
    const [activeMenu, setActiveMenu] = useState('profil')
    const [cart, setCart] = useState(initialCart ?? [])
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [payingOrderId, setPayingOrderId] = useState(null)
    const [reviewForms, setReviewForms] = useState({})
    const [destinationSearch, setDestinationSearch] = useState(alamat?.rajaongkir_destination_label || alamat?.kabupaten || '')
    const [destinations, setDestinations] = useState([])
    const [destinationOpen, setDestinationOpen] = useState(false)
    const [destinationError, setDestinationError] = useState('')
    const [loadingDestination, setLoadingDestination] = useState(false)
    const destinationRequestRef = useRef(0)
    const rajaReady = profileConfig?.rajaongkirReady

    const { data, setData, post, processing, errors } = useForm({
        nama: profil?.nama || auth?.user?.name || '',
        whatsapp: profil?.whatsapp || '',
        provinsi: alamat?.provinsi || '',
        kabupaten: alamat?.kabupaten || '',
        kecamatan: alamat?.kecamatan || '',
        kelurahan: alamat?.kelurahan || '',
        alamat: alamat?.alamat || '',
        kode_pos: alamat?.kode_pos || '',
        rajaongkir_destination_id: alamat?.rajaongkir_destination_id || '',
        rajaongkir_destination_label: alamat?.rajaongkir_destination_label || '',
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
        { label: 'Sudah dikemas', icon: 'fa-box' },
        { label: 'Dalam perjalanan', icon: 'fa-truck-fast' },
        { label: 'Sudah sampai', icon: 'fa-circle-check' },
    ]

    const getStatusIndex = (status) => Math.min(Math.max(Number(status || 0), 0), statusList.length - 1)

    const orderStatusText = (order) => {
        if (Number(order?.status_pembayaran || 0) === 0) {
            return 'Menunggu pembayaran'
        }

        const index = getStatusIndex(order?.status_pengiriman)
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

    const requestJson = async (url) => {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
            },
            credentials: 'same-origin',
        })

        const result = await response.json()

        if (!response.ok) {
            throw new Error(result.message || 'Permintaan gagal diproses')
        }

        return result
    }

    const searchDestination = async (keyword = destinationSearch) => {
        if (!rajaReady) {
            setDestinationError('API key RajaOngkir belum diatur.')
            setDestinationOpen(true)
            return
        }

        const searchKeyword = keyword.trim()

        if (searchKeyword.length < 3) {
            setDestinations([])
            setDestinationOpen(false)
            return
        }

        const requestId = destinationRequestRef.current + 1
        destinationRequestRef.current = requestId

        try {
            setLoadingDestination(true)
            setDestinationError('')
            const result = await requestJson(`/checkout/destinations?search=${encodeURIComponent(searchKeyword)}`)

            if (requestId !== destinationRequestRef.current) {
                return
            }

            setDestinations(result.data || [])
            setDestinationOpen(true)
        } catch (error) {
            if (requestId === destinationRequestRef.current) {
                setDestinations([])
                setDestinationOpen(true)
                setDestinationError(error.message)
            }
        } finally {
            if (requestId === destinationRequestRef.current) {
                setLoadingDestination(false)
            }
        }
    }

    useEffect(() => {
        const searchKeyword = destinationSearch.trim()

        if (!rajaReady || searchKeyword.length < 3 || data.rajaongkir_destination_label === searchKeyword) {
            setDestinations([])
            setDestinationError('')
            setDestinationOpen(false)
            setLoadingDestination(false)
            return
        }

        const timer = window.setTimeout(() => {
            searchDestination(searchKeyword)
        }, 450)

        return () => window.clearTimeout(timer)
    }, [destinationSearch, rajaReady, data.rajaongkir_destination_label])

    const chooseDestination = (destination) => {
        const label = destination.label || ''

        setDestinationSearch(label)
        setDestinations([])
        setDestinationOpen(false)
        setDestinationError('')
        setData({
            ...data,
            provinsi: destination.province_name || data.provinsi,
            kabupaten: destination.city_name || data.kabupaten,
            kecamatan: destination.district_name || data.kecamatan,
            kelurahan: destination.subdistrict_name || data.kelurahan,
            kode_pos: destination.zip_code || data.kode_pos,
            rajaongkir_destination_id: String(destination.id || ''),
            rajaongkir_destination_label: label,
        })
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

    const reviewKey = (orderId, produkId) => `${orderId}-${produkId}`

    const getReviewForm = (orderId, produkId) => {
        return reviewForms[reviewKey(orderId, produkId)] || { rating: 5, komentar: '' }
    }

    const setReviewForm = (orderId, produkId, values) => {
        const key = reviewKey(orderId, produkId)
        setReviewForms({
            ...reviewForms,
            [key]: {
                ...getReviewForm(orderId, produkId),
                ...values,
            },
        })
    }

    const hasReview = (order, produkId) => {
        return order.reviews?.some((review) => Number(review.produk_id) === Number(produkId))
    }

    const trackOrder = async (order) => {
        try {
            const response = await fetch(`/orders/${order.id}/track`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                },
                credentials: 'same-origin',
            })
            const result = await response.json()
            if (!response.ok) {
                throw new Error(result.message || 'Gagal melacak')
            }

            const data = result.data
            const history = data?.history || []
            const summary = data?.summary || {}

            const historyHtml = history.length > 0
                ? history.map((h) => `
                    <div class="flex gap-3 text-left text-sm border-b border-gray-100 py-2">
                        <span class="shrink-0 font-semibold text-gray-950">${h.date || ''}</span>
                        <span class="text-gray-600">${h.desc || ''}</span>
                    </div>
                `).join('')
                : '<p class="text-sm text-gray-500">Belum ada riwayat tracking.</p>'

            Swal.fire({
                title: `Tracking ${order.kurir.toUpperCase()} - ${order.no_resi}`,
                html: `<div class="max-h-72 overflow-y-auto">${historyHtml}</div>`,
                icon: 'info',
                confirmButtonText: 'Tutup',
                confirmButtonColor: '#1f2937',
            })
        } catch (error) {
            Swal.fire('Gagal', error.message, 'error')
        }
    }

    const submitReview = (order, item) => {
        const form = getReviewForm(order.id, item.produk_id)

        router.post('/product-reviews', {
            order_id: order.id,
            produk_id: item.produk_id,
            rating: Number(form.rating),
            komentar: form.komentar,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setReviewForm(order.id, item.produk_id, { rating: 5, komentar: '' })
            },
        })
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

            <div className="min-h-screen bg-[#F5F2EB] text-gray-950">
                <header className="sticky top-0 z-40 border-b border-gray-200/60 bg-white/95 shadow-sm backdrop-blur-xl">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
                        <Link href="/" className="flex shrink-0 items-center gap-2.5">
                            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8962E] text-white shadow-lg shadow-[#D4AF37]/20">
                                <i className="fas fa-shirt text-sm"></i>
                            </span>
                            <div className="hidden sm:block">
                                <span className="text-base font-black tracking-tight text-gray-950">FEBRINOX</span>
                                <p className="-mt-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400">Fashion Store</p>
                            </div>
                        </Link>

                        <div className="flex items-center gap-1 sm:gap-1.5">
                            <button
                                type="button"
                                onClick={() => setIsCartOpen(true)}
                                className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#C5A032] text-white shadow-sm shadow-[#D4AF37]/20 transition hover:shadow-md hover:shadow-[#D4AF37]/30"
                            >
                                <i className="fas fa-bag-shopping text-sm"></i>
                                {cartCount > 0 && (
                                    <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                                        {cartCount > 99 ? '99+' : cartCount}
                                    </span>
                                )}
                            </button>

                            <Link href="/profil" className="group flex h-9 items-center gap-2 rounded-xl border border-gray-200 bg-white px-2 transition hover:border-gray-300 hover:shadow-sm sm:px-2.5">
                                {auth.user.avatar ? (
                                    <img src={auth.user.avatar} alt={auth.user.name} className="h-5 w-5 shrink-0 rounded-full object-cover" />
                                ) : (
                                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#D4AF37] text-[10px] font-bold text-white">
                                        {auth.user.name?.charAt(0)?.toUpperCase()}
                                    </span>
                                )}
                                <span className="hidden max-w-20 truncate text-sm font-semibold text-gray-700 sm:inline">{auth.user.name}</span>
                                <i className="fa-solid fa-chevron-down hidden text-[10px] text-gray-400 group-hover:text-gray-600 sm:inline"></i>
                            </Link>

                            <button
                                type="button"
                                onClick={logoutUser}
                                className="hidden h-9 w-9 place-items-center rounded-xl border border-gray-200 text-gray-400 transition hover:border-gray-300 hover:bg-gray-50 hover:text-red-500 sm:grid"
                            >
                                <i className="fas fa-right-from-bracket text-sm"></i>
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

                    <section className="mb-6 rounded-3xl bg-[#D4AF37] p-5 text-white shadow-xl shadow-gray-950/10 sm:p-7">
                        <p className="text-sm font-semibold text-white/60">Akun Customer</p>
                        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <h1 className="text-3xl font-black">Profil dan pesanan kamu</h1>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
                                    Lengkapi data diri dan alamat supaya checkout serta pengiriman pesanan lebih cepat diproses.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-white/15 bg-white/10 text-center text-sm backdrop-blur">
                                <div className="px-4 py-3">
                                    <p className="font-black">{orders.length}</p>
                                    <p className="text-xs text-white/60">Order</p>
                                </div>
                                {/* <div className="border-x border-white/15 px-4 py-3">
                                    <p className="font-black">{Number(profil?.point || 0)}</p>
                                    <p className="text-xs text-white/60">Point</p>
                                </div> */}
                                <div className="px-4 py-3">
                                    <p className="font-black">{cartCount}</p>
                                    <p className="text-xs text-white/60">Keranjang</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
                        <aside className="lg:sticky lg:top-24 lg:self-start">
                            <div className="grid gap-2 rounded-3xl border border-gray-200 bg-white p-2 shadow-sm">
                                {menuItems.map((item) => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        onClick={() => setActiveMenu(item.key)}
                                        className={`flex h-11 items-center gap-3 rounded-2xl px-3 text-left text-sm font-bold transition ${activeMenu === item.key ? 'bg-[#D4AF37] text-white shadow-lg shadow-gray-950/15' : 'text-gray-700 hover:bg-gray-100'}`}
                                    >
                                        <i className={`fas ${item.icon} w-5 text-center`}></i>
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </aside>

                        <section>
                            {activeMenu === 'profil' && (
                                <form onSubmit={submitProfil} className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                                    <div className="mb-5 flex items-center justify-between gap-4">
                                        <div>
                                            <h2 className="text-xl font-black">Data diri customer</h2>
                                            <p className="mt-1 text-sm text-gray-500">Nama, WhatsApp, dan alamat utama untuk pengiriman.</p>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="rounded-full bg-[#D4AF37] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-gray-950/20 hover:bg-[#C5A032] disabled:cursor-not-allowed disabled:bg-gray-300"
                                        >
                                            {processing ? 'Menyimpan...' : 'Simpan'}
                                        </button>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="relative md:col-span-2">
                                            <label className="text-sm font-bold text-gray-700">Cari Alamat Anda</label>
                                            <div className="relative mt-2">
                                                <input
                                                    type="text"
                                                    value={destinationSearch}
                                                    onChange={(e) => {
                                                        setDestinationSearch(e.target.value)
                                                        setData({
                                                            ...data,
                                                            rajaongkir_destination_id: '',
                                                            rajaongkir_destination_label: '',
                                                        })
                                                        setDestinationOpen(e.target.value.trim().length >= 3)
                                                    }}
                                                    onFocus={() => {
                                                        if (destinations.length > 0 || destinationError) {
                                                            setDestinationOpen(true)
                                                        }
                                                    }}
                                                    onBlur={() => window.setTimeout(() => setDestinationOpen(false), 150)}
                                                    className="h-12 w-full rounded-2xl border border-gray-300 pl-11 pr-11 text-sm outline-none transition focus:border-gray-950 focus:ring-2 focus:ring-gray-950/10"
                                                    placeholder="Ketik kecamatan, kota, kelurahan, atau kode pos"
                                                    autoComplete="off"
                                                />
                                                <i className="fas fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400"></i>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                                    {loadingDestination ? (
                                                        <i className="fas fa-circle-notch fa-spin text-sm"></i>
                                                    ) : (
                                                        <i className="fas fa-chevron-down text-xs"></i>
                                                    )}
                                                </div>
                                            </div>

                                            {destinationOpen && (
                                                <div className="absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-gray-200 bg-white py-2 shadow-xl shadow-gray-950/10">
                                                    {destinations.length > 0 ? (
                                                        destinations.map((destination) => (
                                                            <button
                                                                key={destination.id}
                                                                type="button"
                                                                onMouseDown={(e) => e.preventDefault()}
                                                                onClick={() => chooseDestination(destination)}
                                                                className="flex w-full items-start gap-3 px-4 py-3 text-left text-sm text-gray-800 transition hover:bg-gray-50"
                                                            >
                                                                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gray-100 text-gray-600">
                                                                    <i className="fas fa-location-dot text-xs"></i>
                                                                </span>
                                                                <span className="min-w-0 flex-1">
                                                                    <span className="block font-black leading-5">{destination.label}</span>
                                                                    <span className="mt-1 block text-xs text-gray-500">{destination.zip_code || 'Kode pos belum tersedia'}</span>
                                                                </span>
                                                            </button>
                                                        ))
                                                    ) : (
                                                        <div className="px-4 py-4 text-sm text-gray-500">
                                                            {destinationError || (loadingDestination ? 'Mencari alamat...' : 'Ketik minimal 3 karakter untuk mencari alamat.')}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* {data.rajaongkir_destination_id ? (
                                                <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                                                    <p className="font-black">ID RajaOngkir: {data.rajaongkir_destination_id}</p>
                                                    <p className="mt-1 leading-5">{data.rajaongkir_destination_label}</p>
                                                </div>
                                            ) : (
                                                <p className="mt-2 text-xs font-semibold text-amber-700">Pilih alamat dari RajaOngkir agar ongkir di checkout bisa otomatis.</p>
                                            )} */}
                                            {errors.rajaongkir_destination_id && <p className="mt-1 text-xs font-semibold text-red-600">{errors.rajaongkir_destination_id}</p>}
                                        </div>
                                        <Input label="Nama lengkap" value={data.nama} error={errors.nama} onChange={(value) => setData('nama', value)} />
                                        <Input label="Nomor WhatsApp" type="tel" value={data.whatsapp} error={errors.whatsapp} onChange={(value) => setData('whatsapp', value)} />
                                        <Input label="Provinsi" value={data.provinsi} error={errors.provinsi} onChange={(value) => setData('provinsi', value)} />
                                        <Input label="Kabupaten / Kota" value={data.kabupaten} error={errors.kabupaten} onChange={(value) => setData('kabupaten', value)} />
                                        <Input label="Kecamatan" value={data.kecamatan} error={errors.kecamatan} onChange={(value) => setData('kecamatan', value)} />
                                        <Input label="Kelurahan / Desa" value={data.kelurahan} error={errors.kelurahan} onChange={(value) => setData('kelurahan', value)} />
                                        <Input label="Kode pos" value={data.kode_pos} error={errors.kode_pos} onChange={(value) => setData('kode_pos', value)} />
                                        <div className="md:col-span-2">
                                            <label className="text-sm font-bold text-gray-700">Alamat lengkap</label>
                                            <textarea
                                                value={data.alamat}
                                                onChange={(e) => setData('alamat', e.target.value)}
                                                className="mt-2 min-h-28 w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-950"
                                                placeholder="Nama jalan, nomor rumah, RT/RW, patokan"
                                                required
                                            ></textarea>
                                            {errors.alamat && <p className="mt-1 text-xs font-semibold text-red-600">{errors.alamat}</p>}
                                        </div>
                                    </div>
                                </form>
                            )}

                            {activeMenu === 'pengiriman' && (
                                <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                                    <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                        <div>
                                            <h2 className="text-xl font-black">Proses pengiriman</h2>
                                            <p className="mt-1 text-sm text-gray-500">Pantau posisi pesanan terakhir dari status order.</p>
                                        </div>
                                        {latestOrder && (
                                            <span className="rounded-full bg-[#D4AF37] px-3 py-2 text-sm font-bold text-white">
                                                {latestOrder.kode_order}
                                            </span>
                                        )}
                                    </div>

                                    {latestOrder ? (
                                        <div>
                                            <div className="mb-6 rounded-2xl bg-gray-50 p-4">
                                                <p className="text-sm text-gray-500">Status saat ini</p>
                                                <p className="mt-1 text-2xl font-black">{orderStatusText(latestOrder)}</p>
                                                <p className="mt-1 text-sm text-gray-600">Tanggal order: {latestOrder.tanggal || '-'}</p>
                                            </div>

                                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                                {statusList.map((status, index) => {
                                                    const isDone = index <= getStatusIndex(latestOrder.status_pengiriman)

                                                    return (
                                                        <div key={status.label} className={`rounded-2xl border p-4 ${isDone ? 'border-gray-950 bg-gray-950 text-white shadow-lg shadow-gray-950/15' : 'border-gray-200 bg-white text-gray-500'}`}>
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
                                <div className="space-y-4">
                                    <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                                        <h2 className="text-xl font-black">Data Pembelian</h2>
                                        <p className="mt-1 text-sm text-gray-500">Riwayat belanja kamu.</p>
                                    </div>

                                    {orders.length > 0 ? (
                                        orders.map((order) => (
                                            <div key={order.id} className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
                                                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                                                    <div>
                                                        <p className="text-xs text-gray-400">Kode Order</p>
                                                        <p className="font-black tracking-wide">{order.kode_order}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-gray-400">{order.tanggal || '-'}</p>
                                                        <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${paymentBadgeClass(order)}`}>
                                                            <i className={`fas ${Number(order.status_pembayaran || 0) === 0 ? 'fa-clock' : 'fa-circle-check'}`}></i>
                                                            {orderStatusText(order)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="divide-y divide-gray-100 px-5">
                                                    {order.items?.map((item) => (
                                                        <div key={item.id} className="flex items-start gap-4 py-4">
                                                            <img
                                                                src={item.image || 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=800&q=80'}
                                                                alt={item.nama_produk}
                                                                className="h-20 w-20 flex-shrink-0 rounded-2xl border border-gray-200 object-cover"
                                                            />
                                                            <div className="min-w-0 flex-1">
                                                                <p className="font-black leading-tight">{item.nama_produk}</p>
                                                                <p className="mt-1 text-xs text-gray-500">
                                                                    Ukuran: <span className="font-semibold">{item.ukuran || '-'}</span>
                                                                    {item.qty > 1 && <> &middot; {item.qty} barang</>}
                                                                </p>
                                                                <p className="mt-2 text-sm font-black">{formatRupiah(item.harga)}</p>
                                                            </div>
                                                            <div className="flex-shrink-0 text-right">
                                                                <p className="text-xs text-gray-400">Subtotal</p>
                                                                <p className="font-black">{formatRupiah(item.total_harga)}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-4">
                                                    <div className="flex items-start justify-between">
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <span className="text-gray-400">Subtotal</span>
                                                                <span className="font-semibold">{formatRupiah(order.subtotal || order.total_harga - (order.ongkir || 0))}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <span className="text-gray-400">Ongkos Kirim</span>
                                                                {order.ongkir ? (
                                                                    <span className="font-semibold">{formatRupiah(order.ongkir)}</span>
                                                                ) : (
                                                                    <span className="text-gray-300">-</span>
                                                                )}
                                                            </div>
                                                            {order.kurir && (
                                                                <p className="text-xs text-gray-400">
                                                                    <i className="fas fa-truck mr-1"></i>
                                                                    {order.kurir.toUpperCase()} {order.layanan_kurir || ''}
                                                                    {order.estimasi && <> &middot; {order.estimasi}</>}
                                                                </p>
                                                            )}
                                                            {order.no_resi && (
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    <span className="text-xs font-semibold text-gray-950 bg-gray-100 rounded-lg px-2.5 py-1">
                                                                        Resi: {order.no_resi}
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => trackOrder(order)}
                                                                        className="text-xs font-bold text-gray-950 underline hover:no-underline"
                                                                    >
                                                                        <i className="fas fa-search mr-0.5"></i>
                                                                        Lacak
                                                                    </button>
                                                                </div>
                                                            )}
                                                            <div className="pt-1.5">
                                                                <span className="text-xs text-gray-400">Total Belanja</span>
                                                                <p className="text-xl font-black">{formatRupiah(order.total_harga)}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            {Number(order.status_pembayaran || 0) === 0 ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => payOrder(order.id)}
                                                                    disabled={payingOrderId === order.id}
                                                                    className="flex items-center gap-2 rounded-full bg-[#D4AF37] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#C5A032] disabled:cursor-not-allowed disabled:bg-gray-300"
                                                                >
                                                                    {payingOrderId === order.id ? (
                                                                        'Membuka...'
                                                                    ) : (
                                                                        <>
                                                                            <i className="fas fa-credit-card"></i>
                                                                            Bayar Sekarang
                                                                        </>
                                                                    )}
                                                                </button>
                                                            ) : (
                                                                <span className="flex items-center gap-2 rounded-full bg-emerald-50 px-5 py-2.5 text-sm font-bold text-emerald-700">
                                                                    <i className="fas fa-check-circle"></i>
                                                                    Lunas
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {Number(order.status_pengiriman || 0) === 3 && order.items?.length > 0 && (
                                                    <div className="border-t border-dashed border-gray-200 bg-gray-50/70 px-5 py-4">
                                                        <p className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-700">
                                                            <i className="fas fa-star"></i>
                                                            Beri Review
                                                        </p>
                                                        <div className="grid gap-4">
                                                            {order.items.map((item) => {
                                                                const reviewed = hasReview(order, item.produk_id)
                                                                const form = getReviewForm(order.id, item.produk_id)

                                                                return (
                                                                    <div key={item.id} className="rounded-2xl border border-gray-200 bg-white p-4">
                                                                        {reviewed ? (
                                                                            <div className="flex items-center gap-3">
                                                                                <img src={item.image || ''} alt="" className="h-12 w-12 flex-shrink-0 rounded-xl object-cover" />
                                                                                <div>
                                                                                    <p className="text-sm font-bold">{item.nama_produk}</p>
                                                                                    <p className="mt-1 text-xs font-semibold text-emerald-600">
                                                                                        <i className="fas fa-check-circle mr-1"></i>
                                                                                        Review sudah dikirim
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
                                                                                <div className="flex items-start gap-3">
                                                                                    <img src={item.image || ''} alt="" className="h-12 w-12 flex-shrink-0 rounded-xl object-cover" />
                                                                                    <div className="min-w-0">
                                                                                        <p className="text-sm font-bold">{item.nama_produk}</p>
                                                                                        <div className="mt-2 flex gap-1">
                                                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                                                <button
                                                                                                    key={star}
                                                                                                    type="button"
                                                                                                    onClick={() => setReviewForm(order.id, item.produk_id, { rating: star })}
                                                                                                    className={`text-lg ${Number(form.rating) >= star ? 'text-amber-400' : 'text-gray-200'}`}
                                                                                                >
                                                                                                    <i className="fas fa-star"></i>
                                                                                                </button>
                                                                                            ))}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div>
                                                                                    <textarea
                                                                                        value={form.komentar}
                                                                                        onChange={(e) => setReviewForm(order.id, item.produk_id, { komentar: e.target.value })}
                                                                                        className="min-h-20 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-950"
                                                                                        placeholder="Tulis pengalaman kamu..."
                                                                                    ></textarea>
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => submitReview(order, item)}
                                                                                        className="mt-2 w-full rounded-full bg-[#D4AF37] px-4 py-2 text-xs font-bold text-white hover:bg-[#C5A032]"
                                                                                    >
                                                                                        Kirim Review
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                                            <EmptyState icon="fa-receipt" title="Belum ada data pembelian" description="Order yang berhasil dibuat akan tersimpan sebagai riwayat pembelian." />
                                        </div>
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
                                    className="w-full rounded-lg bg-[#D4AF37] px-4 py-3 text-sm font-bold text-white hover:bg-[#C5A032] disabled:cursor-not-allowed disabled:bg-gray-300"
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
                className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-950"
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
