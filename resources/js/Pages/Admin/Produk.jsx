import AdminLayout from '@/Layouts/AdminLayout'
import { Link, useForm } from '@inertiajs/react'
import React, { useState, useMemo } from 'react'
import Swal from 'sweetalert2'

export default function Produk({ produk, kategori }) {
    const ukuranOptions = ['S', 'M', 'L', 'XL', 'XXL']
    const { data, setData, post, delete: destroy, reset, processing } = useForm({
        _method: 'put',
        id: 0,
        nama: '',
        kategori_id: '',
        ukuran: [],
        keterangan: '',
        harga: '',
        diskon: '',
        stok: '',
        image_depan: null,
        image_samping: null,
        image_belakang: null,
    })

    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(10)

    const filtered = useMemo(() => {
        if (!search.trim()) return produk
        const q = search.toLowerCase()
        return produk.filter((item) =>
            item.nama_produk?.toLowerCase().includes(q) ||
            item.kode_produk?.toLowerCase().includes(q) ||
            item?.kategoriproduk?.kategori?.toLowerCase().includes(q)
        )
    }, [produk, search])

    const totalPages = Math.ceil(filtered.length / perPage)
    const start = (page - 1) * perPage
    const end = start + perPage
    const paginated = filtered.slice(start, end)

    const pageNumbers = () => {
        const pages = []
        const maxVisible = 5
        let startPage = Math.max(1, page - Math.floor(maxVisible / 2))
        let endPage = Math.min(totalPages, startPage + maxVisible - 1)
        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1)
        }
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i)
        }
        return pages
    }

    const getImageByPosisi = (item, posisi) => {
        const found = item.gambarproduk?.find((g) => g.posisi === posisi)
        return found ? `/storage/${found.image}` : null
    }

    const handleEdit = (id) => {
        const item = produk.find((produkItem) => produkItem.id == id)
        setData({
            _method: 'put',
            id: item.id,
            nama: item.nama_produk,
            kategori_id: item.id_kategori,
            ukuran: item.ukuran ? item.ukuran.split(',') : [],
            keterangan: item.keterangan || '',
            harga: item.harga,
            diskon: item.diskon,
            stok: item.stok,
            image_depan: null,
            image_samping: null,
            image_belakang: null,
        })
        document.getElementById('modal_edit_produk').showModal()
    }

    const handleUkuranChange = (ukuran) => {
        if (data.ukuran.includes(ukuran)) {
            setData('ukuran', data.ukuran.filter((item) => item !== ukuran))
            return
        }
        setData('ukuran', [...data.ukuran, ukuran])
    }

    const handleImageChange = (field, e) => {
        const file = e.target.files?.[0]
        if (file) {
            setData(field, file)
        }
    }

    const removeImage = (field) => {
        setData(field, null)
    }

    const edit = (e) => {
        e.preventDefault()
        post('/admin/produk/' + data.id, {
            forceFormData: true,
            onSuccess: () => {
                reset()
                document.getElementById('modal_edit_produk').close()
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
                destroy('/admin/produk/' + id)
            }
        })
    }

    const selectedProduct = produk.find((item) => item.id == data.id)

    const ImageUpload = ({ field, label, posisi }) => {
        const file = data[field]
        const currentSrc = selectedProduct ? getImageByPosisi(selectedProduct, posisi) : null

        return (
            <div>
                <p className="text-sm font-semibold mb-1">{label}</p>
                {currentSrc && !file && (
                    <img src={currentSrc} alt={label} className="h-24 w-full rounded-xl border border-base-300 object-cover shadow-sm mb-2" />
                )}
                {file ? (
                    <div className="group relative h-28 w-full overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-sm">
                        <img src={URL.createObjectURL(file)} alt="" className="h-full w-full object-cover" />
                        <button
                            type="button"
                            onClick={() => removeImage(field)}
                            className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-red-600 text-xs text-white opacity-0 shadow transition-opacity group-hover:opacity-100"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                        <p className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1 text-xs text-white truncate">{file.name}</p>
                    </div>
                ) : (
                    <label className="flex min-h-20 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-base-300 bg-base-100/50 px-4 text-center text-sm text-base-content/60 hover:border-primary hover:bg-primary/5">
                        <i className="fas fa-cloud-upload-alt text-lg text-base-content/40"></i>
                        <span className="font-semibold text-xs">
                            {currentSrc ? 'Klik ganti gambar' : 'Klik pilih gambar'}
                        </span>
                        <input type="file" accept="image/jpeg,image/png,image/jpg" onChange={(e) => handleImageChange(field, e)} className="hidden" />
                    </label>
                )}
            </div>
        )
    }

    return (
        <>
            <AdminLayout>
                <div className="bg-base-100/70 backdrop-blur rounded-2xl shadow-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Data Produk</h2>
                        <Link href={'/admin/tambahproduk'} className="btn btn-primary">+ Tambah data</Link>
                    </div>

                    <dialog id="modal_edit_produk" className="modal">
                        <div className="modal-box max-w-4xl">
                            <h3 className="font-bold text-lg mb-4">Edit Produk</h3>
                            <button
                                type="button"
                                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                                onClick={() => document.getElementById('modal_edit_produk').close()}
                            >X</button>

                            <form onSubmit={edit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="text" placeholder="Nama produk" className="input input-bordered w-full" value={data.nama} onChange={(e) => setData('nama', e.target.value)} required />
                                    <select className="input input-bordered w-full" value={data.kategori_id} onChange={(e) => setData('kategori_id', e.target.value)} required>
                                        <option value="">Pilih kategori</option>
                                        {kategori.map((item) => (
                                            <option key={item.id} value={item.id}>{item.kategori}</option>
                                        ))}
                                    </select>

                                    <div className="col-span-2">
                                        <p className="font-semibold mb-2">Ukuran Baju</p>
                                        <div className="flex flex-wrap gap-2">
                                            {ukuranOptions.map((ukuran) => (
                                                <label key={ukuran} className={`cursor-pointer rounded-lg border px-4 py-2 text-sm font-semibold ${data.ukuran.includes(ukuran) ? 'border-primary bg-primary text-white' : 'border-base-300 bg-base-100'}`}>
                                                    <input type="checkbox" className="hidden" checked={data.ukuran.includes(ukuran)} onChange={() => handleUkuranChange(ukuran)} />
                                                    {ukuran}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <input type="number" placeholder="Harga Produk" className="input input-bordered w-full" value={data.harga} onChange={(e) => setData('harga', e.target.value)} required />
                                    <input type="number" placeholder="Diskon" className="input input-bordered w-full" value={data.diskon} onChange={(e) => setData('diskon', e.target.value)} required />
                                    <input type="number" placeholder="Stok" className="input input-bordered w-full" value={data.stok} onChange={(e) => setData('stok', e.target.value)} required />
                                    <textarea placeholder="Keterangan produk" className="textarea textarea-bordered col-span-2 min-h-32" value={data.keterangan} onChange={(e) => setData('keterangan', e.target.value)} required></textarea>
                                </div>

                                <div>
                                    <p className="font-semibold mb-2">Gambar Produk</p>
                                    <div className="grid grid-cols-3 gap-3">
                                        <ImageUpload field="image_depan" label="Depan" posisi="depan" />
                                        <ImageUpload field="image_samping" label="Samping" posisi="samping" />
                                        <ImageUpload field="image_belakang" label="Belakang" posisi="belakang" />
                                    </div>
                                </div>

                                <div className="modal-action">
                                    <button type="submit" className="btn btn-primary" disabled={processing}>Edit</button>
                                    <button type="button" className="btn" onClick={() => document.getElementById('modal_edit_produk').close()}>Batal</button>
                                </div>
                            </form>
                        </div>
                    </dialog>

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
                                placeholder="Cari produk..."
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
                                    <th>Kode</th>
                                    <th>Nama</th>
                                    <th>Kategori</th>
                                    <th>Ukuran</th>
                                    <th>Ratio</th>
                                    <th>Keterangan</th>
                                    <th>Harga</th>
                                    <th>Diskon</th>
                                    <th>Stok</th>
                                    <th>Image</th>
                                    <th>Opsi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.length > 0 ? (paginated.map((item, index) => {
                                    const depan = getImageByPosisi(item, 'depan')
                                    return (
                                        <tr key={item.id} className="hover">
                                            <td className="font-medium">{start + index + 1}</td>
                                            <td>{item.kode_produk}</td>
                                            <td>{item.nama_produk}</td>
                                            <td>{item?.kategoriproduk?.kategori || ''}</td>
                                            <td>
                                                <div className="flex flex-wrap gap-1">
                                                    {item.ukuran?.split(',').map((ukuran) => (
                                                        <span key={ukuran} className="badge badge-outline">{ukuran}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td>{item.ratio || '-'}</td>
                                            <td className="max-w-48 truncate">{item.keterangan}</td>
                                            <td>{item.harga}</td>
                                            <td>{item.diskon}</td>
                                            <td>{item.stok}</td>
                                            <td>
                                                <div className="flex -space-x-2">
                                                    {['depan', 'samping', 'belakang'].map((pos) => {
                                                        const src = getImageByPosisi(item, pos)
                                                        return src ? (
                                                            <img key={pos} src={src} alt={pos} className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-sm" title={pos} />
                                                        ) : null
                                                    })}
                                                    {!depan && <span className="text-sm text-gray-400">Tidak ada</span>}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex gap-2">
                                                    <button className="btn btn-error btn-sm" onClick={() => hapus(item.id)}>Hapus</button>
                                                    <button className="btn btn-success btn-sm" onClick={() => handleEdit(item.id)}>Edit</button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })) : (
                                    <tr>
                                        <td colSpan={12} className="text-center py-8 text-base-content/50">
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
            </AdminLayout>
        </>
    )
}
