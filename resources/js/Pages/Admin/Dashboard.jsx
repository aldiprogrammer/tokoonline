import AdminLayout from "@/Layouts/AdminLayout"
import { useState } from "react"

export default function Dashboard() {


    return (

        <>
            <AdminLayout>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6" >

                    <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-xl">
                        <p className="opacity-80">Total Produk</p>
                        <h2 className="text-3xl font-bold mt-2">120</h2>
                    </div>

                    <div className="p-6 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xl">
                        <p className="opacity-80">Pesanan</p>
                        <h2 className="text-3xl font-bold mt-2">89</h2>
                    </div>

                    <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-xl">
                        <p className="opacity-80">Pendapatan</p>
                        <h2 className="text-3xl font-bold mt-2">Rp 12jt</h2>
                    </div>

                </div >

                <div className="bg-base-100/70 backdrop-blur rounded-2xl shadow-lg p-6" >
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Produk Terbaru</h2>
                        <button className="btn btn-primary btn-sm">+ Tambah</button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Produk</th>
                                    <th>Harga</th>
                                    <th>Stok</th>
                                    <th></th>
                                </tr>
                            </thead>

                            <tbody>
                                <tr className="hover">
                                    <td className="font-medium">Kaos Polos</td>
                                    <td>Rp 50.000</td>
                                    <td><span className="badge badge-success">100</span></td>
                                    <td><button className="btn btn-sm">Edit</button></td>
                                </tr>

                                <tr className="hover">
                                    <td className="font-medium">Hoodie</td>
                                    <td>Rp 120.000</td>
                                    <td><span className="badge badge-warning">50</span></td>
                                    <td><button className="btn btn-sm">Edit</button></td>
                                </tr>

                                <tr className="hover">
                                    <td className="font-medium">Kemeja</td>
                                    <td>Rp 90.000</td>
                                    <td><span className="badge badge-info">70</span></td>
                                    <td><button className="btn btn-sm">Edit</button></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </AdminLayout>

        </>

    )
}