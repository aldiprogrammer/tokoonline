import React, { useState } from 'react'

export default function AdminLayout({ children }) {
    const [theme, setTheme] = useState("light")
    return (
        <div data-theme={theme} className="flex min-h-screen bg-gradient-to-br from-base-200 to-base-300">

            {/* SIDEBAR */}
            <div className="w-72 bg-base-100/70 backdrop-blur-xl border-r border-base-300 shadow-lg">
                <div className="p-6 text-2xl font-bold tracking-wide">
                    🛍️ MyStore
                </div>

                <ul className="menu px-4 gap-2 text-base">
                    <li><a className="active bg-primary text-white rounded-lg">🏠 Dashboard</a></li>
                    <li><a className="hover:bg-base-200 rounded-lg">👕 Produk</a></li>
                    <li><a className="hover:bg-base-200 rounded-lg">📦 Pesanan</a></li>
                    <li><a className="hover:bg-base-200 rounded-lg">👥 Customer</a></li>
                    <li><a className="hover:bg-base-200 rounded-lg">📊 Laporan</a></li>
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

                        <div className="avatar placeholder">
                            <div className="bg-primary text-white rounded-full w-10">
                                <span>A</span>
                            </div>
                        </div>
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
