import { Head, Link, router, usePage } from '@inertiajs/react'
import React, { useEffect, useState } from 'react'
import Swal from 'sweetalert2'

export default function AdminLayout({ children }) {
    const [theme, setTheme] = useState("light")
    const { flash, pengguna } = usePage().props

    const menus = [
        { key: 'dashboard', href: '/admin/dashboard', icon: 'fa-solid fa-gauge', label: 'Dashboard', active: true },
        { key: 'order-hari-ini', href: '/admin/order-hari-ini', icon: 'fas fa-calendar-day', label: 'Order hari ini' },
        { key: 'order', href: '/admin/order', icon: 'fas fa-bag-shopping', label: 'Data order' },
        { key: 'produk', href: '/admin/produk', icon: 'fas fa-shirt', label: 'Produk' },
        { key: 'customer', href: '/admin/customer', icon: 'fas fa-users', label: 'Customer' },
        { key: 'laporan', href: '/admin/laporan', icon: 'fas fa-book', label: 'Laporan' },
        { key: 'kategori', href: '/admin/kategori', icon: 'fas fa-list', label: 'Kategori' },
        { key: 'ratio', href: '/admin/ratio', icon: 'fas fa-divide', label: 'Ratio' },
        { key: 'role', href: '/admin/role', icon: 'fas fa-equals', label: 'Role' },
        { key: 'pengguna', href: '/admin/pengguna', icon: 'fas fa-user-circle', label: 'Pengguna' },
    ]

    const hakAkses = pengguna?.hak_akses || []
    const visibleMenus = hakAkses.length > 0
        ? menus.filter((m) => hakAkses.includes(m.key))
        : menus

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
        <>
            <Head title='Admin'></Head>
            <style>{`
                .btn-primary {
                    background-color: #D4AF37 !important;
                    border-color: #D4AF37 !important;
                    color: #fff !important;
                }
                .btn-primary:hover {
                    background-color: #C5A032 !important;
                    border-color: #C5A032 !important;
                }
            `}</style>

            <div data-theme={theme} className="flex min-h-screen bg-gradient-to-br from-base-200 to-base-300">

                {/* SIDEBAR */}
                <div className="w-72 bg-base-100/70 backdrop-blur-xl border-r border-base-300 shadow-lg">
                    <div className="p-6 text-2xl font-bold tracking-wide">
                        <i class="fa-solid fa-bag-shopping text-blue"></i> Admin Fabrico
                    </div>

                    <ul className="menu px-4 gap-2 text-base">
                        {visibleMenus.map((menu) => (
                            <li key={menu.key}>
                                <Link
                                    href={menu.href}
                                    className={menu.active ? "active bg-primary text-white rounded-lg" : "hover:bg-base-200 rounded-lg"}
                                >
                                    <i className={menu.icon}></i> {menu.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* MAIN */}
                <div className="flex-1">

                    {/* NAVBAR */}
                    <div className="flex justify-between items-center px-8 py-4 bg-base-100/60 backdrop-blur border-b border-base-300">
                        <h1 className="text-xl font-semibold"></h1>

                        <div className="flex items-center gap-4">
                            <button
                                className="btn btn-sm btn-outline"
                                onClick={() =>
                                    setTheme(theme === "dark" ? "light" : "dark")
                                }
                            >

                                {theme == 'dark' ? <><i class="fa-solid fa-moon"></i> Dark</> : <><i class="fa-solid fa-sun"></i>Light</>}

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
        </>
    )
}
