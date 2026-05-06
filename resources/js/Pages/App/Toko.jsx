import { Head, Link } from '@inertiajs/react'
import React, { useEffect, useMemo, useState } from 'react'

export default function Toko({ produk, kategori }) {
    const [selectedCategory, setSelectedCategory] = useState('semua')
    const [cart, setCart] = useState([])
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
    const [customer, setCustomer] = useState({
        nama: '',
        hp: '',
        alamat: '',
    })

    useEffect(() => {
        const savedCart = localStorage.getItem('febrinox_cart')

        if (savedCart) {
            setCart(JSON.parse(savedCart))
        }
    }, [])

    useEffect(() => {
        localStorage.setItem('febrinox_cart', JSON.stringify(cart))
    }, [cart])

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

    const addToCart = (item) => {
        setCart((currentCart) => {
            const existingProduct = currentCart.find((cartItem) => cartItem.id === item.id)

            if (existingProduct) {
                return currentCart.map((cartItem) =>
                    cartItem.id === item.id
                        ? { ...cartItem, qty: Math.min(cartItem.qty + 1, Number(item.stok || 1)) }
                        : cartItem
                )
            }

            return [
                ...currentCart,
                {
                    id: item.id,
                    nama_produk: item.nama_produk,
                    harga: Number(item.harga || 0),
                    ukuran: item.ukuran,
                    stok: Number(item.stok || 0),
                    image: getProductImage(item),
                    qty: 1,
                },
            ]
        })
        setIsCartOpen(true)
    }

    const increaseQty = (id) => {
        setCart((currentCart) =>
            currentCart.map((item) =>
                item.id === id ? { ...item, qty: Math.min(item.qty + 1, item.stok) } : item
            )
        )
    }

    const decreaseQty = (id) => {
        setCart((currentCart) =>
            currentCart
                .map((item) => item.id === id ? { ...item, qty: item.qty - 1 } : item)
                .filter((item) => item.qty > 0)
        )
    }

    const removeFromCart = (id) => {
        setCart((currentCart) => currentCart.filter((item) => item.id !== id))
    }

    const checkout = (e) => {
        e.preventDefault()
        alert(`Checkout berhasil dibuat untuk ${customer.nama}. Total belanja: ${formatRupiah(cartTotal)}`)
        setCart([])
        setIsCheckoutOpen(false)
        setIsCartOpen(false)
        setCustomer({ nama: '', hp: '', alamat: '' })
    }

    return (
        <>
            <Head title="Toko Online Fashion" />

            <div className="min-h-screen bg-white text-gray-950">
                <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
                            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gray-950 text-white">
                                <i className="fas fa-shirt"></i>
                            </span>
                            FEBRINOX
                        </Link>

                        <nav className="hidden items-center gap-7 text-sm font-semibold text-gray-600 md:flex">
                            <a href="#produk" className="hover:text-gray-950">Produk</a>
                            <a href="#kategori" className="hover:text-gray-950">Kategori</a>
                            <a href="#promo" className="hover:text-gray-950">Promo</a>
                        </nav>

                        <div className="flex items-center gap-2">
                            <button className="grid h-10 w-10 place-items-center rounded-lg border border-gray-200 hover:bg-gray-100">
                                <i className="fas fa-magnifying-glass"></i>
                            </button>
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
                        </div>
                    </div>
                </header>

                <main>
                    <section className="relative overflow-hidden">
                        <div className="absolute inset-0">
                            <img src='https://emediaidentity.com/wp-content/uploads/2025/04/1350-2023223-Desain-12-minCetak-min-1.png-1-scaled-1.webp' alt="Koleksi fashion terbaru" className="h-full w-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/10"></div>
                        </div>

                        <div className="relative mx-auto grid min-h-[520px] max-w-7xl content-end px-4 pb-8 pt-24 sm:px-6 md:min-h-[620px] lg:px-8">
                            <div className="max-w-2xl text-white">
                                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-white/75">
                                    Koleksi Fashion Harian
                                </p>
                                <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                                    Outfit nyaman untuk setiap gaya.
                                </h1>
                                <p className="mt-4 max-w-xl text-base leading-7 text-white/80 sm:text-lg">
                                    Temukan baju pilihan dengan ukuran lengkap, harga bersahabat, dan tampilan yang siap dipakai sehari-hari.
                                </p>
                                <div className="mt-6 flex flex-wrap gap-3">
                                    <a href="#produk" className="rounded-lg bg-white px-5 py-3 text-sm font-bold text-gray-950 hover:bg-gray-100">
                                        Belanja Sekarang
                                    </a>
                                    <a href="#kategori" className="rounded-lg border border-white/40 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">
                                        Lihat Kategori
                                    </a>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section id="promo" className="border-b border-gray-200 bg-gray-950 text-white">
                        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-5 text-sm sm:grid-cols-3 sm:px-6 lg:px-8">
                            <div className="flex items-center gap-3">
                                <i className="fas fa-truck-fast text-lg text-emerald-300"></i>
                                <span>Pengiriman cepat untuk semua pesanan.</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <i className="fas fa-tags text-lg text-amber-300"></i>
                                <span>Promo diskon untuk produk pilihan.</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <i className="fas fa-ruler-combined text-lg text-sky-300"></i>
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
                                className={`shrink-0 rounded-lg border px-4 py-2 text-sm font-bold ${selectedCategory === 'semua' ? 'border-gray-950 bg-gray-950 text-white' : 'border-gray-200 bg-white text-gray-700'}`}
                            >
                                Semua
                            </button>
                            {kategori.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setSelectedCategory(item.id)}
                                    className={`shrink-0 rounded-lg border px-4 py-2 text-sm font-bold ${String(selectedCategory) === String(item.id) ? 'border-gray-950 bg-gray-950 text-white' : 'border-gray-200 bg-white text-gray-700'}`}
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
                            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
                                {filteredProduk.map((item) => (
                                    <article key={item.id} className="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                                        <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                                            <img
                                                src={getProductImage(item)}
                                                alt={item.nama_produk}
                                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                            />
                                            {Number(item.diskon) > 0 && (
                                                <span className="absolute left-2 top-2 rounded-md bg-red-600 px-2 py-1 text-xs font-bold text-white">
                                                    -{item.diskon}%
                                                </span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => addToCart(item)}
                                                disabled={Number(item.stok) < 1}
                                                className="absolute bottom-2 right-2 grid h-10 w-10 place-items-center rounded-lg bg-white text-gray-950 shadow-md hover:bg-gray-950 hover:text-white disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                                            >
                                                <i className="fas fa-cart-shopping"></i>
                                            </button>
                                        </div>

                                        <div className="p-3 sm:p-4">
                                            <p className="mb-1 truncate text-xs font-semibold uppercase text-gray-500">
                                                {item.kategoriproduk?.kategori || 'Fashion'}
                                            </p>
                                            <h3 className="line-clamp-2 min-h-[40px] text-sm font-bold leading-5 sm:text-base">
                                                {item.nama_produk}
                                            </h3>
                                            <div className="mt-3 flex items-center justify-between gap-2">
                                                <div>
                                                    <p className="text-base font-black text-gray-950 sm:text-lg">
                                                        {formatRupiah(item.harga)}
                                                    </p>
                                                    <p className="text-xs text-gray-500">Ukuran {item.ukuran}</p>
                                                </div>
                                                <span className={`rounded-md px-2 py-1 text-xs font-bold ${Number(item.stok) > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                                    Stok {item.stok}
                                                </span>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-lg border border-dashed border-gray-300 px-5 py-12 text-center">
                                <i className="fas fa-shirt mb-3 text-3xl text-gray-400"></i>
                                <h3 className="text-lg font-bold">Produk belum tersedia</h3>
                                <p className="mt-1 text-sm text-gray-500">Silakan cek kategori lain atau tambah produk dari halaman admin.</p>
                            </div>
                        )}
                    </section>
                </main>

                <footer className="border-t border-gray-200 bg-gray-50">
                    <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                        <p className="font-semibold text-gray-950">MyStore Fashion</p>
                        <p>Belanja baju nyaman, cepat, dan responsive dari perangkat apa pun.</p>
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
                                    onClick={() => setIsCheckoutOpen(true)}
                                    className="w-full rounded-lg bg-gray-950 px-4 py-3 text-sm font-bold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
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

                                <button type="submit" className="w-full rounded-lg bg-gray-950 px-4 py-3 text-sm font-bold text-white hover:bg-gray-800">
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
