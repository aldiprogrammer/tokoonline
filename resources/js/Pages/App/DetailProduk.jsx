import { Head, Link, router, usePage } from '@inertiajs/react'
import React, { useEffect, useMemo, useState } from 'react'
import Swal from 'sweetalert2'

export default function DetailProduk({ produk, produkTerkait, reviews = [], reviewSummary = { count: 0, average: 0 } }) {
    const [isCartOpen, setIsCartOpen] = useState(false)
    const { auth, flash, cart: initialCart } = usePage().props
    const [cart, setCart] = useState(initialCart ?? [])
    const images = produk.gambarproduk?.length > 0
        ? produk.gambarproduk.map((gambar) => `/storage/${gambar.image}`)
        : ['https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=900&q=80']
    const [selectedImage, setSelectedImage] = useState(images[0])
    const ukuranProduk = useMemo(() => produk.ukuran ? produk.ukuran.split(',') : [], [produk.ukuran])
    const [selectedSize, setSelectedSize] = useState(ukuranProduk[0] || '')
    const [qty, setQty] = useState(1)

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

    const getProductImage = (item) => {
        return item.gambarproduk?.[0]?.image
            ? `/storage/${item.gambarproduk[0].image}`
            : 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=800&q=80'
    }

    const cartCount = cart.reduce((total, item) => total + item.qty, 0)
    const cartTotal = cart.reduce((total, item) => total + item.harga * item.qty, 0)
    const reviewAverage = Number(reviewSummary?.average || 0)

    const sendCartRequest = async (url, method, payload = null, successMessage = null) => {
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

        if (successMessage) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: successMessage,
                showConfirmButton: false,
                timer: 2200,
                timerProgressBar: true,
            })
        }

        return result
    }

    const addToCart = async () => {
        if (!auth?.user) {
            Swal.fire({
                icon: 'info',
                title: 'Login dulu',
                text: 'Silakan login dengan Google sebelum menambahkan produk ke keranjang.',
                showCancelButton: true,
                confirmButtonText: 'Login Google',
                cancelButtonText: 'Batal',
                buttonsStyling: false,
                customClass: {
                    actions: 'gap-3',
                    confirmButton: 'px-4 py-2 rounded-lg bg-[#D4AF37] text-white font-semibold hover:bg-[#C5A032]',
                    cancelButton: 'px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300',
                },
            }).then((result) => {
                if (result.isConfirmed) {
                    router.visit('/loginuser')
                }
            })
            return
        }

        try {
            await sendCartRequest('/cart', 'POST', {
                product_id: produk.id,
                qty,
                ukuran: selectedSize,
            }, 'Produk ditambahkan ke keranjang')
            setIsCartOpen(true)
        } catch (error) {
            Swal.fire('Gagal', error.message, 'error')
        }
    }

    const increaseQty = async (cartId) => {
        if (!auth?.user) {
            router.visit('/loginuser')
            return
        }

        const item = cart.find((cartItem) => cartItem.id === cartId)
        if (!item) return

        try {
            await sendCartRequest(`/cart/${cartId}`, 'PUT', {
                qty: Math.min(item.qty + 1, item.stok),
            })
        } catch (error) {
            Swal.fire('Gagal', error.message, 'error')
        }
    }

    const decreaseQty = async (cartId) => {
        if (!auth?.user) {
            router.visit('/loginuser')
            return
        }

        const item = cart.find((cartItem) => cartItem.id === cartId)
        if (!item) return

        try {
            if (item.qty <= 1) {
                await sendCartRequest(`/cart/${cartId}`, 'DELETE')
                return
            }

            await sendCartRequest(`/cart/${cartId}`, 'PUT', {
                qty: item.qty - 1,
            })
        } catch (error) {
            Swal.fire('Gagal', error.message, 'error')
        }
    }

    const removeFromCart = async (cartId) => {
        try {
            await sendCartRequest(`/cart/${cartId}`, 'DELETE')
        } catch (error) {
            Swal.fire('Gagal', error.message, 'error')
        }
    }

    return (
        <>
            <Head title={produk.nama_produk} />

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

                            {auth?.user ? (
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
                            ) : (
                                <Link
                                    href="/loginuser"
                                    className="flex h-9 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm"
                                >
                                    <i className="fas fa-user text-xs"></i>
                                    <span className="hidden sm:inline">Masuk</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mb-5 text-sm text-gray-500">
                        <Link href="/" className="font-semibold text-gray-950 hover:underline">Toko</Link>
                        <span className="mx-2">/</span>
                        <span>{produk.nama_produk}</span>
                    </div>

                    <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                        <div className="space-y-3">
                            <div className="overflow-hidden rounded-3xl bg-gray-100 shadow-xl shadow-gray-950/10">
                                <img src={selectedImage} alt={produk.nama_produk} className="aspect-[4/5] w-full object-cover lg:aspect-[5/5]" />
                            </div>
                            <div className="grid grid-cols-5 gap-2">
                                {images.map((image) => (
                                    <button
                                        key={image}
                                        type="button"
                                        onClick={() => setSelectedImage(image)}
                                        className={`overflow-hidden rounded-2xl border bg-white p-1 transition ${selectedImage === image ? 'border-gray-950 shadow-lg shadow-gray-950/10' : 'border-gray-200 hover:border-gray-400'}`}
                                    >
                                        <img src={image} alt={produk.nama_produk} className="aspect-square w-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-xl shadow-gray-950/5 sm:p-6 lg:sticky lg:top-24 lg:self-start">
                            <p className="text-sm font-bold uppercase tracking-[0.16em] text-gray-500">{produk.kategoriproduk?.kategori || 'Fashion'}</p>
                            <h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">{produk.nama_produk}</h1>
                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                <p className="text-3xl font-black">{formatRupiah(produk.harga)}</p>
                                {Number(produk.diskon) > 0 && (
                                    <span className="rounded-full bg-red-600 px-2.5 py-1 text-sm font-bold text-white">-{produk.diskon}%</span>
                                )}
                                {Number(reviewSummary?.count || 0) > 0 && (
                                    <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700">
                                        <i className="fas fa-star mr-1"></i>{reviewAverage} ({reviewSummary.count})
                                    </span>
                                )}
                            </div>

                            <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                                <h2 className="font-black">Keterangan Produk</h2>
                                {produk.ratio && (
                                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-700">
                                        <i className="fas fa-divide text-gray-500"></i>
                                        <span className="font-semibold">Ratio:</span>
                                        <span className="font-bold text-gray-950">{produk.ratio}</span>
                                    </div>
                                )}
                                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-gray-600">
                                    {produk.keterangan || 'Produk fashion pilihan dengan bahan nyaman untuk aktivitas harian.'}
                                </p>
                            </div>

                            <div className="mt-6">
                                <div className="mb-2 flex items-center justify-between">
                                    <h2 className="font-black">Pilih Ukuran</h2>
                                    <span className="text-sm text-gray-500">Stok {produk.stok}</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {ukuranProduk.map((ukuran) => (
                                        <button
                                            key={ukuran}
                                            type="button"
                                            onClick={() => setSelectedSize(ukuran)}
                                            className={`h-11 min-w-12 rounded-full border px-4 text-sm font-black transition ${selectedSize === ukuran ? 'border-gray-950 bg-[#D4AF37] text-white' : 'border-gray-200 bg-white text-gray-800 hover:border-gray-950'}`}
                                        >
                                            {ukuran}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-6 flex items-center gap-3">
                                <div className="flex h-12 items-center rounded-full border border-gray-200 bg-white">
                                    <button type="button" onClick={() => setQty(Math.max(qty - 1, 1))} className="grid h-12 w-12 place-items-center hover:bg-gray-100">
                                        <i className="fas fa-minus text-xs"></i>
                                    </button>
                                    <span className="grid h-12 min-w-12 place-items-center font-black">{qty}</span>
                                    <button type="button" onClick={() => setQty(Math.min(qty + 1, Number(produk.stok || 1)))} className="grid h-12 w-12 place-items-center hover:bg-gray-100">
                                        <i className="fas fa-plus text-xs"></i>
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={addToCart}
                                    disabled={!selectedSize || Number(produk.stok) < 1}
                                    className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-5 text-sm font-black text-white shadow-lg shadow-gray-950/20 hover:bg-[#C5A032] disabled:cursor-not-allowed disabled:bg-gray-300"
                                >
                                    <i className="fas fa-cart-shopping"></i>
                                    Tambah ke Keranjang
                                </button>
                            </div>

                            <div className="mt-6 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                                <div className="rounded-2xl bg-gray-50 p-4">
                                    <i className="fas fa-truck-fast mb-2 text-gray-950"></i>
                                    <p className="font-bold">Pengiriman Cepat</p>
                                </div>
                                <div className="rounded-2xl bg-gray-50 p-4">
                                    <i className="fas fa-shield-halved mb-2 text-gray-950"></i>
                                    <p className="font-bold">Checkout Aman</p>
                                </div>
                                <div className="rounded-2xl bg-gray-50 p-4">
                                    <i className="fas fa-ruler-combined mb-2 text-gray-950"></i>
                                    <p className="font-bold">Ukuran Lengkap</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {produkTerkait.length > 0 && (
                        <section className="mt-14">
                            <h2 className="mb-5 text-2xl font-black">Produk Terkait</h2>
                            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
                                {produkTerkait.map((item) => {
                                    const diskonHarga = Number(item.diskon) > 0
                                        ? Number(item.harga) - (Number(item.harga) * Number(item.diskon) / 100)
                                        : Number(item.harga)
                                    return (
                                        <Link key={item.id} href={`/produk/${item.slug}`} className="group relative overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200/60 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
                                            <div className="relative aspect-square overflow-hidden bg-gray-100">
                                                <img src={getProductImage(item)} alt={item.nama_produk} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                                                {Number(item.diskon) > 0 && (
                                                    <span className="absolute left-0 top-0 rounded-br-lg bg-red-600 px-2 py-1 text-[11px] font-bold text-white shadow-sm">
                                                        -{item.diskon}%
                                                    </span>
                                                )}
                                            </div>
                                            <div className="p-3">
                                                <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-gray-400">
                                                    {item.kategoriproduk?.kategori || 'Fashion'}
                                                </p>
                                                <p className="line-clamp-2 min-h-[34px] text-sm font-semibold leading-snug text-gray-800 group-hover:text-gray-950 group-hover:underline">
                                                    {item.nama_produk}
                                                </p>
                                                <div className="mt-2">
                                                    {Number(item.diskon) > 0 ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <p className="text-sm font-bold text-red-600">
                                                                {formatRupiah(diskonHarga)}
                                                            </p>
                                                            <p className="text-xs text-gray-400 line-through">
                                                                {formatRupiah(item.harga)}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm font-bold text-gray-950">
                                                            {formatRupiah(item.harga)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        </section>
                    )}

                    <section className="mt-14 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-sm font-semibold text-gray-500">Review Produk</p>
                                <h2 className="text-2xl font-black">Komentar pembeli</h2>
                            </div>
                            <div className="rounded-full bg-amber-50 px-4 py-2 text-sm font-black text-amber-700">
                                <i className="fas fa-star mr-1"></i>
                                {reviewAverage || '-'} dari {reviewSummary?.count || 0} review
                            </div>
                        </div>

                        {reviews.length > 0 ? (
                            <div className="grid gap-3 md:grid-cols-2">
                                {reviews.map((review) => (
                                    <article key={review.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                                        <div className="mb-3 flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#D4AF37] text-sm font-black text-white">
                                                    {review.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                                </span>
                                                <div>
                                                    <p className="font-black">{review.user?.name || 'Customer'}</p>
                                                    <p className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString('id-ID')}</p>
                                                </div>
                                            </div>
                                            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-amber-600">
                                                <i className="fas fa-star mr-1"></i>{review.rating}
                                            </span>
                                        </div>
                                        <p className="line-clamp-4 text-sm leading-6 text-gray-600">{review.komentar}</p>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-gray-300 px-5 py-10 text-center">
                                <i className="fas fa-comment-dots mb-3 text-3xl text-gray-300"></i>
                                <h3 className="font-black">Belum ada review</h3>
                                <p className="mt-1 text-sm text-gray-500">Review dari pembeli akan tampil setelah produk diterima.</p>
                            </div>
                        )}
                    </section>
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
                                <button
                                    type="button"
                                    onClick={() => setIsCartOpen(false)}
                                    className="grid h-10 w-10 place-items-center rounded-lg border border-gray-200 hover:bg-gray-100"
                                >
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
                                                            <button
                                                                type="button"
                                                                onClick={() => decreaseQty(item.id)}
                                                                className="grid h-8 w-8 place-items-center hover:bg-gray-100"
                                                            >
                                                                <i className="fas fa-minus text-xs"></i>
                                                            </button>
                                                            <span className="grid h-8 min-w-8 place-items-center text-sm font-bold">{item.qty}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => increaseQty(item.id)}
                                                                className="grid h-8 w-8 place-items-center hover:bg-gray-100"
                                                            >
                                                                <i className="fas fa-plus text-xs"></i>
                                                            </button>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() => removeFromCart(item.id)}
                                                            className="text-sm font-semibold text-red-600 hover:text-red-700"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid h-full place-items-center text-center">
                                        <div>
                                            <i className="fas fa-bag-shopping mb-3 text-4xl text-gray-300"></i>
                                            <h3 className="font-bold">Keranjang masih kosong</h3>
                                            <p className="mt-1 text-sm text-gray-500">Tambahkan produk dari halaman detail ini.</p>
                                        </div>
                                    </div>
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
