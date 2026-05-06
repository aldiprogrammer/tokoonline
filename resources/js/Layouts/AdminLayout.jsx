import { Link, router, usePage } from '@inertiajs/react'
import React, { useEffect, useState } from 'react'
import Swal from 'sweetalert2'

export default function AdminLayout({ children }) {
    const [theme, setTheme] = useState("light")
    const { flash, pengguna } = usePage().props

    useEffect(() => {
        if (flash?.success) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: flash.success,
                showConfirmButton: false,
                timer: 2200,
                timerProgressBar: true,
            });
        }

        if (flash?.error) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: flash.error,
                showConfirmButton: false,
                timer: 2600,
                timerProgressBar: true,
            });
        }
    }, [flash?.success, flash?.error]);

    const logout = () => {
        router.post('/logout');
    }

    return (
        <div data-theme={theme} className="flex min-h-screen bg-gradient-to-br from-base-200 to-base-300">

            {/* SIDEBAR */}
            <div className="w-72 bg-base-100/70 backdrop-blur-xl border-r border-base-300 shadow-lg">
                <div className="p-6 text-2xl font-bold tracking-wide">
                    🛍️ MyStore
                </div>

                <ul className="menu px-4 gap-2 text-base">
                    <li><Link href={'/admin/dashboard'} className="active bg-primary text-white rounded-lg">🏠 Dashboard</Link></li>
                    <li><Link href={'/admin/order'} className="hover:bg-base-200 rounded-lg"><i className='fas fa-calendar-days'></i>Order hari ini</Link></li>
                    <li><Link href={'/admin/order'} className="hover:bg-base-200 rounded-lg"><i className='fas fa-bag-shopping'></i>Data order</Link></li>

                    <li><Link href={'/admin/produk'} className="hover:bg-base-200 rounded-lg"><i className='fas fa-shirt'></i>Produk</Link></li>
                    <li><Link href={'/admin/customer'} className="hover:bg-base-200 rounded-lg"><i className='fas fa-users'></i>Customer</Link></li>
                    <li><Link href={'/admin/laporan'} className="hover:bg-base-200 rounded-lg"><i className='fas fa-book'></i> Laporan</Link></li>
                    <li><Link href={'/admin/kategori'} className="hover:bg-base-200 rounded-lg"><i className='fas fa-list'></i> Kategori</Link></li>
                    <li><Link href={'/admin/role'} className="hover:bg-base-200 rounded-lg"><i className='fas fa-equals'></i> Role</Link></li>
                    <li><Link href={'/admin/pengguna'} className="hover:bg-base-200 rounded-lg"><i className='fas fa-user-circle'></i> Pengguna</Link></li>
                </ul>
            </div>

            {/* MAIN */}
            <div className="flex-1">

                {/* NAVBAR */}
                <div className="flex justify-between items-center px-8 py-4 bg-base-100/60 backdrop-blur border-b border-base-300">
                    <h1 className="text-xl font-semibold">Dashboard</h1>

                    <div className="flex items-center gap-4">
                        <button
                            className="btn btn-sm btn-outline"
                            onClick={() =>
                                setTheme(theme === "dark" ? "light" : "dark")
                            }
                        >
                            🌗 Mode
                        </button>

                        {/* <div className="text-right">
                            <p className="text-sm font-semibold leading-tight">{pengguna?.username}</p>
                            <p className="text-xs text-base-content/60 leading-tight">{pengguna?.role}</p>
                        </div> */}

                        <div className="avatar placeholder">
                            <div className="bg-primary text-white rounded-full w-10">
                                <span>{pengguna?.username?.charAt(0)?.toUpperCase()}</span>
                            </div>
                        </div>

                        <button type="button" className="btn btn-sm btn-error text-white" onClick={logout}>
                            <i className="fas fa-right-from-bracket"></i>
                            Logout
                        </button>
                    </div>
                </div>

                {/* CONTENT */}
                <div className="p-8 space-y-8">

                    {children}

                </div>
            </div>
        </div>
    )
}
