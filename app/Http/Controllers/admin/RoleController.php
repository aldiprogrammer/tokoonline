<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoleController extends Controller
{
    function index()
    {
        $role = Role::all();
        return Inertia::render('Admin/Role', compact('role'));
    }

    function store(Request $request)
    {
        $rl = new Role();
        $rl->role = $request->role;
        $rl->save();
        return redirect()->back()->with('success', 'Data berhasil ditambah');
    }

    function update(Request $request, $id)
    {
        $rl = Role::find($id);
        $rl->role = $request->role;
        $rl->save();
        return redirect()->back()->with('success', 'Data berhasil diubah');
    }

    function delete($id)
    {
        $rl = Role::find($id);
        $rl->delete();
        return redirect()->back()->with('success', 'Data berhasil dihapus');
    }
}
