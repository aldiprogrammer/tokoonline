import AdminLayout from '@/Layouts/AdminLayout'
import React, { useState } from 'react'
import axios from 'axios'
import { useForm } from '@inertiajs/react'

export default function Tambahproduk({ kode, kategori }) {

    const { data, setData, post, put, delete: destroy, reset, processing } = useForm({
        kode: kode,
        nama: '',
        kategori_id: '',
        ukuran: '',
        harga: '',
        diskon: '',
        stok: '',
        image: null,
        images: [],
    })


    const handleChange = (e) => {
        setData(e.target.name, e.target.value);
    };

    const handleImageChange = (e) => {
        setData('images', Array.from(e.target.files));
        setData('image', e.target.files[0]);
    };

    const removeImage = (index) => {
        const newImages = [...data.images];
        newImages.splice(index, 1);
        setData('images', newImages);
    };

    const simpan = (e) => {
        setData('kode', kode);
        e.preventDefault();
        post('/admin/tambahproduk', {
            onSuccess: () => {
                reset();
                console.log('berhsil');
            }
        })
    }



    return (
        <AdminLayout>
            <form onSubmit={simpan}>
                <div className="bg-base-100/70 backdrop-blur rounded-2xl shadow-lg p-6">

                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Tambah Produk</h2>
                    </div>

                    <div className='grid grid-cols-2 gap-3'>

                        {/* FORM PRODUK */}
                        <div className="bg-base-100/70 rounded-2xl p-6">
                            <div className='grid grid-cols-2 gap-2'>

                                <input name="kode"
                                    className='input input-bordered mb-3'
                                    placeholder='Kode' value={kode} />

                                <input name="nama" onChange={handleChange}
                                    className='input input-bordered mb-3'
                                    placeholder='Nama produk' value={data.nama} required />

                                <select name="kategori_id" onChange={handleChange}
                                    className='input input-bordered mb-3' value={data.kategori_id} required>
                                    <option value="">Pilih kategori</option>
                                    {kategori.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.kategori}
                                        </option>
                                    ))}
                                </select>

                                <select name="ukuran" onChange={handleChange}
                                    className='input input-bordered mb-3' value={data.ukuran} required>
                                    <option value="">Pilih Ukuran</option>
                                    <option value="S">S</option>
                                    <option value="M">M</option>
                                    <option value="L">L</option>
                                    <option value="XL">XL</option>
                                </select>

                                <input type="number" name="harga" onChange={handleChange}
                                    className='input input-bordered mb-3'
                                    placeholder='Harga Produk' value={data.harga} required />

                                <input type="number" name="diskon" onChange={handleChange}
                                    className='input input-bordered mb-3'
                                    placeholder='Diskon' value={data.diskon} required />

                                <input type="number" name="stok" onChange={handleChange}
                                    className='input input-bordered mb-3 col-span-2'
                                    placeholder='Stok' value={data.stok} required />

                            </div>
                        </div>

                        {/* FORM IMAGE */}
                        <div className="bg-base-100/70 rounded-2xl p-6">
                            <h3 className="font-semibold mb-3">Upload Gambar</h3>

                            <input
                                type="file"
                                multiple

                                onChange={handleImageChange}
                                className="file-input file-input-bordered w-full mb-4" required
                            />

                            {/* PREVIEW */}
                            <div className="flex flex-wrap gap-2">
                                {data.images.map((file, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt=""
                                            className="w-24 h-24 object-cover rounded-lg border"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded"
                                        >
                                            X
                                        </button>
                                    </div>
                                ))}


                            </div>
                            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-5" disabled={processing}>
                                <i className='fas fa-file'></i>  Simpan Produk
                            </button>
                        </div>



                    </div>
                </div>
            </form>
        </AdminLayout>
    )
}