import { Head, Link, useForm } from '@inertiajs/react'
import React from 'react'

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({})

    const submit = (e) => {
        e.preventDefault()
        post(route('verification.send'))
    }

    return (
        <>
            <Head title="Verifikasi Email" />

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
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">Verifikasi Email</p>
                            <h1 className="mt-2 text-3xl font-black">Cek email kamu</h1>
                            <p className="mt-2 text-sm leading-6 text-gray-600">
                                Kami sudah mengirimkan link verifikasi ke email kamu. Klik link tersebut
                                untuk mengaktifkan akun dan mulai belanja.
                            </p>
                        </div>

                        {status === 'verification-link-sent' && (
                            <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm font-medium text-green-700">
                                <i className="fas fa-check-circle mr-2"></i>
                                Link verifikasi baru telah dikirim ke email kamu.
                            </div>
                        )}

                        <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                            <div className="flex gap-3">
                                <i className="fas fa-envelope mt-1 text-gray-950"></i>
                                <p>
                                    Tidak menerima email? Cek folder spam atau klik tombol di bawah
                                    untuk mengirim ulang.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={submit} className="mt-6 space-y-3">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full rounded-lg bg-[#D4AF37] px-4 py-3 text-sm font-bold text-white hover:bg-[#C5A032] disabled:opacity-50"
                            >
                                {processing ? 'Mengirim...' : 'Kirim Ulang Email Verifikasi'}
                            </button>

                            <Link
                                href={route('logout.user')}
                                method="post"
                                as="button"
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-bold text-gray-800 hover:bg-gray-50"
                            >
                                Keluar
                            </Link>
                        </form>

                        <Link href="/" className="mt-6 inline-flex text-sm font-bold text-gray-950 hover:underline">
                            Kembali ke toko
                        </Link>
                    </div>
                </div>
            </div>
        </>
    )
}