import AdminLayout from '@/Layouts/AdminLayout'
import { Link, useForm } from '@inertiajs/react'
import React from 'react'
import Swal from 'sweetalert2'

export default function Produk({ produk, kategori }) {
    const { data, setData, post, delete: destroy, reset, processing } = useForm({
        _method: 'put',
        id: 0,
        nama: '',
        kategori_id: '',
        ukuran: '',
        harga: '',
        diskon: '',
        stok: '',
        images: [],
    })

    const handleEdit = (id) => {
        const item = produk.find((produkItem) => produkItem.id == id);

        setData({
            _method: 'put',
            id: item.id,
            nama: item.nama_produk,
            kategori_id: item.id_kategori,
            ukuran: item.ukuran,
            harga: item.harga,
            diskon: item.diskon,
            stok: item.stok,
            images: [],
        });

        document.getElementById('modal_edit_produk').showModal();
    }

    const edit = (e) => {
        e.preventDefault();

        post('/admin/produk/' + data.id, {
            forceFormData: true,
            onSuccess: () => {
                reset();
                document.getElementById('modal_edit_produk').close();
            },
        })
    }

    const hapus = (id) => {
        Swal.fire({
            title: 'Hapus produk?',
            text: 'Data produk dan gambarnya akan dihapus permanen.',
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
                destroy('/admin/produk/' + id);
            }
        });
    }

    const selectedProduct = produk.find((item) => item.id == data.id);

    return (
        <>
            <AdminLayout>
                <div className="bg-base-100/70 backdrop-blur rounded-2xl shadow-lg p-6" >
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Data Produk</h2>
                        <Link href={'/admin/tambahproduk'} className="btn btn-primary">+ Tambah data</Link>

                    </div>

                    <dialog id="modal_edit_produk" className="modal">
                        <div className="modal-box max-w-4xl">
                            <h3 className="font-bold text-lg mb-4">
                                Edit Produk
                            </h3>
                            <button
                                type="button"
                                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                                onClick={() => document.getElementById('modal_edit_produk').close()}
                            >
                                X
                            </button>

                            <form onSubmit={edit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        placeholder="Nama produk"
                                        className="input input-bordered w-full"
                                        value={data.nama}
                                        onChange={(e) => setData('nama', e.target.value)}
                                        required
                                    />

                                    <select
                                        className="input input-bordered w-full"
                                        value={data.kategori_id}
                                        onChange={(e) => setData('kategori_id', e.target.value)}
                                        required
                                    >
                                        <option value="">Pilih kategori</option>
                                        {kategori.map((item) => (
                                            <option key={item.id} value={item.id}>
                                                {item.kategori}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        className="input input-bordered w-full"
                                        value={data.ukuran}
                                        onChange={(e) => setData('ukuran', e.target.value)}
                                        required
                                    >
                                        <option value="">Pilih Ukuran</option>
                                        <option value="S">S</option>
                                        <option value="M">M</option>
                                        <option value="L">L</option>
                                        <option value="XL">XL</option>
                                    </select>

                                    <input
                                        type="number"
                                        placeholder="Harga Produk"
                                        className="input input-bordered w-full"
                                        value={data.harga}
                                        onChange={(e) => setData('harga', e.target.value)}
                                        required
                                    />

                                    <input
                                        type="number"
                                        placeholder="Diskon"
                                        className="input input-bordered w-full"
                                        value={data.diskon}
                                        onChange={(e) => setData('diskon', e.target.value)}
                                        required
                                    />

                                    <input
                                        type="number"
                                        placeholder="Stok"
                                        className="input input-bordered w-full"
                                        value={data.stok}
                                        onChange={(e) => setData('stok', e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <p className="font-semibold mb-2">Gambar Saat Ini</p>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {selectedProduct?.gambarproduk?.length > 0 ? (
                                            selectedProduct.gambarproduk.map((gambar) => (
                                                <img
                                                    key={gambar.id}
                                                    src={`/storage/${gambar.image}`}
                                                    alt={selectedProduct.nama_produk}
                                                    className="w-20 h-20 object-cover rounded-lg border"
                                                />
                                            ))
                                        ) : (
                                            <span className="text-sm text-gray-400">Tidak ada gambar</span>
                                        )}
                                    </div>

                                    <input
                                        type="file"
                                        multiple
                                        className="file-input file-input-bordered w-full"
                                        onChange={(e) => setData('images', Array.from(e.target.files))}
                                    />
                                </div>

                                <div className="modal-action">
                                    <button type="submit" className="btn btn-primary" disabled={processing}>
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        className="btn"
                                        onClick={() => document.getElementById('modal_edit_produk').close()}
                                    >
                                        Batal
                                    </button>
                                </div>
                            </form>
                        </div>
                    </dialog>

                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Kode</th>
                                    <th>Nama</th>
                                    <th>Kategori</th>
                                    <th>Ukuran</th>
                                    <th>Harga</th>
                                    <th>Diskon</th>
                                    <th>Stok</th>
                                    <th>Image</th>
                                    <th>Opsi</th>
                                </tr>
                            </thead>

                            <tbody>
                                {produk.map((item, index) => (
                                    <tr key={item.id} className="hover">
                                        <td className="font-medium">{index + 1}</td>
                                        <td>{item.kode_produk}</td>
                                        <td>{item.nama_produk}</td>
                                        <td>{item.kategoriproduk.kategori}</td>
                                        <td>{item.ukuran}</td>
                                        <td>{item.harga}</td>
                                        <td>{item.diskon}</td>
                                        <td>{item.stok}</td>
                                        <td>
                                            <div className="flex flex-wrap gap-2">
                                                {item.gambarproduk?.length > 0 ? (
                                                    item.gambarproduk.map((gambar) => (
                                                        <img
                                                            key={gambar.id}
                                                            src={`/storage/${gambar.image}`}
                                                            alt={item.nama_produk}
                                                            className="w-16 h-16 object-cover rounded-lg border"
                                                        />
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-gray-400">Tidak ada gambar</span>
                                                )}
                                            </div>
                                        </td>
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
            </AdminLayout>
        </>
    )
}
