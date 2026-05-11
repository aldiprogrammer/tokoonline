import { Head, Link, useForm } from '@inertiajs/react'
import React from 'react'

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    })

    const submit = (e) => {
        e.preventDefault()
        post(route('password.email'))
    }

    return (
        <>
            <Head title="Lupa Password" />

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
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">Lupa Password</p>
                            <h1 className="mt-2 text-3xl font-black">Atur ulang password</h1>
                            <p className="mt-2 text-sm leading-6 text-gray-600">
                                Masukkan email kamu dan kami akan mengirimkan link untuk membuat password baru.
                            </p>
                        </div>

                        {status && (
                            <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm font-medium text-green-700">
                                <i className="fas fa-check-circle mr-2"></i>
                                {status}
                            </div>
                        )}

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

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full rounded-lg bg-gray-950 px-4 py-3 text-sm font-bold text-white hover:bg-gray-800 disabled:opacity-50"
                            >
                                {processing ? 'Mengirim...' : 'Kirim Link Reset'}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Ingat password?{' '}
                                <Link href={route('login.user')} className="font-bold text-gray-950 underline hover:text-gray-800">
                                    Masuk di sini
                                </Link>
                            </p>
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