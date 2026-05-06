import { Head, useForm, usePage } from '@inertiajs/react'
import React, { useEffect } from 'react'
import Swal from 'sweetalert2'

export default function LoginPengguna() {
    const { flash } = usePage().props
    const { data, setData, post, processing, errors } = useForm({
        username: '',
        password: '',
    })

    useEffect(() => {
        if (flash?.success || flash?.error) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: flash.success ? 'success' : 'error',
                title: flash.success || flash.error,
                showConfirmButton: false,
                timer: 2400,
                timerProgressBar: true,
            });
        }
    }, [flash?.success, flash?.error]);

    const submit = (e) => {
        e.preventDefault();
        post('/login');
    }

    return (
        <>
            <Head title="Login Admin" />

            <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
                <div className="w-full max-w-md bg-base-100 rounded-2xl shadow-xl border border-base-300 p-8">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-base-content">Login Admin</h1>
                        <p className="text-sm text-base-content/60 mt-1">
                            Masuk menggunakan username dan password pengguna.
                        </p>
                    </div>

                    {errors.username && (
                        <div className="alert alert-error mb-4">
                            <span>{errors.username}</span>
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        <label className="form-control">
                            <div className="label">
                                <span className="label-text font-semibold">Username</span>
                            </div>
                            <input
                                type="text"
                                className="input input-bordered w-full"
                                placeholder="Masukkan username"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                autoFocus
                                required
                            />
                        </label>

                        <label className="form-control">
                            <div className="label">
                                <span className="label-text font-semibold">Password</span>
                            </div>
                            <input
                                type="password"
                                className="input input-bordered w-full"
                                placeholder="Masukkan password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />
                        </label>

                        <button type="submit" className="btn btn-primary w-full" disabled={processing}>
                            {processing ? 'Memproses...' : 'Login'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    )
}
