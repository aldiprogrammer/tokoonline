import { Head, Link, usePage } from '@inertiajs/react'
import React, { useEffect } from 'react'
import Swal from 'sweetalert2'

export default function Loginuser() {
    const { flash } = usePage().props

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

    return (
        <>
            <Head title="Login Customer" />

            <div className="min-h-screen bg-gray-100 px-4 py-8 text-gray-950">
                <div className="mx-auto grid min-h-[calc(100vh-64px)] max-w-6xl items-center gap-8 lg:grid-cols-2">
                    <div className="hidden overflow-hidden rounded-2xl bg-gray-950 shadow-2xl lg:block">
                        <img
                            src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1200&q=80"
                            alt="Fashion store"
                            className="h-[620px] w-full object-cover opacity-80"
                        />
                    </div>

                    <div className="mx-auto w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl sm:p-8">
                        <Link href="/" className="mb-8 flex items-center gap-2 text-lg font-black">
                            <span className="grid h-10 w-10 place-items-center rounded-lg bg-gray-950 text-white">
                                <i className="fas fa-shirt"></i>
                            </span>
                            FEBRINOX
                        </Link>

                        <div className="mb-6">
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">Customer Login</p>
                            <h1 className="mt-2 text-3xl font-black">Masuk untuk belanja</h1>
                            <p className="mt-2 text-sm leading-6 text-gray-600">
                                Login dulu supaya kamu bisa menambahkan produk ke keranjang dan lanjut checkout.
                            </p>
                        </div>

                        <a
                            href="/auth/google"
                            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-800 shadow-sm hover:bg-gray-50"
                        >
                            <i className="fa-brands fa-google text-lg text-red-500"></i>
                            Continue with Google
                        </a>

                        <div className="my-6 flex items-center gap-3">
                            <div className="h-px flex-1 bg-gray-200"></div>
                            <span className="text-xs font-semibold text-gray-400">AMAN DAN CEPAT</span>
                            <div className="h-px flex-1 bg-gray-200"></div>
                        </div>

                        <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                            <div className="flex gap-3">
                                <i className="fas fa-lock mt-1 text-gray-950"></i>
                                <p>
                                    Data akun Google digunakan hanya untuk login customer di toko ini.
                                </p>
                            </div>
                        </div>

                        <Link href="/" className="mt-6 inline-flex text-sm font-bold text-gray-950 hover:underline">
                            Kembali ke toko
                        </Link>
                    </div>
                </div>
            </div>
        </>
    )
}
