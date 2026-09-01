import { Head, Link, router } from '@inertiajs/react'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import Swal from 'sweetalert2'

export default function Checkout({ cartItems = [], profil, alamat, checkoutConfig, sablonPrices = [] }) {
    const savedDestination = alamat?.rajaongkir_destination_id
        ? {
            id: Number(alamat.rajaongkir_destination_id),
            label: alamat.rajaongkir_destination_label || [alamat.kelurahan, alamat.kecamatan, alamat.kabupaten, alamat.provinsi].filter(Boolean).join(', '),
            zip_code: alamat.kode_pos || '',
        }
        : null
    const [form, setForm] = useState({
        nama_penerima: profil?.nama || '',
        whatsapp: profil?.whatsapp || '',
        alamat_pengiriman: alamat?.alamat || '',
    })
    const [destinationSearch, setDestinationSearch] = useState(savedDestination?.label || alamat?.kabupaten || '')
    const [destinations, setDestinations] = useState([])
    const [destinationOpen, setDestinationOpen] = useState(false)
    const [destinationError, setDestinationError] = useState('')
    const [selectedDestination, setSelectedDestination] = useState(savedDestination)
    const [shippingOptions, setShippingOptions] = useState([])
    const [selectedShipping, setSelectedShipping] = useState(null)
    const [loadingDestination, setLoadingDestination] = useState(false)
    const [loadingCost, setLoadingCost] = useState(false)
    const [processing, setProcessing] = useState(false)
    const [sablonData, setSablonData] = useState({})
    const [sablonUploading, setSablonUploading] = useState({})
    const [expandedSablon, setExpandedSablon] = useState({})
    const [sablonOffsets, setSablonOffsets] = useState({})
    const [dragging, setDragging] = useState(null)

    const subtotal = useMemo(() => {
        const productTotal = cartItems.reduce((total, item) => total + item.harga * item.qty, 0)
        const sablonTotal = Object.values(sablonData).reduce((total, s) => total + (s.price || 0), 0)
        return productTotal + sablonTotal
    }, [cartItems, sablonData])
    const totalQty = useMemo(() => cartItems.reduce((total, item) => total + item.qty, 0), [cartItems])
    const totalWeight = Math.max(totalQty * Number(checkoutConfig?.defaultWeight || 500), 1)
    const shippingCost = selectedShipping ? Number(selectedShipping.cost || 0) : 0
    const grandTotal = subtotal + shippingCost
    const rajaReady = checkoutConfig?.rajaongkirReady
    const destinationRequestRef = useRef(0)

    const formatRupiah = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(Number(value || 0))
    }

    const requestJson = async (url, options = {}) => {
        const isFormData = options.body instanceof FormData

        const response = await fetch(url, {
            ...options,
            headers: {
                ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                ...(options.headers || {}),
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
            Swal.fire('RajaOngkir belum aktif', 'Isi RAJAONGKIR_API_KEY dan RAJAONGKIR_ORIGIN_ID di .env terlebih dahulu.', 'info')
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

        if (!rajaReady || searchKeyword.length < 3 || selectedDestination?.label === searchKeyword) {
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
    }, [destinationSearch, rajaReady, selectedDestination])

    const chooseDestination = async (destination) => {
        setSelectedDestination(destination)
        setDestinationSearch(destination.label)
        setDestinations([])
        setDestinationOpen(false)
        setDestinationError('')
        setSelectedShipping(null)

        try {
            setLoadingCost(true)
            const result = await requestJson('/checkout/shipping-cost', {
                method: 'POST',
                body: JSON.stringify({
                    destination_id: destination.id,
                    weight: totalWeight,
                    courier: checkoutConfig?.rajaongkirCouriers,
                }),
            })
            setShippingOptions(result.data || [])
        } catch (error) {
            Swal.fire('Gagal', error.message, 'error')
        } finally {
            setLoadingCost(false)
        }
    }

    const toggleSablon = (cartId) => {
        setExpandedSablon((prev) => ({ ...prev, [cartId]: !prev[cartId] }))
    }

    const selectSablonPosition = (cartId, position) => {
        const price = sablonPrices.find((s) => s.position === position)?.price || 0
        setSablonData((prev) => ({
            ...prev,
            [cartId]: { ...prev[cartId], position, price },
        }))
    }

    const handleFileSelect = (cartId, file) => {
        if (!file) return

        const previewUrl = URL.createObjectURL(file)
        setSablonData((prev) => ({
            ...prev,
            [cartId]: { ...prev[cartId], preview: previewUrl },
        }))

        const formData = new FormData()
        formData.append('image', file)
        formData.append('cart_id', cartId)

        setSablonUploading((prev) => ({ ...prev, [cartId]: true }))
        requestJson('/checkout/upload-sablon', {
            method: 'POST',
            body: formData,
            headers: {},
        })
            .then((result) => {
                setSablonData((prev) => ({
                    ...prev,
                    [cartId]: { ...prev[cartId], image: result.path },
                }))
            })
            .catch((error) => {
                Swal.fire('Gagal upload', error.message, 'error')
            })
            .finally(() => {
                setSablonUploading((prev) => ({ ...prev, [cartId]: false }))
            })
    }

    const removeSablon = (cartId) => {
        setSablonData((prev) => {
            const next = { ...prev }
            delete next[cartId]
            return next
        })
        setExpandedSablon((prev) => ({ ...prev, [cartId]: false }))
    }

    const sablonPositionStyles = {
        sleeve: { top: '20%', left: '2%', width: '32%', height: '22%', objectFit: 'cover', opacity: '0.85' },
        left_chest: { top: '26%', left: '6%', width: '22%', height: '18%', objectFit: 'cover', opacity: '0.85' },
        center_chest: { top: '26%', left: '40%', width: '22%', height: '18%', objectFit: 'cover', opacity: '0.85' },
        full_front: { top: '15%', left: '20%', width: '60%', height: '55%', objectFit: 'cover', opacity: '0.85' },
        oversize_front: { top: '8%', left: '10%', width: '80%', height: '75%', objectFit: 'cover', opacity: '0.85' },
    }

    const getPreviewImage = (item, position) => {
        if (position === 'sleeve') {
            return item.images?.samping || item.image
        }
        return item.images?.depan || item.image
    }

    const getPositionName = (pos) => {
        const found = sablonPrices.find((s) => s.position === pos)
        return found?.label || pos
    }

    useEffect(() => {
        if (savedDestination && rajaReady && shippingOptions.length === 0 && !loadingCost) {
            chooseDestination(savedDestination)
        }
    }, [])

    const useTemporaryShipping = () => {
        setSelectedDestination({
            id: 'manual',
            label: alamat
                ? `${alamat.kecamatan}, ${alamat.kabupaten}, ${alamat.provinsi}`
                : 'Tujuan pengiriman sementara',
        })
        setSelectedShipping({
            name: 'Manual',
            code: 'manual',
            service: 'Menunggu API',
            description: 'Ongkir sementara sampai RajaOngkir aktif',
            cost: 0,
            etd: '-',
        })
    }

    const submitCheckout = async (e) => {
        e.preventDefault()

        if (!selectedDestination || !selectedShipping) {
            Swal.fire('Pilih pengiriman', 'Pilih tujuan dan layanan ongkir sebelum membuat pembayaran.', 'info')
            return
        }

        try {
            setProcessing(true)
            const sablonItems = Object.entries(sablonData).map(([cartId, data]) => ({
                cart_id: Number(cartId),
                position: data.position || null,
                price: data.price || 0,
                image: data.image || null,
            }))

            const result = await requestJson('/checkout', {
                method: 'POST',
                body: JSON.stringify({
                    ...form,
                    destination_id: String(selectedDestination.id),
                    destination_label: selectedDestination.label,
                    kurir: selectedShipping.code || selectedShipping.name,
                    layanan_kurir: selectedShipping.service,
                    estimasi: selectedShipping.etd || '',
                    ongkir: Number(selectedShipping.cost || 0),
                    sablon_items: sablonItems.length > 0 ? sablonItems : undefined,
                }),
            })

            if (result.payment?.redirect_url) {
                window.location.href = result.payment.redirect_url
                return
            }

            Swal.fire('Order dibuat', result.message, 'success').then(() => {
                router.visit('/profil')
            })
        } catch (error) {
            Swal.fire('Gagal', error.message, 'error')
        } finally {
            setProcessing(false)
        }
    }

    return (
        <>
            <Head title="Checkout" />

            <div className="min-h-screen bg-[#F5F2EB] text-gray-950">
                <header className="sticky top-0 z-40 border-b border-gray-200/60 bg-white/95 shadow-sm backdrop-blur-xl">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
                        <Link href="/" className="flex shrink-0 items-center gap-2.5">
                            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8962E] text-white shadow-lg shadow-[#D4AF37]/20">
                                <i className="fas fa-shirt text-sm"></i>
                            </span>
                            <div className="hidden sm:block">
                                <span className="text-base font-black tracking-tight text-gray-950">FABRICO</span>
                                <p className="-mt-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400">Fashion Store</p>
                            </div>
                        </Link>
                        <Link href="/" className="flex h-9 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50">
                            <i className="fas fa-arrow-left text-xs"></i>
                            Lanjut Belanja
                        </Link>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mb-5 text-sm text-gray-500">
                        <Link href="/" className="font-semibold text-gray-950 hover:underline">Toko</Link>
                        <span className="mx-2">/</span>
                        <span>Checkout</span>
                    </div>

                    <section className="mb-6 rounded-3xl bg-[#D4AF37] p-5 text-white shadow-xl shadow-gray-950/10 sm:p-7">
                        <p className="text-sm font-semibold text-white/60">Pembayaran dan pengiriman</p>
                        <h1 className="mt-2 text-3xl font-black">Checkout pesanan</h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
                            Pilih tujuan pengiriman, cek ongkir, lalu lanjutkan pembayaran.
                        </p>
                    </section>

                    <form onSubmit={submitCheckout} className="grid gap-6 lg:grid-cols-[1fr_390px]">
                        <div className="space-y-6">
                            <section className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                                <h2 className="text-xl font-black">Data penerima</h2>
                                <div className="mt-4 grid gap-4 md:grid-cols-2">
                                    <Input label="Nama penerima" value={form.nama_penerima} onChange={(value) => setForm({ ...form, nama_penerima: value })} />
                                    <Input label="WhatsApp" type="tel" value={form.whatsapp} onChange={(value) => setForm({ ...form, whatsapp: value })} />
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-bold text-gray-700">Alamat lengkap</label>
                                        <textarea
                                            value={form.alamat_pengiriman}
                                            onChange={(e) => setForm({ ...form, alamat_pengiriman: e.target.value })}
                                            className="mt-2 min-h-28 w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-950"
                                            placeholder="Nama jalan, nomor rumah, RT/RW, dan patokan"
                                            required
                                        ></textarea>
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                    <div>
                                        <h2 className="text-xl font-black">Pengiriman RajaOngkir</h2>
                                        <p className="mt-1 text-sm text-gray-500">Berat estimasi: {totalWeight} gram dari {totalQty} item.</p>
                                    </div>
                                    {!rajaReady && (
                                        <button type="button" onClick={useTemporaryShipping} className="rounded-full border border-gray-200 px-4 py-2 text-sm font-bold hover:bg-gray-100">
                                            Pakai sementara
                                        </button>
                                    )}
                                </div>

                                {!rajaReady && (
                                    <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
                                        RajaOngkir belum aktif. Isi `RAJAONGKIR_API_KEY` dan `RAJAONGKIR_ORIGIN_ID` di `.env` untuk mengaktifkan pencarian tujuan dan ongkir otomatis.
                                    </div>
                                )}

                                <div className="relative mt-4">
                                    <label className="text-sm font-bold text-gray-700">Cari alamat tujuan</label>
                                    <div className="relative mt-2">
                                        <input
                                            type="text"
                                            value={destinationSearch}
                                            onChange={(e) => {
                                                setDestinationSearch(e.target.value)
                                                setSelectedDestination(null)
                                                setSelectedShipping(null)
                                                setShippingOptions([])
                                                setDestinationOpen(e.target.value.trim().length >= 3)
                                            }}
                                            onFocus={() => {
                                                if (destinations.length > 0 || destinationError) {
                                                    setDestinationOpen(true)
                                                }
                                            }}
                                            onBlur={() => window.setTimeout(() => setDestinationOpen(false), 150)}
                                            className="h-12 w-full rounded-2xl border border-gray-300 pl-11 pr-11 text-sm outline-none transition focus:border-gray-950 focus:ring-2 focus:ring-gray-950/10"
                                            placeholder="Ketik kota, kecamatan, kelurahan, atau kode pos"
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
                                                        className={`flex w-full items-start gap-3 px-4 py-3 text-left text-sm transition hover:bg-gray-50 ${selectedDestination?.id === destination.id ? 'bg-[#D4AF37] text-white hover:bg-[#D4AF37]' : 'text-gray-800'}`}
                                                    >
                                                        <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${selectedDestination?.id === destination.id ? 'bg-white/15 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                                            <i className="fas fa-location-dot text-xs"></i>
                                                        </span>
                                                        <span className="min-w-0 flex-1">
                                                            <span className="block font-black leading-5">{destination.label}</span>
                                                            <span className="mt-1 block text-xs opacity-70">{destination.zip_code || 'Kode pos belum tersedia'}</span>
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

                                    {selectedDestination && (
                                        <div className="mt-3 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                                            <i className="fas fa-circle-check mt-0.5"></i>
                                            <div>
                                                <p className="font-black">Tujuan dipilih</p>
                                                <p className="mt-1 leading-5">{selectedDestination.label}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {loadingCost && <p className="mt-4 text-sm font-semibold text-gray-500">Mengambil ongkir...</p>}

                                {shippingOptions.length > 0 && (
                                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                                        {shippingOptions.map((option) => {
                                            const active = selectedShipping?.code === option.code && selectedShipping?.service === option.service
                                            const courier = courierMeta(option.code || option.name)

                                            return (
                                                <button
                                                    key={`${option.code}-${option.service}`}
                                                    type="button"
                                                    onClick={() => setSelectedShipping(option)}
                                                    className={`group rounded-2xl border p-4 text-left transition ${active ? 'border-gray-950 bg-[#D4AF37] text-white shadow-lg shadow-gray-950/20' : 'border-gray-200 bg-white hover:-translate-y-0.5 hover:border-gray-950 hover:shadow-lg hover:shadow-gray-950/10'}`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-lg border text-xs font-black uppercase ${active ? 'border-white/20 bg-white text-gray-950' : courier.className}`}>
                                                            {courier.logo}
                                                        </span>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div className="min-w-0">
                                                                    <p className="truncate font-black uppercase">{courier.name}</p>
                                                                    <p className="mt-1 text-sm font-bold">{option.service}</p>
                                                                </div>
                                                                <p className="shrink-0 text-right font-black">{formatRupiah(option.cost)}</p>
                                                            </div>
                                                            <p className="mt-2 line-clamp-2 text-sm opacity-75">{option.description || option.name}</p>
                                                            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold">
                                                                <span className={`rounded-full px-2.5 py-1 ${active ? 'bg-white/15 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                                                    Estimasi {option.etd || '-'}
                                                                </span>
                                                                <span className={`rounded-full px-2.5 py-1 uppercase ${active ? 'bg-white/15 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                                                    {option.code}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            </section>
                        </div>

                        <aside className="lg:sticky lg:top-24 lg:self-start">
                            <section className="rounded-3xl border border-gray-200 bg-white p-4 shadow-xl shadow-gray-950/5 sm:p-5">
                                <h2 className="text-xl font-black">Ringkasan</h2>
                                <div className="mt-4 max-h-[500px] space-y-3 overflow-y-auto pr-1">
                                    {cartItems.map((item) => {
                                        const sablon = sablonData[item.id]
                                        const hasImage = sablon?.image || sablon?.preview
                                        const isOpen = expandedSablon[item.id]
                                        const isLukisan = item.kategori?.toLowerCase() === 'lukisan'
                                        return (
                                            <div key={item.id} className="rounded-2xl border border-gray-100 p-3">
                                                <div className="flex gap-3">
                                                    <img src={item.image} alt={item.nama_produk} className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-black">{item.nama_produk}</p>
                                                        <p className="text-xs text-gray-500">Ukuran {item.ukuran} x {item.qty}</p>
                                                        {Number(item.diskon) > 0 ? (
                                                            <div className="mt-0.5 flex items-center gap-2">
                                                                <p className="text-xs text-gray-400 line-through">{formatRupiah(item.harga_asli * item.qty)}</p>
                                                                <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">-{item.diskon}%</span>
                                                                <p className="text-sm font-bold text-red-600">{formatRupiah(item.harga * item.qty)}</p>
                                                            </div>
                                                        ) : (
                                                            <p className="mt-0.5 text-sm font-bold">{formatRupiah(item.harga * item.qty)}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {!isLukisan && (sablon?.position ? (
                                                    <div className="mt-2 flex items-center justify-between rounded-xl bg-[#D4AF37]/5 px-3 py-2">
                                                        <div className="flex items-center gap-2 text-xs font-semibold">
                                                            <i className="fas fa-palette text-gray-950"></i>
                                                            <span>Sablon {getPositionName(sablon.position)}</span>
                                                            <span className="text-gray-950">+{formatRupiah(sablon.price)}</span>
                                                            {hasImage && <i className="fas fa-check-circle text-green-600 text-xs"></i>}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <button type="button" onClick={() => toggleSablon(item.id)} className="text-xs text-gray-600 hover:text-gray-950">
                                                                <i className="fas fa-pen"></i>
                                                            </button>
                                                            <button type="button" onClick={() => removeSablon(item.id)} className="text-xs text-red-600 hover:text-red-800">
                                                                <i className="fas fa-xmark"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button type="button" onClick={() => toggleSablon(item.id)} className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-300 py-2 text-xs font-semibold text-gray-600 hover:border-gray-950 hover:text-gray-950">
                                                        <i className="fas fa-plus"></i>
                                                        Tambah Sablon
                                                    </button>
                                                ))}

                                                {!isLukisan && isOpen && (
                                                    <div className="mt-3 space-y-3">
                                                        <div>
                                                            <p className="mb-1.5 text-xs font-bold text-gray-700">Pilih posisi</p>
                                                            <div className="grid grid-cols-2 gap-1.5">
                                                                {sablonPrices.map((sp) => (
                                                                    <button
                                                                        key={sp.position}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            selectSablonPosition(item.id, sp.position)
                                                                            if (!sablon?.position) setExpandedSablon((prev) => ({ ...prev, [item.id]: true }))
                                                                        }}
                                                                        className="rounded-lg border px-2 py-1.5 text-left text-xs transition hover:border-gray-950 data-[active=true]:border-gray-950 data-[active=true]:bg-[#D4AF37] data-[active=true]:text-white"
                                                                        data-active={sablon?.position === sp.position}
                                                                    >
                                                                        <p className="font-semibold">{sp.label}</p>
                                                                        <p className="mt-0.5 opacity-70">+{formatRupiah(sp.price)}</p>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {sablon?.position && (
                                                            <>
                                                                <div>
                                                                    <p className="mb-1.5 text-xs font-bold text-gray-700">Upload desain</p>
                                                                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 px-3 py-3 text-xs text-gray-600 hover:border-gray-950 hover:text-gray-950">
                                                                        {hasImage ? (
                                                                            <span className="flex items-center gap-2">
                                                                                <i className="fas fa-check-circle text-green-600"></i>
                                                                                Ganti gambar
                                                                            </span>
                                                                        ) : (
                                                                            <>
                                                                                <i className="fas fa-cloud-arrow-up"></i>
                                                                                {sablonUploading[item.id] ? 'Mengupload...' : 'Pilih gambar'}
                                                                            </>
                                                                        )}
                                                                        <input
                                                                            type="file"
                                                                            accept="image/png,image/jpeg"
                                                                            className="hidden"
                                                                            disabled={sablonUploading[item.id]}
                                                                            onChange={(e) => {
                                                                                const file = e.target.files?.[0]
                                                                                if (file) handleFileSelect(item.id, file)
                                                                                e.target.value = ''
                                                                            }}
                                                                        />
                                                                    </label>
                                                                </div>

                                                                {sablon?.preview && (
                                                                    <div>
                                                                        <p className="mb-1.5 text-xs font-bold text-gray-700">Preview di produk</p>
                                                                        <p className="mb-1.5 text-xs text-gray-500">Seret gambar sablon untuk atur posisi</p>
                                                                        <div
                                                                            className="relative mx-auto max-w-[200px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm select-none"
                                                                            onMouseMove={(e) => {
                                                                                if (dragging?.cartId === item.id) {
                                                                                    const dx = e.clientX - dragging.startX
                                                                                    const dy = e.clientY - dragging.startY
                                                                                    setSablonOffsets((prev) => ({
                                                                                        ...prev,
                                                                                        [item.id]: { x: dragging.origX + dx, y: dragging.origY + dy },
                                                                                    }))
                                                                                }
                                                                            }}
                                                                            onMouseUp={() => setDragging(null)}
                                                                            onMouseLeave={() => setDragging(null)}
                                                                            onTouchMove={(e) => {
                                                                                if (dragging?.cartId === item.id) {
                                                                                    const touch = e.touches[0]
                                                                                    const dx = touch.clientX - dragging.startX
                                                                                    const dy = touch.clientY - dragging.startY
                                                                                    setSablonOffsets((prev) => ({
                                                                                        ...prev,
                                                                                        [item.id]: { x: dragging.origX + dx, y: dragging.origY + dy },
                                                                                    }))
                                                                                }
                                                                            }}
                                                                            onTouchEnd={() => setDragging(null)}
                                                                        >
                                                                            <img
                                                                                src={getPreviewImage(item, sablon.position)}
                                                                                alt={item.nama_produk}
                                                                                className="w-full pointer-events-none"
                                                                            />
                                                                            <img
                                                                                src={sablon.preview}
                                                                                alt="Desain sablon"
                                                                                draggable={false}
                                                                                onMouseDown={(e) => {
                                                                                    e.preventDefault()
                                                                                    setDragging({
                                                                                        cartId: item.id,
                                                                                        startX: e.clientX,
                                                                                        startY: e.clientY,
                                                                                        origX: sablonOffsets[item.id]?.x || 0,
                                                                                        origY: sablonOffsets[item.id]?.y || 0,
                                                                                    })
                                                                                }}
                                                                                onTouchStart={(e) => {
                                                                                    const touch = e.touches[0]
                                                                                    setDragging({
                                                                                        cartId: item.id,
                                                                                        startX: touch.clientX,
                                                                                        startY: touch.clientY,
                                                                                        origX: sablonOffsets[item.id]?.x || 0,
                                                                                        origY: sablonOffsets[item.id]?.y || 0,
                                                                                    })
                                                                                }}
                                                                                className="absolute rounded-sm cursor-grab active:cursor-grabbing"
                                                                                style={{
                                                                                    ...sablonPositionStyles[sablon.position],
                                                                                    left: `calc(${sablonPositionStyles[sablon.position]?.left || '0%'} + ${sablonOffsets[item.id]?.x || 0}px)`,
                                                                                    top: `calc(${sablonPositionStyles[sablon.position]?.top || '0%'} + ${sablonOffsets[item.id]?.y || 0}px)`,
                                                                                    opacity: dragging?.cartId === item.id ? '0.7' : '0.85',
                                                                                    transition: dragging?.cartId === item.id ? 'none' : 'opacity 0.2s',
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        <p className="mt-1 text-center text-xs text-gray-500">
                                                                            {sablon.position === 'sleeve' ? 'Tampak samping' : 'Tampak depan'}
                                                                            {sablonOffsets[item.id] && (sablonOffsets[item.id].x !== 0 || sablonOffsets[item.id].y !== 0) && (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => setSablonOffsets((prev) => ({ ...prev, [item.id]: { x: 0, y: 0 } }))}
                                                                                    className="ml-2 text-gray-950 underline hover:no-underline"
                                                                                >Reset</button>
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>

                                <div className="mt-5 space-y-3 border-t border-gray-200 pt-4 text-sm">
                                    <SummaryRow label="Subtotal" value={formatRupiah(subtotal)} />
                                    <SummaryRow label="Ongkir" value={selectedShipping ? formatRupiah(shippingCost) : 'Pilih layanan'} />
                                    {selectedShipping && (
                                        <div className="rounded-2xl bg-gray-50 p-3 text-xs text-gray-600">
                                            {selectedDestination?.label}<br />
                                            {selectedShipping.code} {selectedShipping.service} - estimasi {selectedShipping.etd || '-'}
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                                        <span className="font-black">Total bayar</span>
                                        <span className="text-xl font-black">{formatRupiah(grandTotal)}</span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing || cartItems.length === 0}
                                    className="mt-5 w-full rounded-full bg-[#D4AF37] px-4 py-3 text-sm font-black text-white shadow-lg shadow-gray-950/20 hover:bg-[#C5A032] disabled:cursor-not-allowed disabled:bg-gray-300"
                                >
                                    {processing ? 'Memproses...' : checkoutConfig?.midtransReady ? 'Bayar Sekarang' : 'Buat Order'}
                                </button>

                                {!checkoutConfig?.midtransReady && (
                                    <p className="mt-3 text-xs leading-5 text-gray-500">
                                        Midtrans belum aktif. Isi `MIDTRANS_SERVER_KEY` dan `MIDTRANS_CLIENT_KEY` agar tombol ini membuat link pembayaran Snap.
                                    </p>
                                )}
                            </section>
                        </aside>
                    </form>
                </main>
            </div>
        </>
    )
}

function Input({ label, value, onChange, type = 'text' }) {
    return (
        <div>
            <label className="text-sm font-bold text-gray-700">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="mt-2 h-11 w-full rounded-2xl border border-gray-300 px-4 text-sm outline-none focus:border-gray-950"
                required
            />
        </div>
    )
}

function SummaryRow({ label, value }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-gray-600">{label}</span>
            <span className="font-bold">{value}</span>
        </div>
    )
}

function courierMeta(code = '') {
    const key = String(code).toLowerCase().replace(/[^a-z0-9]/g, '')
    const couriers = {
        jne: {
            name: 'JNE',
            logo: 'JNE',
            className: 'border-blue-100 bg-blue-50 text-blue-700',
        },
        jnt: {
            name: 'J&T Express',
            logo: 'J&T',
            className: 'border-red-100 bg-red-50 text-red-700',
        },
        sicepat: {
            name: 'SiCepat',
            logo: 'SCP',
            className: 'border-red-100 bg-red-50 text-red-700',
        },
        anteraja: {
            name: 'AnterAja',
            logo: 'AA',
            className: 'border-pink-100 bg-pink-50 text-pink-700',
        },
        pos: {
            name: 'POS Indonesia',
            logo: 'POS',
            className: 'border-orange-100 bg-orange-50 text-orange-700',
        },
        tiki: {
            name: 'TIKI',
            logo: 'TIKI',
            className: 'border-sky-100 bg-sky-50 text-sky-700',
        },
        ninja: {
            name: 'Ninja Xpress',
            logo: 'NX',
            className: 'border-red-100 bg-red-50 text-red-700',
        },
        lion: {
            name: 'Lion Parcel',
            logo: 'LION',
            className: 'border-rose-100 bg-rose-50 text-rose-700',
        },
        sap: {
            name: 'SAP Express',
            logo: 'SAP',
            className: 'border-green-100 bg-green-50 text-green-700',
        },
        wahana: {
            name: 'Wahana',
            logo: 'WHN',
            className: 'border-amber-100 bg-amber-50 text-amber-700',
        },
        ide: {
            name: 'ID Express',
            logo: 'ID',
            className: 'border-cyan-100 bg-cyan-50 text-cyan-700',
        },
    }

    return couriers[key] || {
        name: code ? String(code).toUpperCase() : 'Kurir',
        logo: code ? String(code).slice(0, 4).toUpperCase() : 'K',
        className: 'border-gray-200 bg-gray-50 text-gray-700',
    }
}
