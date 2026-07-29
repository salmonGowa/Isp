<?php

namespace App\Domain\Shared\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class TenantScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        $tenantId = config('tenancy.default_id');

        $builder->where(function (Builder $query) use ($model, $tenantId) {
            $query->where($model->qualifyColumn('tenant_id'), $tenantId)
                ->orWhereNull($model->qualifyColumn('tenant_id'));
        });
    }
}
