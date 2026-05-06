import AdminLayout from '@/Layouts/AdminLayout'
import { useForm } from '@inertiajs/react'
import React from 'react'
import Swal from 'sweetalert2'

export default function Kategori({ kategori }) {
    const { data, setData, post, put, delete: destroy, reset, processing } = useForm({
        id: 0,
        kategori: '',
    });

    const handleEdit = (id) => {
        const list = kategori.find((item) => item.id == id);
        setData('id', id);
        setData('kategori', list.kategori);
        document.getElementById('modal_edit').showModal();
    }

    const simpan = (e) => {
        e.preventDefault();
        post('/admin/kategori', {
            onSuccess: () => {
                console.log('berhasil');
                reset();
                document.getElementById("modal_kategori").close()
            }
        })
    }

    const edit = (e) => {
        e.preventDefault();
        put('/admin/kategori/' + data.id, {
            onSuccess: () => {
                reset();
                document.getElementById("modal_edit").close()
            }
        })
    }

    const hapus = (id) => {
        Swal.fire({
            title: 'Hapus kategori?',
            text: 'Data kategori akan dihapus permanen.',
            icon: 'warning',
            showCancelButton: true,
            buttonsStyling: false,
            customClass: {
                actions: 'gap-3',
                confirmButton: 'px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400',
                cancelButton: 'px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300',
            },
            confirmButtonText: 'Ya, hapus',
            cancelButtonText: 'Batal',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                destroy('/admin/kategori/' + id);
            }
        });
    }


    return (
        <>
            <AdminLayout>
                <div className="bg-base-100/70 backdrop-blur rounded-2xl shadow-lg p-6" >
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Data Kategori</h2>
                        <button className="btn btn-primary" onClick={() => document.getElementById("modal_kategori").showModal(reset())}>+ Tambah data</button>
                        {/* MODAL */}
                        <dialog id="modal_kategori" className="modal">
                            <div className="modal-box">

                                <h3 className="font-bold text-lg mb-4">
                                    Tambah Kategori
                                </h3>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                                    onClick={() => document.getElementById("modal_kategori").close()}
                                >
                                    ✕
                                </button>

                                <form onSubmit={simpan} className="space-y-4">

                                    <input type="text"
                                        placeholder="Nama kategori"
                                        className="input input-bordered w-full"
                                        value={data.kategori}
                                        onChange={(e) => setData('kategori', e.target.value)}
                                        required />


                                    {/* Tombol */}
                                    <div className="modal-action">
                                        <button type="submit" className="btn btn-primary" disabled={processing}>
                                            <i className='fas fa-file'></i> Simpan
                                        </button>


                                        <button className="btn" onClick={() => document.getElementById("modal_kategori").close()}>Batal</button>

                                    </div>

                                </form>
                            </div>
                        </dialog>


                        <dialog id="modal_edit" className="modal">
                            <div className="modal-box">

                                <h3 className="font-bold text-lg mb-4">
                                    Edit Kategori
                                </h3>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                                    onClick={() => document.getElementById("modal_edit").close()}
                                >
                                    ✕
                                </button>

                                <form onSubmit={edit} className="space-y-4">

                                    <input type="text"
                                        placeholder="Nama kategori"
                                        className="input input-bordered w-full"
                                        value={data.kategori}
                                        onChange={(e) => setData('kategori', e.target.value)}
                                        required />


                                    {/* Tombol */}
                                    <div className="modal-action">
                                        <button type="submit" className="btn btn-primary" disabled={processing}>
                                            <i className='fas fa-file'></i> Edit
                                        </button>


                                        <button className="btn" onClick={() => document.getElementById("modal_edit").close()}>Batal</button>

                                    </div>

                                </form>
                            </div>
                        </dialog>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Katori</th>
                                    <th>Opsi</th>
                                </tr>
                            </thead>

                            <tbody>
                                {kategori.map((item, index) => (
                                    <tr className="hover">
                                        <td className="font-medium">{index + 1}</td>
                                        <td>{item.kategori}</td>
                                        <td>
                                            <div className="flex gap-2">
                                                <button
                                                    className="btn btn-error btn-sm"
                                                    onClick={() =>
                                                        hapus(item.id)
                                                    }
                                                >
                                                    Hapus
                                                </button>
                                                <button
                                                    className="btn btn-success btn-sm"
                                                    onClick={() => handleEdit(item.id)
                                                    }
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        </td>

                                    </tr>
                                ))}

                            </tbody>
                        </table>
                    </div>
                </div>
            </AdminLayout >
        </>
    )
}
