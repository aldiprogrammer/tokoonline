import AdminLayout from '@/Layouts/AdminLayout'
import React from 'react'

export default function Tambahproduk() {
    return (
        <>
            <AdminLayout>
                <div className="bg-base-100/70 backdrop-blur rounded-2xl shadow-lg p-6" >
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Tambah Produk</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <div className='grid grid-cols-2 gap-3'>
                            <div className="bg-base-100/70 backdrop-blur rounded-2xl  p-6" >
                                emerald
                            </div>

                            <div className="bg-base-100/70 backdrop-blur rounded-2xl p-6" >
                                emerald
                            </div>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        </>
    )
}
