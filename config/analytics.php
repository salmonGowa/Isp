<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Illustrative Metrics
    |--------------------------------------------------------------------------
    |
    | Numbers this system has no honest way to compute — no RADIUS/session
    | accounting integration, no marketing-spend tracking, no customer-survey
    | data. Kept as clearly-labeled constants rather than fabricated from
    | unrelated data, and always returned from the API tagged "illustrative".
    |
    */

    'illustrative' => [
        'active_sessions' => (int) env('ANALYTICS_ILLUSTRATIVE_ACTIVE_SESSIONS', 4390),
        'cac' => (float) env('ANALYTICS_ILLUSTRATIVE_CAC', 41.20),
        'nps' => (int) env('ANALYTICS_ILLUSTRATIVE_NPS', 48),
    ],

];
