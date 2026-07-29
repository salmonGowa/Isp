<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>{{ config('app.name', 'Laravel') }} — The operating platform for modern ISPs</title>
        <meta name="description" content="Latticefi unifies subscriber management, billing, network monitoring, and support into one fast, multi-tenant-ready platform for internet service providers.">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/landing.tsx'])
    </head>
    <body>
        <div id="landing-root"></div>
    </body>
</html>
