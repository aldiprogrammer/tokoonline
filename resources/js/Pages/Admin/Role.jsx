import AdminLayout from '@/Layouts/AdminLayout'
import { router, useForm } from '@inertiajs/react'
import React from 'react'

export default function Role({ role }) {
    const { data, setData, post, put, delete: destroy, reset, processing } = useForm({
        id: 0,
        role: '',
    });

    const handleEdit = (id) => {
        const list = role.find((item) => item.id == id);
        setData('id', id);
        setData('role', list.role);
        document.getElementById('modal_edit').showModal();
    }

    const simpan = (e) => {
        e.preventDefault();
        post('/admin/role', {
            onSuccess: () => {
                console.log('berhasil');
                reset();
                document.getElementById("modal_kategori").close()
            }
        })
    }

    const edit = (e) => {
        e.preventDefault();
        put('/admin/role/' + data.id, {
            onSuccess: () => {
                reset();
                document.getElementById("modal_edit").close()
            }
        })
    }

    const hapus = (id) => {
        if (confirm("Yakin ingin menghapus")) {
            destroy("/admin/role/" + id);
        }
    }


    return (
        <>
            <AdminLayout>
                <div className="bg-base-100/70 backdrop-blur rounded-2xl shadow-lg p-6" >
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Data Role</h2>
                        <button className="btn btn-primary" onClick={() => document.getElementById("modal_kategori").showModal(reset())}>+ Tambah data</button>
                        {/* MODAL */}
                        <dialog id="modal_kategori" className="modal">
                            <div className="modal-box">

                                <h3 className="font-bold text-lg mb-4">
                                    Tambah Role
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
                                        placeholder="Nama Role"
                                        className="input input-bordered w-full"
                                        value={data.role}
                                        onChange={(e) => setData('role', e.target.value)}
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
                                    Edit Role
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
                                        placeholder="Nama Role"
                                        className="input input-bordered w-full"
                                        value={data.role}
                                        onChange={(e) => setData('role', e.target.value)}
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
                                    <th>Role</th>
                                    <th>Opsi</th>
                                </tr>
                            </thead>

                            <tbody>
                                {role.map((item, index) => (
                                    <tr className="hover">
                                        <td className="font-medium">{index + 1}</td>
                                        <td>{item.role}</td>
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
