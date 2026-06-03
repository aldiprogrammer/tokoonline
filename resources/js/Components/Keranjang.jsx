import React, { useState } from 'react'

export default function Keranjang() {
    const [isCartOpen, setIsCartOpen] = useState(false)
    return (
        <>
            <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative grid h-10 w-10 place-items-center rounded-lg bg-[#D4AF37] text-white hover:bg-[#C5A032]"
            >
                <i className="fas fa-bag-shopping"></i>
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-xs">
                    0
                </span>
            </button>

            {isCartOpen && (
                <div className="inset-0 z-50">
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
                            {/* {cart.length > 0 ? (
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
                                )} */}
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
        </>
    )
}
