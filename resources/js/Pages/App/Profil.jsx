import { Head, Link, usePage } from '@inertiajs/react'
import axios from 'axios'
import React, { useEffect, useState } from 'react'

export default function Profil() {
    const { auth, flash } = usePage().props
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [keranjang, setKeranjang] = useState([]);

    const listkeranjang = async () => {
        try {
            const response = await axios.get('/keranjang/' + auth.user.id);
            console.log(response.data);
            setKeranjang(response.data);

        } catch (error) {

        }

    }
    useEffect(() => {
        listkeranjang()
    }, [])
    return (
        <>
            <Head title='Profil' />

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
                                    0
                                </span>
                            </button>
                            {auth?.user ? (
                                <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-2 py-2 sm:px-3">
                                    {auth.user.avatar && <img src={auth.user.avatar} alt={auth.user.name} className="h-6 w-6 rounded-full" />}
                                    <span className="hidden max-w-32 truncate text-sm font-semibold sm:inline">{auth.user.name}</span>
                                </div>
                            ) : (
                                <Link href="/loginuser" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-bold hover:bg-gray-100">Login</Link>
                            )}



                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mb-5 text-sm text-gray-500">
                        <Link href="/" className="font-semibold text-gray-950 hover:underline">Profil</Link>

                    </div>

                    <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">

                        {keranjang.map((item, index) => (
                            <>{item.produk?.gambar?.[0]?.image} </>
                        ))}

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
                                    <p className="text-sm text-gray-500">5 item dipilih</p>
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
                                {keranjang !== null ? (
                                    <div className="space-y-4">
                                        {keranjang.map((item, index) => (
                                            <div key={item.id} className="flex gap-3 rounded-lg border border-gray-200 p-3">
                                                <img src={`/storage/${item.produk?.gambar?.[0]?.image}`} alt={item.nama_produk} className="h-20 w-20 rounded-lg object-cover" />
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="truncate text-sm font-bold">{item.produk.nama_produk}</h3>
                                                    <p className="text-xs text-gray-500">Ukuran {item.ukuran}</p>
                                                    <p className="mt-1 text-sm font-black">{item.harga * item.qty}</p>

                                                    <div className="mt-2 flex items-center justify-between gap-2">
                                                        <div className="flex items-center rounded-lg border border-gray-200">
                                                            <button
                                                                type="button"
                                                                // onClick={() => decreaseQty(item.id)}
                                                                className="grid h-8 w-8 place-items-center hover:bg-gray-100"
                                                            >
                                                                <i className="fas fa-minus text-xs"></i>
                                                            </button>
                                                            <span className="grid h-8 min-w-8 place-items-center text-sm font-bold">{item.qty}</span>
                                                            <button
                                                                type="button"
                                                                // onClick={() => increaseQty(item.id)}
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
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-gray-600">Total</span>
                                    <span className="text-xl font-black">Rp 00000</span>
                                </div>
                            </div>
                        </aside>
                    </div>
                )}
            </div>
        </>
    )
}
