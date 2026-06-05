import AdminLayout from '@/Layouts/AdminLayout'
import { useForm } from '@inertiajs/react'
import React, { useState, useMemo } from 'react'
import Swal from 'sweetalert2'

export default function Pengguna({ role, pengguna }) {
    const { data, setData, post, put, delete: destroy, reset, processing } = useForm({
        id: 0,
        role: '',
        id_role: '',
        username: '',
        password: '',
    });

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return pengguna.filter((item) =>
            item.username.toLowerCase().includes(q) ||
            item.role.role.toLowerCase().includes(q)
        );
    }, [pengguna, search]);

    const totalPages = Math.ceil(filtered.length / perPage);
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paginated = filtered.slice(start, end);

    const pageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    }

    const handleEdit = (id) => {
        const list = pengguna.find((item) => item.id == id);
        setData({
            id: id,
            role: list.id_role,
            namarole: list.role.role,
            username: list.username,
        })
        document.getElementById('modal_edit').showModal();
    }

    const simpan = (e) => {
        e.preventDefault();
        post('/admin/pengguna', {
            onSuccess: () => {
                console.log('berhasil');
                reset();
                document.getElementById("modal_kategori").close()
            }
        })
    }

    const edit = (e) => {
        e.preventDefault();
        put('/admin/pengguna/' + data.id, {
            onSuccess: () => {
                reset();
                document.getElementById("modal_edit").close()
            }
        })
    }

    const hapus = (id) => {
        Swal.fire({
            title: 'Hapus pengguna?',
            text: 'Data pengguna akan dihapus permanen.',
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
                destroy('/admin/pengguna/' + id);
            }
        });
    }


    return (
        <>
            <AdminLayout>
                <div className="bg-base-100/70 backdrop-blur rounded-2xl shadow-lg p-6" >
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Data Pengguna</h2>
                        <button className="btn btn-primary" onClick={() => { reset(); document.getElementById("modal_kategori").showModal(); }}>+ Tambah data</button>
                        {/* MODAL */}
                        <dialog id="modal_kategori" className="modal">
                            <div className="modal-box">

                                <h3 className="font-bold text-lg mb-4">
                                    Tambah Pengguna
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
                                        placeholder="Username"
                                        className="input input-bordered w-full"
                                        value={data.username}
                                        onChange={(e) => setData('username', e.target.value)}
                                        required />


                                    <select className='input input-bordered w-full' onChange={(e) => setData('role', e.target.value)} required>
                                        <option value="">Pilih Role</option>
                                        {role.map((item, index) => (
                                            <option value={item.id}>{item.role}</option>
                                        ))}
                                    </select>

                                    <input type="password"
                                        placeholder="New Password"
                                        className="input input-bordered w-full"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
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
                                        placeholder="Username"
                                        className="input input-bordered w-full"
                                        value={data.username}
                                        onChange={(e) => setData('username', e.target.value)}
                                        required />


                                    <select className='input input-bordered w-full' value={data.role} onChange={(e) => setData('role', e.target.value)} required>
                                        <option value={data.role}>{data.namarole}</option>
                                        {role.map((item, index) => (
                                            <option value={item.id}>{item.role}</option>
                                        ))}
                                    </select>

                                    <input type="password"
                                        placeholder="Password"
                                        className="input input-bordered w-full"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                    />


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

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                            <span>Tampilkan</span>
                            <select
                                className="select select-bordered select-sm w-20 text-xs"
                                value={perPage}
                                onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <span>data</span>
                        </div>
                        <div className="join">
                            <span className="join-item bg-base-200 border border-base-300 border-r-0 px-3 flex items-center text-base-content/50">
                                <i className="fas fa-search text-xs"></i>
                            </span>
                            <input
                                type="text"
                                className="join-item input input-bordered input-sm w-56"
                                placeholder="Cari pengguna..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Username</th>
                                    <th>Role</th>
                                    <th>Opsi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.length > 0 ? (paginated.map((item, index) => (
                                    <tr className="hover" key={item.id}>
                                        <td className="font-medium">{start + index + 1}</td>
                                        <td>{item.username}</td>
                                        <td>{item.role.role}</td>
                                        <td>
                                            <div className="flex gap-2">
                                                <button className="btn btn-error btn-sm" onClick={() => hapus(item.id)}>Hapus</button>
                                                <button className="btn btn-success btn-sm" onClick={() => handleEdit(item.id)}>Edit</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))) : (
                                    <tr>
                                        <td colSpan={4} className="text-center py-8 text-base-content/50">
                                            <i className="fas fa-inbox text-3xl block mb-2"></i>
                                            Tidak ada data ditemukan
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4 text-sm">
                        <div className="text-base-content/60">
                            Menampilkan {filtered.length > 0 ? start + 1 : 0} - {Math.min(end, filtered.length)} dari {filtered.length} data
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                className="btn btn-sm btn-ghost"
                                disabled={page <= 1}
                                onClick={() => setPage(page - 1)}
                            >
                                <i className="fas fa-chevron-left"></i>
                            </button>
                            {pageNumbers().map((p) => (
                                <button
                                    key={p}
                                    className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-ghost'}`}
                                    onClick={() => setPage(p)}
                                >
                                    {p}
                                </button>
                            ))}
                            <button
                                className="btn btn-sm btn-ghost"
                                disabled={page >= totalPages}
                                onClick={() => setPage(page + 1)}
                            >
                                <i className="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </AdminLayout >
        </>
    )
}
