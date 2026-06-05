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

            <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4"
                style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #1a1a2e 70%, #16213e 100%)'
                }}
            >
                {/* Decorative circles */}
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-3xl"></div>
                <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-gradient-to-tr from-cyan-500/10 to-blue-600/10 blur-3xl"></div>
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-indigo-500/5 to-purple-500/5 blur-3xl"></div>

                {/* Grid pattern overlay */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                        backgroundSize: '60px 60px'
                    }}
                ></div>

                <div className="w-full max-w-md relative z-10">
                    {/* Card */}
                    <div className="bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 p-8 md:p-10">
                        {/* Logo / Icon */}
                        <div className="flex justify-center mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <i className="fas fa-store text-white text-2xl"></i>
                            </div>
                        </div>

                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold text-white">Login Admin</h1>
                            <p className="text-sm text-white/50 mt-1">
                                Masuk menggunakan username dan password
                            </p>
                        </div>

                        {errors.username && (
                            <div className="alert alert-error mb-4 bg-red-500/10 border border-red-500/20 text-red-300">
                                <i className="fas fa-exclamation-circle"></i>
                                <span>{errors.username}</span>
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-5">
                            <label className="form-control">
                                <div className="label">
                                    <span className="label-text text-white/70 font-semibold text-xs uppercase tracking-wider">Username</span>
                                </div>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-white/30">
                                        <i className="fas fa-user text-sm"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="input input-bordered w-full pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10"
                                        placeholder="Masukkan username"
                                        value={data.username}
                                        onChange={(e) => setData('username', e.target.value)}
                                        autoFocus
                                        required
                                    />
                                </div>
                            </label>

                            <label className="form-control">
                                <div className="label">
                                    <span className="label-text text-white/70 font-semibold text-xs uppercase tracking-wider">Password</span>
                                </div>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-white/30">
                                        <i className="fas fa-lock text-sm"></i>
                                    </span>
                                    <input
                                        type="password"
                                        className="input input-bordered w-full pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10"
                                        placeholder="Masukkan password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                    />
                                </div>
                            </label>

                            <button type="submit" className="btn w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none shadow-lg shadow-blue-500/20 h-12 text-base font-semibold" disabled={processing}>
                                {processing ? (
                                    <span className="flex items-center gap-2">
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Memproses...
                                    </span>
                                ) : 'Login'}
                            </button>
                        </form>

                        <p className="text-center text-white/20 text-xs mt-8">
                            &copy; {new Date().getFullYear()} Toko Online. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}
