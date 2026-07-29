<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>{{ config('app.name', 'Laravel') }} — My Account</title>

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/portal.tsx'])
    </head>
    <body>
        <div id="portal-root"></div>
    </body>
</html>
