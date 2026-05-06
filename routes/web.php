<?php

use App\Http\Controllers\admin\DashboardController;
use App\Http\Controllers\admin\KategoriController;
use App\Http\Controllers\admin\PenggunaController;
use App\Http\Controllers\admin\ProdukCotroller;
use App\Http\Controllers\admin\RoleController;
use App\Http\Controllers\App\CartController;
use App\Http\Controllers\App\CustomerController;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\Auth\LoginUserController;
use App\Http\Controllers\Auth\PenggunaLoginController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::get('/', [CustomerController::class, 'index'])->name('toko');
Route::get('/toko', [CustomerController::class, 'index'])->name('app.toko');
Route::get('/produk/{slug}', [CustomerController::class, 'detail'])->name('app.produk.detail');
Route::get('/loginuser', [LoginUserController::class, 'index'])->name('login.user');
Route::post('/logoutuser', [LoginUserController::class, 'logout'])->name('logout.user');
Route::get('/auth/google', [GoogleController::class, 'redirect'])->name('google.redirect');
Route::get('/auth/callback', [GoogleController::class, 'callback'])->name('google.callback');

Route::get('/login', [PenggunaLoginController::class, 'show'])->name('login');
Route::post('/login', [PenggunaLoginController::class, 'login'])->name('login.proses');
Route::post('/logout', [PenggunaLoginController::class, 'logout'])->name('logout');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::post('/cart', [CartController::class, 'store'])->name('cart.store');
    Route::put('/cart/{id}', [CartController::class, 'update'])->name('cart.update');
    Route::delete('/cart/{id}', [CartController::class, 'delete'])->name('cart.delete');
    Route::delete('/cart', [CartController::class, 'clear'])->name('cart.clear');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware('pengguna.session')->group(function () {
    Route::get('/admin/dashboard', [DashboardController::class, 'index'])->name('admin.dashboard');
    Route::get('/admin/kategori', [KategoriController::class, 'index'])->name('admin.kategori');
    Route::post('/admin/kategori', [KategoriController::class, 'store'])->name('store.admin.kategori');
    Route::put('/admin/kategori/{id}', [KategoriController::class, 'update'])->name('update.admin.kategori');
    Route::delete('/admin/kategori/{id}', [KategoriController::class, 'delete'])->name('delete.admin.kategori');

    Route::get('/admin/role', [RoleController::class, 'index'])->name('admin.role');
    Route::post('/admin/role', [RoleController::class, 'store'])->name('store.admin.role');
    Route::put('/admin/role/{id}', [RoleController::class, 'update'])->name('update.admin.role');
    Route::delete('/admin/role/{id}', [RoleController::class, 'delete'])->name('delete.admin.role');

    Route::get('/admin/pengguna', [PenggunaController::class, 'index'])->name('admin.pengguna');
    Route::post('/admin/pengguna', [PenggunaController::class, 'store'])->name('store.admin.pengguna');
    Route::put('/admin/pengguna/{id}', [PenggunaController::class, 'update'])->name('update.admin.pengguna');
    Route::delete('/admin/pengguna/{id}', [PenggunaController::class, 'delete'])->name('delete.admin.pengguna');

    Route::get('/admin/produk', [ProdukCotroller::class, 'index'])->name('admin.produk');
    Route::get('/admin/tambahproduk', [ProdukCotroller::class, 'show'])->name('admin.tambahproduk');
    Route::post('/admin/tambahproduk', [ProdukCotroller::class, 'store'])->name('store.admin.tambahproduk');
    Route::put('/admin/produk/{id}', [ProdukCotroller::class, 'update'])->name('update.admin.produk');
    Route::delete('/admin/produk/{id}', [ProdukCotroller::class, 'delete'])->name('delete.admin.produk');
});







require __DIR__ . '/auth.php';
