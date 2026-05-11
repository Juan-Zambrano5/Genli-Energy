<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Genlienergy extends Model
{
    protected $table = 'registro';
    protected $primaryKey = 'idRegistro';
    protected $guarded = [];
    public $timestamps = false;

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->fecha)) {
                $model->fecha = now();
            }
            $model->updated_at = now();
        });

        static::updating(function ($model) {
            $model->updated_at = now();
        });
    }
}