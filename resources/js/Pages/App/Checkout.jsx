import { Head, Link, router } from '@inertiajs/react'
import React, { useMemo, useState } from 'react'
import Swal from 'sweetalert2'

export default function Checkout({ cartItems = [], profil, alamat, checkoutConfig }) {
    const [form, setForm] = useState({
        nama_penerima: profil?.nama || '',
        whatsapp: profil?.whatsapp || '',
        alamat_pengiriman: alamat?.alamat || '',
    })
    const [destinationSearch, setDestinationSearch] = useState(alamat?.kabupaten || '')
    const [destinations, setDestinations] = useState([])
    const [selectedDestination, setSelectedDestination] = useState(null)
    const [shippingOptions, setShippingOptions] = useState([])
    const [selectedShipping, setSelectedShipping] = useState(null)
    const [loadingDestination, setLoadingDestination] = useState(false)
    const [loadingCost, setLoadingCost] = useState(false)
    const [processing, setProcessing] = useState(false)

    const subtotal = useMemo(() => cartItems.reduce((total, item) => total + item.harga * item.qty, 0), [cartItems])
    const totalQty = useMemo(() => cartItems.reduce((total, item) => total + item.qty, 0), [cartItems])
    const totalWeight = Math.max(totalQty * Number(checkoutConfig?.defaultWeight || 500), 1)
    const shippingCost = selectedShipping ? Number(selectedShipping.cost || 0) : 0
    const grandTotal = subtotal + shippingCost
    const rajaReady = checkoutConfig?.rajaongkirReady

    const formatRupiah = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(Number(value || 0))
    }

    const requestJson = async (url, options = {}) => {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
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

    const searchDestination = async () => {
        if (!rajaReady) {
            Swal.fire('RajaOngkir belum aktif', 'Isi RAJAONGKIR_API_KEY dan RAJAONGKIR_ORIGIN_ID di .env terlebih dahulu.', 'info')
            return
        }

        if (destinationSearch.trim().length < 3) {
            Swal.fire('Tujuan terlalu pendek', 'Ketik minimal 3 karakter nama kota, kecamatan, atau kode pos.', 'info')
            return
        }

        try {
            setLoadingDestination(true)
            const result = await requestJson(`/checkout/destinations?search=${encodeURIComponent(destinationSearch.trim())}`)
            setDestinations(result.data || [])
            setSelectedDestination(null)
            setSelectedShipping(null)
            setShippingOptions([])
        } catch (error) {
            Swal.fire('Gagal', error.message, 'error')
        } finally {
            setLoadingDestination(false)
        }
    }

    const chooseDestination = async (destination) => {
        setSelectedDestination(destination)
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

            <div className="min-h-screen bg-white text-gray-950">
                <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                        <Link href="/" className="flex min-w-0 items-center gap-2 text-lg font-bold">
                            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gray-950 text-white">
                                <i className="fas fa-shirt"></i>
                            </span>
                            <span className="truncate">FEBRINOX</span>
                        </Link>
                        <Link href="/" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-bold hover:bg-gray-100">
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

                    <section className="mb-6 border-b border-gray-200 pb-6">
                        <p className="text-sm font-semibold text-gray-500">Pembayaran dan pengiriman</p>
                        <h1 className="mt-2 text-3xl font-black">Checkout pesanan</h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                            Pilih tujuan pengiriman, cek ongkir RajaOngkir, lalu lanjutkan pembayaran melalui Midtrans Snap.
                        </p>
                    </section>

                    <form onSubmit={submitCheckout} className="grid gap-6 lg:grid-cols-[1fr_390px]">
                        <div className="space-y-6">
                            <section className="rounded-lg border border-gray-200 p-4 sm:p-6">
                                <h2 className="text-xl font-black">Data penerima</h2>
                                <div className="mt-4 grid gap-4 md:grid-cols-2">
                                    <Input label="Nama penerima" value={form.nama_penerima} onChange={(value) => setForm({ ...form, nama_penerima: value })} />
                                    <Input label="WhatsApp" type="tel" value={form.whatsapp} onChange={(value) => setForm({ ...form, whatsapp: value })} />
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-bold text-gray-700">Alamat lengkap</label>
                                        <textarea
                                            value={form.alamat_pengiriman}
                                            onChange={(e) => setForm({ ...form, alamat_pengiriman: e.target.value })}
                                            className="mt-2 min-h-28 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-950"
                                            placeholder="Nama jalan, nomor rumah, RT/RW, dan patokan"
                                            required
                                        ></textarea>
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-lg border border-gray-200 p-4 sm:p-6">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                    <div>
                                        <h2 className="text-xl font-black">Pengiriman RajaOngkir</h2>
                                        <p className="mt-1 text-sm text-gray-500">Berat estimasi: {totalWeight} gram dari {totalQty} item.</p>
                                    </div>
                                    {!rajaReady && (
                                        <button type="button" onClick={useTemporaryShipping} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-bold hover:bg-gray-100">
                                            Pakai sementara
                                        </button>
                                    )}
                                </div>

                                {!rajaReady && (
                                    <div className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
                                        RajaOngkir belum aktif. Isi `RAJAONGKIR_API_KEY` dan `RAJAONGKIR_ORIGIN_ID` di `.env` untuk mengaktifkan pencarian tujuan dan ongkir otomatis.
                                    </div>
                                )}

                                <div className="mt-4 flex gap-2">
                                    <input
                                        type="text"
                                        value={destinationSearch}
                                        onChange={(e) => setDestinationSearch(e.target.value)}
                                        className="h-11 flex-1 rounded-lg border border-gray-300 px-4 text-sm outline-none focus:border-gray-950"
                                        placeholder="Cari kota, kecamatan, kelurahan, atau kode pos"
                                    />
                                    <button type="button" onClick={searchDestination} disabled={loadingDestination} className="rounded-lg bg-gray-950 px-4 text-sm font-bold text-white hover:bg-gray-800 disabled:bg-gray-300">
                                        {loadingDestination ? 'Mencari...' : 'Cari'}
                                    </button>
                                </div>

                                {destinations.length > 0 && (
                                    <div className="mt-4 grid gap-2">
                                        {destinations.map((destination) => (
                                            <button
                                                key={destination.id}
                                                type="button"
                                                onClick={() => chooseDestination(destination)}
                                                className={`rounded-lg border p-3 text-left text-sm ${selectedDestination?.id === destination.id ? 'border-gray-950 bg-gray-950 text-white' : 'border-gray-200 hover:border-gray-950'}`}
                                            >
                                                <span className="font-black">{destination.label}</span>
                                                <span className="mt-1 block text-xs opacity-75">{destination.zip_code || '-'}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {loadingCost && <p className="mt-4 text-sm font-semibold text-gray-500">Mengambil ongkir...</p>}

                                {shippingOptions.length > 0 && (
                                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                                        {shippingOptions.map((option) => {
                                            const active = selectedShipping?.code === option.code && selectedShipping?.service === option.service

                                            return (
                                                <button
                                                    key={`${option.code}-${option.service}`}
                                                    type="button"
                                                    onClick={() => setSelectedShipping(option)}
                                                    className={`rounded-lg border p-4 text-left ${active ? 'border-gray-950 bg-gray-950 text-white' : 'border-gray-200 hover:border-gray-950'}`}
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <p className="font-black uppercase">{option.code} {option.service}</p>
                                                            <p className="mt-1 text-sm opacity-75">{option.description || option.name}</p>
                                                        </div>
                                                        <p className="shrink-0 font-black">{formatRupiah(option.cost)}</p>
                                                    </div>
                                                    <p className="mt-3 text-xs font-semibold opacity-75">Estimasi {option.etd || '-'}</p>
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            </section>
                        </div>

                        <aside className="lg:sticky lg:top-24 lg:self-start">
                            <section className="rounded-lg border border-gray-200 p-4 sm:p-5">
                                <h2 className="text-xl font-black">Ringkasan</h2>
                                <div className="mt-4 max-h-[330px] space-y-3 overflow-y-auto pr-1">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex gap-3">
                                            <img src={item.image} alt={item.nama_produk} className="h-16 w-16 rounded-lg object-cover" />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-black">{item.nama_produk}</p>
                                                <p className="text-xs text-gray-500">Ukuran {item.ukuran} x {item.qty}</p>
                                                <p className="mt-1 text-sm font-bold">{formatRupiah(item.harga * item.qty)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-5 space-y-3 border-t border-gray-200 pt-4 text-sm">
                                    <SummaryRow label="Subtotal" value={formatRupiah(subtotal)} />
                                    <SummaryRow label="Ongkir" value={selectedShipping ? formatRupiah(shippingCost) : 'Pilih layanan'} />
                                    {selectedShipping && (
                                        <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
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
                                    className="mt-5 w-full rounded-lg bg-gray-950 px-4 py-3 text-sm font-black text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                                >
                                    {processing ? 'Memproses...' : checkoutConfig?.midtransReady ? 'Bayar dengan Midtrans' : 'Buat Order'}
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
                className="mt-2 h-11 w-full rounded-lg border border-gray-300 px-4 text-sm outline-none focus:border-gray-950"
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
