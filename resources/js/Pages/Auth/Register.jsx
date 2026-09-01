import { Head, Link, useForm } from '@inertiajs/react'
import React from 'react'

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    })

    const submit = (e) => {
        e.preventDefault()
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        })
    }

    return (
        <>
            <Head title="Daftar Akun" />

            <div className="min-h-screen bg-gray-100 px-4 py-8 text-gray-950">
                <div className="mx-auto grid min-h-[calc(100vh-64px)] max-w-6xl items-center gap-8 lg:grid-cols-2">
                    <div className="hidden overflow-hidden rounded-2xl bg-[#D4AF37] shadow-2xl lg:block">
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
                            FABRICO
                        </Link>

                        <div className="mb-6">
                            {/* <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">Daftar Akun</p> */}
                            <h1 className="mt-2 text-3xl font-black">Buat akun baru</h1>
                            <p className="mt-2 text-sm leading-6 text-gray-600">
                                Isi data di bawah ini agar anda dapat login
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-semibold text-gray-700">Nama Lengkap</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-gray-950 focus:outline-none focus:ring-1 focus:ring-gray-950"
                                    placeholder="Masukkan nama lengkap"
                                    required
                                />
                                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                            </div>

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
                                    placeholder="Minimal 8 karakter"
                                    required
                                />
                                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold text-gray-700">Konfirmasi Password</label>
                                <input
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-gray-950 focus:outline-none focus:ring-1 focus:ring-gray-950"
                                    placeholder="Ulangi password"
                                    required
                                />
                                {errors.password_confirmation && <p className="mt-1 text-xs text-red-500">{errors.password_confirmation}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full rounded-lg bg-[#D4AF37] px-4 py-3 text-sm font-bold text-white hover:bg-[#C5A032] disabled:opacity-50"
                            >
                                {processing ? 'Memproses...' : 'Daftar'}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Sudah punya akun?{' '}
                                <Link href={route('login.user')} className="font-bold text-gray-950 underline hover:text-gray-800">
                                    Masuk di sini
                                </Link>
                            </p>
                        </div>

                        <Link href="/" className="mt-6 inline-flex text-sm font-bold text-gray-950 hover:underline">
                            Kembali ke halaman utama
                        </Link>
                    </div>
                </div>
            </div>
        </>
    )
}