<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Captive-portal MAC signing secret
    |--------------------------------------------------------------------------
    |
    | When set, the public purchase endpoint requires `signature` =
    | hash_hmac('sha256', strtoupper(mac_address), secret). Configure the
    | router's login page (e.g. MikroTik hotspot login.html) to append it to
    | the redirect so a visitor can't type in someone else's MAC. Leave empty
    | only in local development.
    |
    */

    'mac_signing_secret' => env('HOTSPOT_MAC_SIGNING_SECRET'),

    /*
    | How long an unpaid (pending) purchase blocks a new one for the same MAC.
    */

    'pending_ttl_minutes' => (int) env('HOTSPOT_PENDING_TTL_MINUTES', 30),

];
