<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Tenant ID
    |--------------------------------------------------------------------------
    |
    | Single-tenant for now, but every core table already carries a nullable
    | tenant_id column and a global scope filters on this value. Multi-tenancy
    | later becomes a matter of resolving this per-request instead of from
    | config, and adding rows to a tenants table rather than new migrations.
    |
    */

    'default_id' => (int) env('TENANCY_DEFAULT_ID', 1),

];
