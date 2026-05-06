import { Head, Link, usePage } from '@inertiajs/react'
import React from 'react'

export default function Profil() {
    const { auth, flash } = usePage().props
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
                        {auth?.user ? (
                            <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-2 py-2 sm:px-3">
                                {auth.user.avatar && <img src={auth.user.avatar} alt={auth.user.name} className="h-6 w-6 rounded-full" />}
                                <span className="hidden max-w-32 truncate text-sm font-semibold sm:inline">{auth.user.name}</span>
                            </div>
                        ) : (
                            <Link href="/loginuser" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-bold hover:bg-gray-100">Login</Link>
                        )}
                    </div>
                </header>

                <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mb-5 text-sm text-gray-500">
                        <Link href="/" className="font-semibold text-gray-950 hover:underline">Profil</Link>

                    </div>

                    <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">

                    </section>


                </main>
            </div>
        </>
    )
}
