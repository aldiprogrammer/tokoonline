import AdminLayout from '@/Layouts/AdminLayout'
import React from 'react'
import { useForm } from '@inertiajs/react'

export default function Tambahproduk({ kode, kategori }) {
    const ukuranOptions = ['S', 'M', 'L', 'XL', 'XXL']

    const { data, setData, post, reset, processing, errors } = useForm({
        kode: kode,
        nama: '',
        kategori_id: '',
        ukuran: [],
        keterangan: '',
        harga: '',
        diskon: '',
        stok: '',
        images: [],
    })


    const handleChange = (e) => {
        setData(e.target.name, e.target.value);
    };

    const handleUkuranChange = (ukuran) => {
        if (data.ukuran.includes(ukuran)) {
            setData('ukuran', data.ukuran.filter((item) => item !== ukuran));
            return;
        }

        setData('ukuran', [...data.ukuran, ukuran]);
    };

    const handleImageChange = (e) => {
        setData('images', Array.from(e.target.files));
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
            forceFormData: true,
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

                                <div className="col-span-2 mb-3">
                                    <p className="font-semibold mb-2">Ukuran Baju</p>
                                    <div className="flex flex-wrap gap-2">
                                        {ukuranOptions.map((ukuran) => (
                                            <label key={ukuran} className={`cursor-pointer rounded-lg border px-4 py-2 text-sm font-semibold ${data.ukuran.includes(ukuran) ? 'border-primary bg-primary text-white' : 'border-base-300 bg-base-100'}`}>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={data.ukuran.includes(ukuran)}
                                                    onChange={() => handleUkuranChange(ukuran)}
                                                />
                                                {ukuran}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <input type="number" name="harga" onChange={handleChange}
                                    className='input input-bordered mb-3'
                                    placeholder='Harga Produk' value={data.harga} required />

                                <input type="number" name="diskon" onChange={handleChange}
                                    className='input input-bordered mb-3'
                                    placeholder='Diskon' value={data.diskon} required />

                                <input type="number" name="stok" onChange={handleChange}
                                    className='input input-bordered mb-3 col-span-2'
                                    placeholder='Stok' value={data.stok} required />

                                <textarea
                                    name="keterangan"
                                    onChange={handleChange}
                                    className="textarea textarea-bordered col-span-2 min-h-32"
                                    placeholder="Keterangan produk"
                                    value={data.keterangan}
                                    required
                                ></textarea>

                            </div>
                        </div>

                        {/* FORM IMAGE */}
                        <div className="bg-base-100/70 rounded-2xl p-6">
                            <h3 className="font-semibold mb-3">Upload Gambar</h3>

                            <input
                                type="file"
                                multiple
                                accept="image/jpeg,image/png,image/jpg"
                                onChange={handleImageChange}
                                className="file-input file-input-bordered w-full mb-4" required
                            />
                            {errors.images && (
                                <p className="mb-3 text-sm text-red-500">{errors.images}</p>
                            )}

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
