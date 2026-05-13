import { Head, Link, usePage, useForm } from '@inertiajs/react'
import React, { useEffect } from 'react'
import Swal from 'sweetalert2'

export default function Loginuser() {
    const { flash } = usePage().props
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    })

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

    const submit = (e) => {
        e.preventDefault()
        post(route('loginuser.store'), {
            onFinish: () => reset('password'),
        })
    }

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
                            {/* <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">Customer Login</p> */}
                            <h1 className="mt-2 text-3xl font-black">Login untuk belanja</h1>
                            <p className="mt-2 text-sm leading-6 text-gray-600">
                                Silahkan login menggunakan email dan password anda atau dengan akun google anda
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-semibold text-gray-700">Email</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-gray-950 focus:outline-none focus:ring-1 focus:ring-gray-950"
                                    placeholder="Masukkan email"
                                    required
                                />
                                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold text-gray-700">Password</label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-gray-950 focus:outline-none focus:ring-1 focus:ring-gray-950"
                                    placeholder="Masukkan password"
                                    required
                                />
                                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 text-sm text-gray-600">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-gray-950 focus:ring-gray-950"
                                    />
                                    Ingat saya
                                </label>
                                <Link
                                    href={route('password.request')}
                                    className="text-sm text-gray-600 underline hover:text-gray-900"
                                >
                                    Lupa password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full rounded-lg bg-gray-950 px-4 py-3 text-sm font-bold text-white hover:bg-gray-800 disabled:opacity-50"
                            >
                                {processing ? 'Memproses...' : 'Masuk'}
                            </button>
                        </form>

                        <div className="my-6 text-center">
                            <p className="text-sm text-gray-600">
                                Belum punya akun?{' '}
                                <Link href={route('register')} className="font-bold text-gray-950 underline hover:text-gray-800">
                                    Daftar di sini
                                </Link>
                            </p>
                        </div>

                        <div className="my-6 flex items-center gap-3">
                            <div className="h-px flex-1 bg-gray-200"></div>
                            <span className="text-xs font-semibold text-gray-400">ATAU</span>
                            <div className="h-px flex-1 bg-gray-200"></div>
                        </div>

                        <a
                            href="/auth/google"
                            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-800 shadow-sm hover:bg-gray-50"
                        >
                            <i className="fa-brands fa-google text-lg text-red-500"></i>
                            Continue with Google
                        </a>

                        <Link href="/" className="mt-6 inline-flex text-sm font-bold text-gray-950 hover:underline">
                            Kembali ke halaman utama
                        </Link>
                    </div>
                </div>
            </div>
        </>
    )
}
