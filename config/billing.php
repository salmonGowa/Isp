<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Invoice Due Window
    |--------------------------------------------------------------------------
    |
    | Number of days after issuing a recurring invoice before it's due.
    |
    */

    'invoice_due_days' => (int) env('BILLING_INVOICE_DUE_DAYS', 14),

    /*
    |--------------------------------------------------------------------------
    | Suspension Grace Period
    |--------------------------------------------------------------------------
    |
    | Number of days past an invoice's due date before an overdue subscriber
    | is automatically suspended.
    |
    */

    'suspend_grace_days' => (int) env('BILLING_SUSPEND_GRACE_DAYS', 7),

];
