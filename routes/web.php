<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('landing');
});

Route::get('/admin', function () {
    return view('admin');
});

Route::get('/portal', function () {
    return view('portal');
});
