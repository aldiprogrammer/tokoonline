import { Head, Link, router, usePage } from '@inertiajs/react'
import React, { useEffect, useMemo, useState } from 'react'
import Swal from 'sweetalert2'

export default function Toko({ produk, kategori }) {
    const { auth, flash, cart: initialCart } = usePage().props
    const [selectedCategory, setSelectedCategory] = useState('semua')
    const [cart, setCart] = useState(initialCart ?? [])
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
    const [customer, setCustomer] = useState({
        nama: '',
        hp: '',
        alamat: '',
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
            });
        }
    }, [flash?.success, flash?.error])

    const filteredProduk = useMemo(() => {
        if (selectedCategory === 'semua') {
            return produk
        }

        return produk.filter((item) => String(item.id_kategori) === String(selectedCategory))
    }, [produk, selectedCategory])

    const featuredProduct = produk[0]
    const featuredImage = featuredProduct?.gambarproduk?.[0]?.image
        ? `/storage/${featuredProduct.gambarproduk[0].image}`
        : 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1400&q=80'

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

    const addToCart = async (item) => {
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
                product_id: item.id,
                qty: 1,
                ukuran: item.ukuran?.split(',')?.[0] || '',
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

    const checkout = async (e) => {
        e.preventDefault()
        if (!auth?.user) {
            router.visit('/loginuser')
            return
        }

        const result = await sendCartRequest('/checkout', 'POST', customer)
        setIsCheckoutOpen(false)
        setIsCartOpen(false)
        setCustomer({ nama: '', hp: '', alamat: '' })
        Swal.fire('Berhasil', `Checkout ${result.order?.kode_order || ''} berhasil dibuat untuk ${customer.nama}. Total belanja: ${formatRupiah(cartTotal)}`, 'success')
    }

    const logoutUser = () => {
        router.post('/logoutuser')
    }

    return (
        <>
            <Head title="Toko Online Fashion" />

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

                        <nav className="hidden items-center gap-0.5 md:flex">
                            {[
                                { href: '#produk', label: 'Produk' },
                                { href: '#kategori', label: 'Kategori' },
                                { href: '#promo', label: 'Promo' },
                            ].map((item) => (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    className="relative px-4 py-2 text-sm font-semibold text-gray-500 transition-colors hover:text-gray-950 after:absolute after:bottom-0 after:left-4 after:right-4 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:bg-[#D4AF37] after:transition after:content-[''] hover:after:scale-x-100"
                                >
                                    {item.label}
                                </a>
                            ))}
                        </nav>

                        <div className="flex items-center gap-1 sm:gap-1.5">
                            <button
                                type="button"
                                className="grid h-9 w-9 place-items-center rounded-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-950"
                            >
                                <i className="fas fa-magnifying-glass text-sm"></i>
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
                        </div>
                    </div>
                </header>

                <main>
                    <section className="relative overflow-hidden bg-gradient-to-br from-[#D4AF37] via-[#C5A032] to-[#B8962E]">
                        <div className="absolute -inset-x-40 -inset-y-40 opacity-30">
                            <div className="h-full w-full animate-pulse" style={{
                                background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 70% 20%, rgba(255,255,255,0.2) 0%, transparent 40%), radial-gradient(circle at 50% 80%, rgba(255,255,255,0.15) 0%, transparent 45%)'
                            }}></div>
                        </div>

                        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
                            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                                <div className="text-center lg:text-left">
                                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm sm:text-sm">
                                        <span className="inline-block h-2 w-2 rounded-full bg-emerald-400"></span>
                                        Koleksi Fashion Terbaru
                                    </div>

                                    <h1 className="text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
                                        Tampil Gaya
                                        <br />
                                        <span className="relative">
                                            Setiap Hari
                                            <svg className="absolute -bottom-1 left-0 hidden w-full sm:block" viewBox="0 0 200 10" fill="none">
                                                <path d="M1 6C50 1 150 1 199 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
                                            </svg>
                                        </span>
                                    </h1>

                                    <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg lg:mx-0">
                                        Temukan koleksi baju pilihan dengan bahan premium, ukuran lengkap, dan harga bersahabat. Fashion nyaman untuk aktivitas harianmu.
                                    </p>

                                    <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
                                        <a href="#produk" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-gray-950 shadow-xl shadow-black/15 transition hover:-translate-y-0.5 hover:bg-gray-100 hover:shadow-2xl">
                                            Belanja Sekarang
                                            <i className="fas fa-arrow-right text-xs"></i>
                                        </a>
                                        <a href="#kategori" className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:border-white/60 hover:bg-white/10">
                                            <i className="fas fa-grid-2 text-xs"></i>
                                            Lihat Kategori
                                        </a>
                                    </div>

                                    <div className="mt-10 flex flex-wrap justify-center gap-6 border-t border-white/15 pt-8 sm:gap-10 lg:justify-start">
                                        <div className="text-center lg:text-left">
                                            <p className="text-2xl font-black text-white">{produk.length}+</p>
                                            <p className="text-xs font-medium text-white/60">Produk Fashion</p>
                                        </div>
                                        <div className="text-center lg:text-left">
                                            <p className="text-2xl font-black text-white">100%</p>
                                            <p className="text-xs font-medium text-white/60">Bahan Original</p>
                                        </div>
                                        <div className="text-center lg:text-left">
                                            <p className="text-2xl font-black text-white">24 Jam</p>
                                            <p className="text-xs font-medium text-white/60">Pengiriman</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative hidden lg:block">
                                    <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl shadow-black/30">
                                        <img
                                            src={featuredImage}
                                            alt="Featured product"
                                            className="h-full w-full object-cover transition duration-700 hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                                        <div className="absolute bottom-0 left-0 right-0 p-5">
                                            <p className="text-sm font-bold text-white/80">Produk Pilihan</p>
                                            {featuredProduct && (
                                                <p className="text-lg font-black text-white">{featuredProduct.nama_produk}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="absolute -left-6 top-10 rounded-2xl bg-white/95 p-4 shadow-xl backdrop-blur-sm">
                                        <p className="whitespace-nowrap text-xs font-semibold text-gray-500">Mulai dari</p>
                                        <p className="text-lg font-black text-[#D4AF37]">Rp 50.000</p>
                                    </div>

                                    <div className="absolute -right-4 bottom-20 rounded-2xl bg-white/95 p-4 shadow-xl backdrop-blur-sm">
                                        <div className="flex items-center gap-1.5">
                                            <div className="flex">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <i key={star} className="fas fa-star text-[10px] text-amber-400"></i>
                                                ))}
                                            </div>
                                            <span className="text-sm font-black text-gray-950">4.9</span>
                                        </div>
                                        <p className="text-xs text-gray-500">Rating Produk</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section id="promo" className="border-b border-gray-200 bg-white">
                        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-3 px-4 py-5 text-sm sm:grid-cols-3 sm:px-6 lg:px-8">
                            <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                                <i className="fas fa-truck-fast text-lg text-emerald-600"></i>
                                <span>Pengiriman cepat untuk semua pesanan.</span>
                            </div>
                            <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                                <i className="fas fa-tags text-lg text-amber-600"></i>
                                <span>Promo diskon untuk produk pilihan.</span>
                            </div>
                            <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                                <i className="fas fa-ruler-combined text-lg text-sky-600"></i>
                                <span>Ukuran produk mudah dipilih.</span>
                            </div>
                        </div>
                    </section>

                    <section id="kategori" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                        <div className="mb-4 flex items-end justify-between gap-4">
                            <div>
                                <p className="text-sm font-semibold text-gray-500">Kategori</p>
                                <h2 className="text-2xl font-black">Pilih gaya favorit</h2>
                            </div>
                            <span className="hidden text-sm text-gray-500 sm:block">{produk.length} produk tersedia</span>
                        </div>

                        <div className="flex gap-3 overflow-x-auto pb-2">
                            <button
                                type="button"
                                onClick={() => setSelectedCategory('semua')}
                                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold shadow-sm transition ${selectedCategory === 'semua' ? 'border-gray-950 bg-[#D4AF37] text-white' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'}`}
                            >
                                Semua
                            </button>
                            {kategori.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setSelectedCategory(item.id)}
                                    className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold shadow-sm transition ${String(selectedCategory) === String(item.id) ? 'border-gray-950 bg-[#D4AF37] text-white' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'}`}
                                >
                                    {item.kategori}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section id="produk" className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
                        <div className="mb-5 flex items-end justify-between gap-4">
                            <div>
                                <p className="text-sm font-semibold text-gray-500">Produk Terbaru</p>
                                <h2 className="text-2xl font-black">Rekomendasi untuk kamu</h2>
                            </div>
                        </div>

                        {filteredProduk.length > 0 ? (
                            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                                {filteredProduk.map((item) => {
                                    const diskonHarga = Number(item.diskon) > 0
                                        ? Number(item.harga) - (Number(item.harga) * Number(item.diskon) / 100)
                                        : Number(item.harga)
                                    return (
                                        <article key={item.id} className={`group relative overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200/60 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 ${Number(item.stok) < 1 ? 'opacity-60' : ''}`}>
                                            <div className="relative aspect-square overflow-hidden bg-gray-100">
                                                <Link href={`/produk/${item.slug}`}>
                                                    <img
                                                        src={getProductImage(item)}
                                                        alt={item.nama_produk}
                                                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                    />
                                                </Link>

                                                {Number(item.stok) < 1 && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                                        <span className="rounded bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow">
                                                            Stok Habis
                                                        </span>
                                                    </div>
                                                )}

                                                {Number(item.diskon) > 0 && Number(item.stok) > 0 && (
                                                    <span className="absolute left-0 top-0 rounded-br-lg bg-red-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                                                        -{item.diskon}%
                                                    </span>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() => router.visit(`/produk/${item.slug}`)}
                                                    disabled={Number(item.stok) < 1}
                                                    className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-700 shadow-md opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-[#D4AF37] hover:text-white disabled:cursor-not-allowed disabled:opacity-0"
                                                >
                                                    <i className="fas fa-shopping-cart text-sm"></i>
                                                </button>
                                            </div>

                                            <div className="p-3">
                                                <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-gray-400">
                                                    {item.kategoriproduk?.kategori || 'Fashion'}
                                                </p>

                                                <Link href={`/produk/${item.slug}`} className="line-clamp-2 min-h-[36px] text-sm font-semibold leading-snug text-gray-800 hover:text-gray-950 hover:underline">
                                                    {item.nama_produk}
                                                </Link>

                                                <div className="mt-2">
                                                    {Number(item.diskon) > 0 ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <p className="text-base font-bold text-red-600">
                                                                {formatRupiah(diskonHarga)}
                                                            </p>
                                                            <p className="text-xs text-gray-400 line-through">
                                                                {formatRupiah(item.harga)}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <p className="text-base font-bold text-gray-950">
                                                            {formatRupiah(item.harga)}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="mt-2 flex items-center gap-3 text-[11px] text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <i className="fas fa-store text-[10px]"></i>
                                                        {item.ukuran?.split(',').map((s) => s.trim()).join(', ') || 'Jakarta'}
                                                    </span>
                                                    {Number(item.stok) > 0 && (
                                                        <span className="flex items-center gap-1">
                                                            <i className="fas fa-box text-[10px]"></i>
                                                            Stok {item.stok}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </article>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-12 text-center">
                                <i className="fas fa-shirt mb-3 text-3xl text-gray-400"></i>
                                <h3 className="text-lg font-bold">Produk belum tersedia</h3>
                                <p className="mt-1 text-sm text-gray-500">Silakan cek kategori lain atau tambah produk dari halaman admin.</p>
                            </div>
                        )}
                    </section>
                </main>

                <footer className="border-t border-gray-200 bg-white">
                    <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                        <p className="font-semibold text-gray-950">Fabrico</p>
                        <p>Belanja baju nyaman, cepat, dan terpercaya.</p>
                    </div>
                </footer>

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
                                            <p className="mt-1 text-sm text-gray-500">Pilih produk favorit kamu dulu.</p>
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

                {isCheckoutOpen && (
                    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/50 px-4">
                        <div className="w-full max-w-lg rounded-lg bg-white p-5 shadow-2xl">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-black">Checkout</h2>
                                <button type="button" onClick={() => setIsCheckoutOpen(false)} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-gray-100">
                                    <i className="fas fa-xmark"></i>
                                </button>
                            </div>

                            <form onSubmit={checkout} className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Nama lengkap"
                                    value={customer.nama}
                                    onChange={(e) => setCustomer({ ...customer, nama: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-950"
                                    required
                                />
                                <input
                                    type="tel"
                                    placeholder="Nomor HP / WhatsApp"
                                    value={customer.hp}
                                    onChange={(e) => setCustomer({ ...customer, hp: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-950"
                                    required
                                />
                                <textarea
                                    placeholder="Alamat lengkap"
                                    value={customer.alamat}
                                    onChange={(e) => setCustomer({ ...customer, alamat: e.target.value })}
                                    className="min-h-28 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-950"
                                    required
                                ></textarea>

                                <div className="rounded-lg bg-gray-50 p-4">
                                    <div className="flex justify-between text-sm">
                                        <span>Total item</span>
                                        <span className="font-bold">{cartCount}</span>
                                    </div>
                                    <div className="mt-2 flex justify-between text-sm">
                                        <span>Total bayar</span>
                                        <span className="font-black">{formatRupiah(cartTotal)}</span>
                                    </div>
                                </div>

                                <button type="submit" className="w-full rounded-lg bg-[#D4AF37] px-4 py-3 text-sm font-bold text-white hover:bg-[#C5A032]">
                                    Buat Pesanan
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
