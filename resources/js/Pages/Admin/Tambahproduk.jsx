import AdminLayout from '@/Layouts/AdminLayout'
import React, { useState } from 'react'
import { useForm } from '@inertiajs/react'

export default function Tambahproduk({ kode, kategori, ratios }) {
    const ukuranOptions = ['S', 'M', 'L', 'XL', 'XXL']
    const [ukuranLukisan, setUkuranLukisan] = useState({ lebar: '', tinggi: '' })

    const { data, setData, post, reset, processing, errors } = useForm({
        kode: kode,
        nama: '',
        kategori_id: '',
        ukuran: [],
        ratio: '',
        keterangan: '',
        harga: '',
        diskon: '',
        stok: '',
        image_depan: null,
        image_samping: null,
        image_belakang: null,
    })

    const selectedKategori = kategori.find((item) => item.id == data.kategori_id)
    const isLukisan = selectedKategori?.kategori?.toLowerCase() === 'lukisan'

    const handleChange = (e) => {
        if (e.target.name === 'kategori_id') {
            setData('kategori_id', e.target.value)
            setData('ukuran', [])
            setData('ratio', '')
            setUkuranLukisan({ lebar: '', tinggi: '' })
            return
        }
        setData(e.target.name, e.target.value)
    }

    const handleUkuranChange = (ukuran) => {
        if (data.ukuran.includes(ukuran)) {
            setData('ukuran', data.ukuran.filter((item) => item !== ukuran))
            return
        }
        setData('ukuran', [...data.ukuran, ukuran])
    }

    const handleUkuranLukisan = (field, value) => {
        const next = { ...ukuranLukisan, [field]: value }
        setUkuranLukisan(next)
        if (next.lebar && next.tinggi) {
            setData('ukuran', [`${next.lebar} x ${next.tinggi}`])
        } else {
            setData('ukuran', [])
        }
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

    const simpan = (e) => {
        setData('kode', kode)
        e.preventDefault()
        post('/admin/tambahproduk', {
            forceFormData: true,
            onSuccess: () => {
                reset()
            }
        })
    }

    const ImageUpload = ({ field, label, desc }) => {
        const file = data[field]
        return (
            <div>
                <p className="text-sm font-semibold mb-1">{label}</p>
                <p className="text-xs text-base-content/60 mb-2">{desc}</p>
                {file ? (
                    <div className="group relative h-36 w-full overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-sm">
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
                    <label className="flex min-h-28 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-base-300 bg-base-100/50 px-4 text-center text-sm text-base-content/60 hover:border-primary hover:bg-primary/5">
                        <i className="fas fa-cloud-upload-alt text-xl text-base-content/40"></i>
                        <span className="font-semibold">Klik pilih gambar</span>
                        <input type="file" accept="image/jpeg,image/png,image/jpg" onChange={(e) => handleImageChange(field, e)} className="hidden" />
                    </label>
                )}
                {errors[field] && <p className="mt-1 text-sm text-red-500">{errors[field]}</p>}
            </div>
        )
    }

    return (
        <AdminLayout>
            <form onSubmit={simpan}>
                <div className="bg-base-100/70 backdrop-blur rounded-2xl shadow-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Tambah Produk</h2>
                    </div>

                    <div className='grid grid-cols-2 gap-3'>
                        <div className="bg-base-100/70 rounded-2xl p-6">
                            <div className='grid grid-cols-2 gap-2'>
                                <input name="kode" className='input input-bordered mb-3' placeholder='Kode' value={kode} />
                                <input name="nama" onChange={handleChange} className='input input-bordered mb-3' placeholder='Nama produk' value={data.nama} required />
                                <select name="kategori_id" onChange={handleChange} className='input input-bordered mb-3' value={data.kategori_id} required>
                                    <option value="">Pilih kategori</option>
                                    {kategori.map((item) => (
                                        <option key={item.id} value={item.id}>{item.kategori}</option>
                                    ))}
                                </select>
                                {isLukisan && (
                                    <select name="ratio" onChange={handleChange} className='input input-bordered mb-3' value={data.ratio}>
                                        <option value="">Pilih ratio</option>
                                        {ratios.map((item) => (
                                            <option key={item.id} value={item.ratio}>{item.ratio}</option>
                                        ))}
                                    </select>
                                )}

                                <div className="col-span-2 mb-3">
                                    {isLukisan ? (
                                        <>
                                            <p className="font-semibold mb-2">Ukuran Lukisan (cm)</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input type="number" min="0" placeholder="Lebar (cm)" className="input input-bordered" value={ukuranLukisan.lebar} onChange={(e) => handleUkuranLukisan('lebar', e.target.value)} required />
                                                <input type="number" min="0" placeholder="Tinggi (cm)" className="input input-bordered" value={ukuranLukisan.tinggi} onChange={(e) => handleUkuranLukisan('tinggi', e.target.value)} required />
                                            </div>
                                            <p className="text-xs text-base-content/60 mt-1">Contoh: Lebar 30 cm x Tinggi 40 cm</p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="font-semibold mb-2">Ukuran Baju</p>
                                            <div className="flex flex-wrap gap-2">
                                                {ukuranOptions.map((ukuran) => (
                                                    <label key={ukuran} className={`cursor-pointer rounded-lg border px-4 py-2 text-sm font-semibold ${data.ukuran.includes(ukuran) ? 'border-primary bg-primary text-white' : 'border-base-300 bg-base-100'}`}>
                                                        <input type="checkbox" className="hidden" checked={data.ukuran.includes(ukuran)} onChange={() => handleUkuranChange(ukuran)} />
                                                        {ukuran}
                                                    </label>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>

                                <input type="number" name="harga" onChange={handleChange} className='input input-bordered mb-3' placeholder='Harga Produk' value={data.harga} required />
                                <input type="number" name="diskon" onChange={handleChange} className='input input-bordered mb-3' placeholder='Diskon' value={data.diskon} required />
                                <input type="number" name="stok" onChange={handleChange} className='input input-bordered mb-3 col-span-2' placeholder='Stok' value={data.stok} required />
                                <textarea name="keterangan" onChange={handleChange} className="textarea textarea-bordered col-span-2 min-h-32" placeholder="Keterangan produk" value={data.keterangan} required></textarea>
                            </div>
                        </div>

                        <div className="bg-base-100/70 rounded-2xl p-6">
                            <h3 className="font-semibold mb-3">Upload Gambar</h3>
                            <p className="mb-3 text-xs text-base-content/60">Format JPG/PNG. Maks 2MB per gambar. Wajib upload gambar depan.</p>
                            <div className="space-y-4">
                                <ImageUpload field="image_depan" label="Gambar Depan" desc="Tampak depan baju" />
                                <ImageUpload field="image_samping" label="Gambar Samping" desc="Tampak samping baju (opsional)" />
                                <ImageUpload field="image_belakang" label="Gambar Belakang" desc="Tampak belakang baju (opsional)" />
                            </div>
                            <button className="btn btn-primary mt-5" disabled={processing}>
                                <i className='fas fa-file'></i> Simpan Produk
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </AdminLayout>
    )
}
