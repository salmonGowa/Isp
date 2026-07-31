<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>{{ config('app.name', 'Laravel') }} — Hotspot</title>

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/hotspot.tsx'])
    </head>
    <body>
        <div id="hotspot-root"></div>
    </body>
</html>
