import { Head, Link, router, usePage } from '@inertiajs/react'
import React, { useEffect, useMemo, useState } from 'react'
import Swal from 'sweetalert2'

export default function DetailProduk({ produk, produkTerkait }) {
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
                    confirmButton: 'px-4 py-2 rounded-lg bg-gray-950 text-white font-semibold hover:bg-gray-800',
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

            <div className="min-h-screen bg-white text-gray-950">
                <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
                            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gray-950 text-white">
                                <i className="fas fa-shirt"></i>
                            </span>
                            FEBRINOX
                        </Link>
                        <div className='flex gap-3'>
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
                            {auth?.user ? (
                                <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-2 py-2 sm:px-3">
                                    {auth.user.avatar && <img src={auth.user.avatar} alt={auth.user.name} className="h-6 w-6 rounded-full" />}

                                </div>
                            ) : (
                                <Link href="/loginuser" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-bold hover:bg-gray-100">Login</Link>
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
                            <div className="overflow-hidden rounded-lg bg-gray-100">
                                <img src={selectedImage} alt={produk.nama_produk} className="aspect-[4/5] w-full object-cover lg:aspect-[5/5]" />
                            </div>
                            <div className="grid grid-cols-5 gap-2">
                                {images.map((image) => (
                                    <button
                                        key={image}
                                        type="button"
                                        onClick={() => setSelectedImage(image)}
                                        className={`overflow-hidden rounded-lg border ${selectedImage === image ? 'border-gray-950' : 'border-gray-200'}`}
                                    >
                                        <img src={image} alt={produk.nama_produk} className="aspect-square w-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="lg:sticky lg:top-24 lg:self-start">
                            <p className="text-sm font-bold uppercase tracking-[0.16em] text-gray-500">{produk.kategoriproduk?.kategori || 'Fashion'}</p>
                            <h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">{produk.nama_produk}</h1>
                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                <p className="text-3xl font-black">{formatRupiah(produk.harga)}</p>
                                {Number(produk.diskon) > 0 && (
                                    <span className="rounded-md bg-red-600 px-2 py-1 text-sm font-bold text-white">-{produk.diskon}%</span>
                                )}
                            </div>

                            <div className="mt-6 rounded-lg border border-gray-200 p-4">
                                <h2 className="font-black">Keterangan Produk</h2>
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
                                            className={`h-11 min-w-12 rounded-lg border px-4 text-sm font-black ${selectedSize === ukuran ? 'border-gray-950 bg-gray-950 text-white' : 'border-gray-200 bg-white text-gray-800 hover:border-gray-950'}`}
                                        >
                                            {ukuran}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-6 flex items-center gap-3">
                                <div className="flex h-12 items-center rounded-lg border border-gray-200">
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
                                    className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-gray-950 px-5 text-sm font-black text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                                >
                                    <i className="fas fa-cart-shopping"></i>
                                    Tambah ke Keranjang
                                </button>
                            </div>

                            <div className="mt-6 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                                <div className="rounded-lg bg-gray-50 p-4">
                                    <i className="fas fa-truck-fast mb-2 text-gray-950"></i>
                                    <p className="font-bold">Pengiriman Cepat</p>
                                </div>
                                <div className="rounded-lg bg-gray-50 p-4">
                                    <i className="fas fa-shield-halved mb-2 text-gray-950"></i>
                                    <p className="font-bold">Checkout Aman</p>
                                </div>
                                <div className="rounded-lg bg-gray-50 p-4">
                                    <i className="fas fa-ruler-combined mb-2 text-gray-950"></i>
                                    <p className="font-bold">Ukuran Lengkap</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {produkTerkait.length > 0 && (
                        <section className="mt-14">
                            <h2 className="mb-5 text-2xl font-black">Produk Terkait</h2>
                            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
                                {produkTerkait.map((item) => (
                                    <Link key={item.id} href={`/produk/${item.slug}`} className="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                                        <img src={getProductImage(item)} alt={item.nama_produk} className="aspect-[4/5] w-full object-cover transition group-hover:scale-105" />
                                        <div className="p-3">
                                            <p className="truncate text-sm font-bold">{item.nama_produk}</p>
                                            <p className="mt-1 text-sm font-black">{formatRupiah(item.harga)}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
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
